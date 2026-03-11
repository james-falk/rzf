import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export function formatDuration(ms: number | null): string {
  if (ms === null) return '-'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const PLATFORM_COLORS: Record<string, string> = {
  rss: '#f97316',
  youtube: '#ef4444',
  twitter: '#3b82f6',
  podcast: '#a855f7',
  reddit: '#f59e0b',
  api: '#10b981',
  manual: '#6b7280',
}

export function platformColor(platform: string): string {
  return PLATFORM_COLORS[platform] ?? '#6b7280'
}

const STATUS_COLORS: Record<string, string> = {
  done: '#10b981',
  failed: '#ef4444',
  running: '#3b82f6',
  queued: '#f59e0b',
}

export function statusColor(status: string): string {
  return STATUS_COLORS[status] ?? '#6b7280'
}
