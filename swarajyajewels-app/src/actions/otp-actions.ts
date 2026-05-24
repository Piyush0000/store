'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const MAX_OTP_PER_HOUR = 5;
const RESEND_TIMER_SECONDS = 120;

const sendOtpSchema = z.object({
  phone: z.string().regex(/^[6789]\d{9}$/, "Invalid Indian phone number"),
});

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^[6789]\d{9}$/, "Invalid Indian phone number"),
  code: z.string().length(4),
  sessionId: z.string().optional(),
});

function sanitizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  return phone.startsWith("+") ? phone : `+${digits}`;
}

// In-memory store for OTPs (use database in production)
const pendingOtps = new Map<string, { expiresAt: number; sessionId: string }>();

export async function sendOtp(data: unknown) {
  const { phone } = sendOtpSchema.parse(data);
  const formattedPhone = sanitizePhone(phone);
  const cleanPhone = phone.replace(/\D/g, "");

  if (!process.env.TWO_FACTOR_API_KEY) {
    return { success: false, message: "OTP service not configured" };
  }

  // Check rate limit
  const now = Date.now();
  const recent = Array.from(pendingOtps.entries()).filter(
    ([p]) => p === cleanPhone
  );
  if (recent.length >= MAX_OTP_PER_HOUR) {
    return {
      success: false,
      message: "Too many OTP requests. Please try again after an hour.",
    };
  }

  // Clean up expired OTPs
  for (const [p, data] of pendingOtps.entries()) {
    if (data.expiresAt < now) pendingOtps.delete(p);
  }

  try {
    const url = `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${encodeURIComponent(formattedPhone)}/AUTOGEN3/OTP1`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const result = await response.json();

    if (result.Status !== "Success") {
      return {
        success: false,
        message: result.Details || "Failed to send OTP",
      };
    }

    const sessionId = result.Details;

    pendingOtps.set(cleanPhone, {
      sessionId,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return {
      success: true,
      message: "OTP sent successfully",
      sessionId,
      resendTimer: RESEND_TIMER_SECONDS,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to send OTP",
    };
  }
}

export async function verifyOtp(data: unknown) {
  const { phone, code, sessionId } = verifyOtpSchema.parse(data);
  const cleanPhone = phone.replace(/\D/g, "");

  if (!process.env.TWO_FACTOR_API_KEY) {
    return { success: false, message: "OTP service not configured" };
  }

  const pending = pendingOtps.get(cleanPhone);
  if (!pending) {
    return { success: false, message: "No OTP found. Please request a new one." };
  }

  if (pending.expiresAt < Date.now()) {
    pendingOtps.delete(cleanPhone);
    return { success: false, message: "OTP has expired. Please request a new one." };
  }

  const actualSessionId = sessionId || pending.sessionId;

  try {
    const phoneForVerify = `91${cleanPhone}`;
    const url = `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY3/${phoneForVerify}/${code}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const result = await response.json();

    if (result.Status !== "Success") {
      return { success: false, message: result.Details || "Invalid OTP" };
    }

    pendingOtps.delete(cleanPhone);

    return {
      success: true,
      message: "OTP verified successfully",
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to verify OTP" };
  }
}

// ─── Checkout Session ─────────────────────────────────────────────────────────

const SESSION_COOKIE_NAME = "checkout_session_id";
const SESSION_DURATION_MS = 60 * 60 * 1000; // 60 minutes

export async function createSession(phone: string, deviceId?: string): Promise<{ success: boolean }> {
  try {
    const device = deviceId || crypto.randomUUID();

    // Delete any existing sessions for this phone
    await prisma.checkoutSession.deleteMany({
      where: { phone },
    });

    // Create new session with 60 min expiry
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    const session = await prisma.checkoutSession.create({
      data: {
        phone,
        deviceId: device,
        expiresAt,
      },
    });

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
      maxAge: SESSION_DURATION_MS / 1000,
    });

    return { success: true };
  } catch (error) {
    console.error("Create checkout session error:", error);
    return { success: false };
  }
}

export async function validateSession(): Promise<{ valid: boolean; phone?: string }> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
      return { valid: false };
    }

    // Check if session exists and is not expired
    const session = await prisma.checkoutSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.expiresAt < new Date()) {
      cookieStore.delete(SESSION_COOKIE_NAME);
      return { valid: false };
    }

    return {
      valid: true,
      phone: session.phone,
    };
  } catch (error) {
    console.error("Validate checkout session error:", error);
    return { valid: false };
  }
}

export async function deleteSession(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionId) {
      await prisma.checkoutSession.deleteMany({
        where: { id: sessionId },
      });
    }

    cookieStore.delete(SESSION_COOKIE_NAME);
    revalidatePath("/checkout");

    return { success: true };
  } catch (error) {
    console.error("Delete checkout session error:", error);
    return { success: false };
  }
}