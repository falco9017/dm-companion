'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'

export async function toggleSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  })

  if (!user) throw new Error('User not found')

  if (user.subscriptionTier === 'basic') {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: 'pro',
        subscriptionStatus: 'active',
      },
    })
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: 'basic',
        subscriptionStatus: null,
      },
    })
  }

  revalidatePath('/profile')
  revalidatePath('/pricing')
  revalidatePath('/campaigns')
}
