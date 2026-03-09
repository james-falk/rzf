export default function BillingPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Billing</h1>
      <p className="mb-8 text-zinc-400">Manage your subscription</p>

      <div className="max-w-lg rounded-xl border border-white/10 bg-zinc-900 p-8">
        <div className="mb-6">
          <p className="mb-1 text-sm text-zinc-400">Current Plan</p>
          <p className="text-2xl font-bold text-white">Free</p>
          <p className="text-sm text-zinc-500">2 lifetime analyses included</p>
        </div>

        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-5">
          <h3 className="mb-1 text-base font-semibold text-white">Upgrade to Pro</h3>
          <p className="mb-3 text-sm text-zinc-400">50 agent runs per month + all upcoming agents</p>
          <p className="mb-4 text-3xl font-bold text-white">
            $20<span className="text-base font-normal text-zinc-400">/month</span>
          </p>
          {/* Phase 2: Replace with real Stripe Checkout button */}
          <button
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-red-600 py-3 text-sm font-semibold text-white opacity-50"
          >
            Coming Soon — Stripe Integration (Phase 2)
          </button>
          <p className="mt-2 text-center text-xs text-zinc-500">
            Contact us to upgrade manually during beta
          </p>
        </div>

        <p className="text-center text-sm text-zinc-500">
          Need help? Contact{' '}
          <a href="mailto:support@redzonefantasy.com" className="text-red-400 hover:text-red-300">
            support@redzonefantasy.com
          </a>
        </p>
      </div>
    </div>
  )
}
