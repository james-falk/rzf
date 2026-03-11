import { cn } from '@/lib/utils'

type BadgeVariant = 'healthy' | 'stale' | 'inactive' | 'done' | 'failed' | 'running' | 'queued' | 'free' | 'paid' | 'default' | 'success' | 'warning'

const badgeStyles: Record<BadgeVariant, string> = {
  healthy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  stale: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  inactive: 'bg-zinc-700/50 text-zinc-400 border-zinc-600/20',
  done: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  failed: 'bg-red-500/15 text-red-400 border-red-500/20',
  running: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  queued: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  free: 'bg-zinc-700/50 text-zinc-400 border-zinc-600/20',
  paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  default: 'bg-zinc-700/50 text-zinc-300 border-zinc-600/20',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  warning: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
}

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium', badgeStyles[variant])}>
      {children}
    </span>
  )
}
