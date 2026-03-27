/** Serializable source row for the registry grid (client-safe). */
export type SourceRegistryRow = {
  id: string
  name: string
  platform: string
  feedUrl: string
  avatarUrl: string | null
  isActive: boolean
  itemCount: number
  featured: boolean
  partnerTier: string | null
  lastFetchedAt: string | null
}
