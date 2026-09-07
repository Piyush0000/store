'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { randomInt, randomUUID } from 'crypto';
import { config as loadEnv } from 'dotenv';
import path from 'path';

loadEnv({ path: path.resolve(process.cwd(), '.env.local') });
loadEnv({ path: path.resolve(process.cwd(), '.env') });
loadEnv({ path: path.resolve(process.cwd(), '../orbit_software/backend/.env') });

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
const pendingOtps = new Map<string, { expiresAt: number; sessionId: string; code?: string }>();

const WAPI_OTP_TEMPLATE = 'checkout_otp';
const WAPI_OTP_LANGUAGE = 'en_US';

function wapiConfig() {
  return {
    token: (process.env.WAPI_TOKEN || '').trim(),
    vendorUid: (process.env.WAPI_VENDOR_UID || '').trim(),
    baseUrl: (process.env.WAPI_BASE_URL || 'https://app.wapi.in.net/api').replace(/\/+$/, ''),
  };
}

function formatWapiPhone(phone: string): string {
  const clean = String(phone).replace(/\D/g, '');
  if (clean.length === 10) return `91${clean}`;
  return clean;
}

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
    const url = `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${encodeURIComponent(formattedPhone)}/AUTOGEN3`;
    console.log('[OTP] Send URL:', url.replace(process.env.TWO_FACTOR_API_KEY!, '***'));

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    console.log('[OTP] Send response status:', response.status);
    const result = await response.json();
    console.log('[OTP] Send response:', result);

    if (result.Status !== "Success") {
      return {
        success: false,
        message: result.Details || "Failed to send OTP",
      };
    }

    const sessionId = result.Details;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Store in database (serverless-safe, persists across instances)
    await prisma.otpVerification.create({
      data: {
        phone: cleanPhone,
        sessionId,
        expiresAt,
        verified: false,
      },
    });

    // Also keep in-memory for rate limiting (still useful)
    pendingOtps.set(cleanPhone, {
      sessionId,
      expiresAt: expiresAt.getTime(),
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

export async function sendOtpWhatsApp(data: unknown) {
  const parsed = sendOtpSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: "Please enter a valid 10-digit mobile number" };
  }

  const { phone } = parsed.data;
  const cleanPhone = phone.replace(/\D/g, "");
  const { token, vendorUid, baseUrl } = wapiConfig();

  if (!token || !vendorUid) {
    return { success: false, message: "WhatsApp OTP is not configured (WAPI_TOKEN / WAPI_VENDOR_UID)" };
  }

  const now = Date.now();
  for (const [p, entry] of pendingOtps.entries()) {
    if (entry.expiresAt < now) pendingOtps.delete(p);
  }
  const recent = Array.from(pendingOtps.entries()).filter(([p]) => p === cleanPhone);
  if (recent.length >= MAX_OTP_PER_HOUR) {
    return {
      success: false,
      message: "Too many OTP requests. Please try again after an hour.",
    };
  }

  const code = String(randomInt(1000, 10000));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const sessionId = `whatsapp:${cleanPhone}:${Date.now()}`;

  try {
    const wapiRes = await fetch(`${baseUrl}/${vendorUid}/contact/send-template-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        phone_number: formatWapiPhone(cleanPhone),
        template_name: WAPI_OTP_TEMPLATE,
        template_language: WAPI_OTP_LANGUAGE,
        field_1: code,
        button_0: code,
      }),
      cache: 'no-store',
    });

    const result = await wapiRes.json().catch(() => ({}));
    if (!wapiRes.ok || result?.success === false) {
      const message = result?.message || result?.error || `WhatsApp send failed (${wapiRes.status})`;
      console.error('[OTP] WhatsApp send failed:', message);
      return { success: false, message };
    }

    try {
      await prisma.otpVerification.create({
        data: {
          phone: cleanPhone,
          code,
          sessionId,
          expiresAt,
          verified: false,
        },
      });
    } catch (dbErr) {
      console.warn('[OTP] Could not persist WhatsApp OTP row, using memory:', dbErr);
    }

    pendingOtps.set(cleanPhone, {
      sessionId,
      expiresAt: expiresAt.getTime(),
      code,
    });

    return {
      success: true,
      message: "OTP sent on WhatsApp",
      sessionId,
      channel: 'whatsapp' as const,
      resendTimer: RESEND_TIMER_SECONDS,
    };
  } catch (error: any) {
    console.error('[OTP] WhatsApp send error:', error);
    return {
      success: false,
      message: error.message || "Failed to send WhatsApp OTP",
    };
  }
}

export async function verifyOtp(data: unknown) {
  const { phone, code } = verifyOtpSchema.parse(data);
  const cleanPhone = phone.replace(/\D/g, "");

  const dbOtp = await prisma.otpVerification.findFirst({
    where: {
      phone: cleanPhone,
      expiresAt: { gt: new Date() },
      verified: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  const pending = pendingOtps.get(cleanPhone);
  if (!dbOtp && !pending) {
    return { success: false, message: "No OTP found. Please request a new one." };
  }

  const localCode = dbOtp?.code || pending?.code;
  if (localCode) {
    const localExpires = dbOtp?.expiresAt?.getTime() || pending?.expiresAt;
    if (localExpires && localExpires < Date.now()) {
      if (dbOtp) await prisma.otpVerification.delete({ where: { id: dbOtp.id } });
      pendingOtps.delete(cleanPhone);
      return { success: false, message: "OTP has expired. Please request a new one." };
    }
    if (String(localCode) !== String(code)) {
      return { success: false, message: "Invalid OTP" };
    }
    if (dbOtp) {
      await prisma.otpVerification.update({
        where: { id: dbOtp.id },
        data: { verified: true },
      });
    }
    pendingOtps.delete(cleanPhone);
    return { success: true, message: "OTP verified successfully" };
  }

  if (!process.env.TWO_FACTOR_API_KEY) {
    return { success: false, message: "OTP service not configured" };
  }

  const expiresAt = dbOtp?.expiresAt?.getTime() || pending?.expiresAt;
  if (expiresAt && expiresAt < Date.now()) {
    if (dbOtp) await prisma.otpVerification.delete({ where: { id: dbOtp.id } });
    pendingOtps.delete(cleanPhone);
    return { success: false, message: "OTP has expired. Please request a new one." };
  }

  const phoneForVerify = `91${cleanPhone}`;

  try {
    const url = `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY3/${phoneForVerify}/${code}`;
    console.log('[OTP] Verify URL:', url.replace(process.env.TWO_FACTOR_API_KEY!, '***'));
    console.log('[OTP] Phone for verify:', phoneForVerify);

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    console.log('[OTP] Verify response status:', response.status);
    const result = await response.json();
    console.log('[OTP] Verify response:', result);

    if (result.Status !== "Success") {
      return { success: false, message: result.Details || "Invalid OTP" };
    }

    // Clean up both DB and in-memory
    if (dbOtp) {
      await prisma.otpVerification.update({
        where: { id: dbOtp.id },
        data: { verified: true },
      });
    }
    pendingOtps.delete(cleanPhone);

    return {
      success: true,
      message: "OTP verified successfully",
    };
  } catch (error: any) {
    console.error('[OTP] Verify error:', error);
    return { success: false, message: error.message || "Failed to verify OTP" };
  }
}

// ─── Checkout Session ─────────────────────────────────────────────────────────

const SESSION_COOKIE_NAME = "checkout_session_id";
const SESSION_DURATION_MS = 60 * 60 * 1000; // 60 minutes

export async function createSession(phone: string, deviceId?: string): Promise<{ success: boolean }> {
  try {
    const device = deviceId || randomUUID();

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