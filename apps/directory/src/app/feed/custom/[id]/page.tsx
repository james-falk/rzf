import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { db } from '@rzf/db'
import Navbar from '@/components/Navbar'
import { CustomFeedViewClient } from './CustomFeedViewClient'

type Props = { params: Promise<{ id: string }> }

export default async function CustomFeedPage({ params }: Props) {
  const { id } = await params
  const { userId: clerkId } = await auth()
  if (!clerkId) notFound()

  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) notFound()

  const feed = await db.customFeed.findFirst({
    where: { id, userId: user.id },
    select: { id: true, name: true },
  })
  if (!feed) notFound()

  return (
    <div className="min-h-screen" style={{ background: 'rgb(10,10,10)' }}>
      <Navbar />
      <CustomFeedViewClient feedId={feed.id} initialName={feed.name} />
    </div>
  )
}
