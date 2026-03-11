import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'rgb(10,10,10)' }}>
      {/* Background glow orbs */}
      <div
        className="animate-orb pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgb(220,38,38), transparent)' }}
      />
      <div
        className="animate-orb-reverse pointer-events-none absolute -right-40 bottom-40 h-96 w-96 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgb(239,68,68), transparent)' }}
      />

      <Navbar />

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 py-24 text-center">
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider"
          style={{ borderColor: 'rgba(220,38,38,0.4)', color: 'rgb(220,38,38)', background: 'rgba(220,38,38,0.08)' }}
        >
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'rgb(220,38,38)' }} />
          NFL Data Hub
        </div>

        <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-white md:text-7xl">
          Red Zone{' '}
          <span style={{ color: 'rgb(220,38,38)' }}>Fantasy</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: 'rgb(163,163,163)' }}>
          Every ranking, projection, injury report, and expert take — aggregated, normalized, and
          searchable. Your complete NFL intelligence hub.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/search"
            className="rounded-lg px-6 py-3 font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
            style={{ background: 'rgb(220,38,38)', boxShadow: '0 0 20px rgba(220,38,38,0.3)' }}
          >
            Search Players
          </Link>
          <Link
            href="/sources"
            className="rounded-lg border px-6 py-3 font-semibold text-white transition-all hover:bg-white/5"
            style={{ borderColor: 'rgb(38,38,38)' }}
          >
            Browse Sources
          </Link>
        </div>
      </section>

      {/* Stat bar */}
      <section className="border-y" style={{ borderColor: 'rgb(26,26,26)', background: 'rgb(14,14,14)' }}>
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-neutral-800 md:grid-cols-4">
          {[
            { value: '1,500+', label: 'NFL Players' },
            { value: '25+', label: 'Data Sources' },
            { value: 'Live', label: 'Injury Reports' },
            { value: 'Weekly', label: 'Ranking Updates' },
          ].map(({ value, label }) => (
            <div key={label} className="px-8 py-6 text-center">
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="mt-1 text-sm" style={{ color: 'rgb(115,115,115)' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Category grid */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-2xl font-bold text-white">Browse by Category</h2>
        <p className="mt-2 text-sm" style={{ color: 'rgb(115,115,115)' }}>
          Jump straight to what you need
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group relative overflow-hidden rounded-xl border p-6 transition-all hover:border-transparent"
              style={{
                background: 'rgb(18,18,18)',
                borderColor: 'rgb(38,38,38)',
              }}
            >
              {/* Hover glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 rounded-xl"
                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(220,38,38,0.08), transparent 60%)' }}
              />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                    style={{ background: 'rgba(220,38,38,0.1)', color: 'rgb(220,38,38)' }}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{cat.title}</h3>
                    <p className="text-xs" style={{ color: 'rgb(115,115,115)' }}>{cat.desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* RosterMind CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div
          className="relative overflow-hidden rounded-2xl border p-8 text-center"
          style={{ borderColor: 'rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.05)' }}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(220,38,38,0.15), transparent 70%)' }}
          />
          <div className="relative">
            <div className="mb-2 text-xs font-medium uppercase tracking-widest" style={{ color: 'rgb(220,38,38)' }}>
              Powered by this data
            </div>
            <h3 className="text-2xl font-bold text-white">Meet RosterMind AI</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm" style={{ color: 'rgb(163,163,163)' }}>
              Your personal fantasy football AI — trained on every source in this directory.
              Get personalized lineup advice, waiver wire picks, and trade analysis.
            </p>
            <a
              href="http://localhost:3000"
              className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'rgb(220,38,38)' }}
            >
              Try RosterMind AI →
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

const CATEGORIES = [
  { href: '/search?tab=rankings', icon: '📊', title: 'Rankings', desc: 'Consensus + expert PPR/Half/Standard' },
  { href: '/search?tab=projections', icon: '🎯', title: 'Projections', desc: 'Week-by-week stat projections' },
  { href: '/search?tab=news', icon: '📰', title: 'Injury & News', desc: 'Beat reporters, official reports' },
  { href: '/search?tab=analysis', icon: '🔬', title: 'Expert Analysis', desc: 'Articles, videos, deep dives' },
  { href: '/search?tab=trending', icon: '🔥', title: 'Trending', desc: 'Most-added & talked-about players' },
  { href: '/sources', icon: '🗂️', title: 'Source Registry', desc: 'All tracked accounts and feeds' },
]
