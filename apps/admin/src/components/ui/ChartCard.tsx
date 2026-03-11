import { cn } from '@/lib/utils'

interface ChartCardProps {
  title: string
  sub?: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export function ChartCard({ title, sub, children, className, action }: ChartCardProps) {
  return (
    <div className={cn('rounded-xl border border-white/10 bg-zinc-900 p-5', className)}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {sub && <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}
