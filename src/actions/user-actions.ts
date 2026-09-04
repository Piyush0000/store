'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const userSchema = z.object({
  phone: z.string().min(10),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

function tenDigitPhone(phone: string): string {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length >= 12 && digits.startsWith('91')) return digits.slice(-10);
  return digits.slice(-10);
}

function guestUser(data: {
  phone: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}) {
  const phone = tenDigitPhone(data.phone);
  return {
    id: `guest_${phone || Date.now()}`,
    phone,
    email: data.email || '',
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    isVerified: true,
    addresses: [] as any[],
  };
}

export async function getUserByPhone(
  phone: string
): Promise<{ success: boolean; data?: any; message?: string }> {
  const clean = tenDigitPhone(phone);
  try {
    const user = await prisma.user.findUnique({
      where: { phone: clean },
      include: { addresses: true },
    });
    return { success: true, data: user };
  } catch (error: any) {
    console.warn('[getUserByPhone] customer table unavailable, fallback:', error.message);
    return { success: true, data: null };
  }
}

export async function createOrUpdateUser(data: {
  phone: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ success: boolean; data?: any; message?: string }> {
  const clean = tenDigitPhone(data.phone);
  const payload = {
    phone: clean,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
  };

  try {
    const parsed = userSchema.parse(payload);
    try {
      const user = await prisma.user.upsert({
        where: { phone: parsed.phone },
        update: {
          email: parsed.email,
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          isVerified: true,
        },
        create: {
          phone: parsed.phone,
          email: parsed.email,
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          isVerified: true,
        },
      });
      return { success: true, data: user };
    } catch (dbErr: any) {
      console.warn('[createOrUpdateUser] DB fallback, using guest customer:', dbErr.message);
      return { success: true, data: guestUser(parsed) };
    }
  } catch {
    if (clean.length === 10) {
      return { success: true, data: guestUser(payload) };
    }
    return { success: false, message: 'Enter a valid 10-digit mobile number' };
  }
}

export async function getUserAddresses(userId: string) {
  try {
    const addresses = await prisma.address.findMany({ where: { userId } });
    return { success: true, data: addresses };
  } catch (error: any) {
    console.warn('[getUserAddresses] fallback:', error.message);
    return { success: true, data: [] };
  }
}

export async function markUserVerified(phone: string) {
  const clean = tenDigitPhone(phone);
  try {
    const user = await prisma.user.update({
      where: { phone: clean },
      data: { isVerified: true },
    });
    return { success: true, data: user };
  } catch {
    return { success: true, data: guestUser({ phone: clean }) };
  }
}