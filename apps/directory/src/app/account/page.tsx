import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { db } from '@rzf/db'
import Navbar from '@/components/Navbar'
import { brandLogoUrlFromDomain } from '@/lib/brandLogo'
import { SleeperConnect } from './SleeperConnect'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Account — Red Zone Fantasy',
}

export default async function AccountPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect('/sign-in')

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { sleeperProfile: true },
  })

  const sleeperProfile = user?.sleeperProfile
    ? {
        sleeperId: user.sleeperProfile.sleeperId,
        username: user.sleeperProfile.displayName,
        avatarUrl: null as string | null,
      }
    : null

  return (
    <div className="min-h-screen" style={{ background: 'rgb(10,10,10)' }}>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-8 text-2xl font-bold text-white">Account Settings</h1>

        {/* Sleeper Integration */}
        <section
          className="overflow-hidden rounded-xl border"
          style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(14,14,14)' }}
        >
          <div className="border-b px-6 py-4" style={{ borderColor: 'rgb(38,38,38)' }}>
            <div className="flex items-center gap-2">
              {/* Sleeper logo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brandLogoUrlFromDomain('sleeper.com')}
                alt="Sleeper"
                className="h-5 w-5 rounded"
                onError={() => {}}
              />
              <h2 className="text-sm font-semibold text-white">Sleeper Connection</h2>
            </div>
            <p className="mt-1 text-xs" style={{ color: 'rgb(115,115,115)' }}>
              Connect your Sleeper account to power personalized custom feeds based on your rosters.
            </p>
          </div>
          <div className="px-6 py-5">
            <SleeperConnect initial={sleeperProfile} />
          </div>
        </section>
      </main>
    </div>
  )
}
