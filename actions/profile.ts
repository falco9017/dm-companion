'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      uiLanguage: true,
      dateFormat: true,
      emailVerified: true,
      password: true,
      createdAt: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      subscriptionPeriodEnd: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; uiLanguage?: string; dateFormat?: string }
) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data,
  })

  revalidatePath('/profile')
  return updated
}
