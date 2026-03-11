import { AppSidebar } from '@/components/AppSidebar'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-6 md:p-10">
        {children}
      </main>
    </div>
  )
}
