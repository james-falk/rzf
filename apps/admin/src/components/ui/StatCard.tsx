import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

const variantStyles = {
  default: { card: 'border-white/10', value: 'text-white' },
  success: { card: 'border-emerald-500/30', value: 'text-emerald-400' },
  warning: { card: 'border-yellow-500/30', value: 'text-yellow-400' },
  danger: { card: 'border-red-500/40', value: 'text-red-400' },
}

export function StatCard({ label, value, sub, variant = 'default' }: StatCardProps) {
  const styles = variantStyles[variant]
  return (
    <div className={cn('rounded-xl border bg-zinc-900 p-5', styles.card)}>
      <p className="mb-1 text-xs text-zinc-400">{label}</p>
      <p className={cn('text-3xl font-bold tabular-nums', styles.value)}>{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
    </div>
  )
}
