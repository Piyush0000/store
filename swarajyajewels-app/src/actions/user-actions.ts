'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const userSchema = z.object({
  phone: z.string().regex(/^[6789]\d{9}$/),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export async function getUserByPhone(phone: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { addresses: true },
    });
    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function createOrUpdateUser(data: z.infer<typeof userSchema>) {
  try {
    const { phone, email, firstName, lastName } = userSchema.parse(data);

    const user = await prisma.user.upsert({
      where: { phone },
      update: { email, firstName, lastName, isVerified: true },
      create: { phone, email, firstName, lastName, isVerified: true },
    });
    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getUserAddresses(userId: string) {
  try {
    const addresses = await prisma.address.findMany({ where: { userId } });
    return { success: true, data: addresses };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function markUserVerified(phone: string) {
  try {
    const user = await prisma.user.update({
      where: { phone },
      data: { isVerified: true },
    });
    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}