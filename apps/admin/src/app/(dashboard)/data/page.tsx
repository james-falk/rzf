'use client'

// TODO: Build out the data sources reference page with connection status,
// last sync times, and documentation for each data provider.

export default function DataSourcesPage() {
  const sources = [
    {
      name: 'Sleeper API',
      type: 'Official API',
      status: 'active',
      description: 'Player data, rosters, leagues, trending players, transactions',
      refreshCadence: 'Daily (players), Hourly (trending), Daily (trades)',
      apiKey: false,
      docsUrl: 'https://docs.sleeper.com',
    },
    {
      name: 'FantasyCalc',
      type: 'Free Public API',
      status: 'active',
      description: 'Dynasty and redraft trade values for all NFL players',
      refreshCadence: 'Weekly (Tuesdays)',
      apiKey: false,
      docsUrl: 'https://fantasycalc.com',
    },
    {
      name: 'Fantasy Football Calculator',
      type: 'Free Public API',
      status: 'active',
      description: 'ADP data by format (PPR, Half-PPR, Standard)',
      refreshCadence: 'Weekly (Tuesdays)',
      apiKey: false,
      docsUrl: 'https://fantasyfootballcalculator.com/api',
    },
    {
      name: 'YouTube Data API v3',
      type: 'Google API',
      status: 'active',
      description: 'Fantasy football video content from tracked channels',
      refreshCadence: 'Every 2 hours (10,000 units/day free quota)',
      apiKey: true,
      apiKeyEnvVar: 'YOUTUBE_API_KEY',
      docsUrl: 'https://developers.google.com/youtube/v3',
    },
    {
      name: 'RSS Feeds',
      type: 'RSS/Atom',
      status: 'active',
      description: 'Articles and injury news from fantasy football sites',
      refreshCadence: 'Every 30 minutes',
      apiKey: false,
    },
    {
      name: 'FantasyPros',
      type: 'Key Required',
      status: 'planned',
      description: 'Consensus expert rankings (ECR), ADP aggregation',
      refreshCadence: 'Weekly',
      apiKey: true,
      apiKeyEnvVar: 'FANTASYPROS_API_KEY',
      docsUrl: 'https://api.fantasypros.com/v2/docs',
      notes: 'Request a free API key at api@fantasypros.com',
    },
    {
      name: 'nflverse',
      type: 'Open Source (GitHub)',
      status: 'planned',
      description: 'Play-by-play, EPA, snap counts, advanced stats (1999–present)',
      refreshCadence: 'Weekly',
      apiKey: false,
      docsUrl: 'https://github.com/nflverse/nflverse-data',
      notes: 'Downloads Parquet/CSV files from GitHub Releases',
    },
    {
      name: 'PFF (Pro Football Focus)',
      type: 'Paid API',
      status: 'consideration',
      description: 'Player grades, snap counts, advanced pass/rush metrics',
      refreshCadence: 'Weekly',
      apiKey: true,
      notes: '~$120/yr for PFF+ subscription. Unique grades not available free.',
      docsUrl: 'https://grades.profootballfocus.com',
    },
    {
      name: 'Twitter / X API',
      type: 'Paid API',
      status: 'consideration',
      description: 'Beat reporter injury news (fastest injury source)',
      refreshCadence: 'Real-time',
      apiKey: true,
      apiKeyEnvVar: 'TWITTER_BEARER_TOKEN',
      notes: 'Free tier: 100 reads/month (unusable). Basic: $100/mo.',
      docsUrl: 'https://developer.x.com',
    },
  ]

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    planned: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    consideration: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Data Sources</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Reference for all connected and planned data providers. Manage active sources in{' '}
          <a href="/sources/manager" className="text-white underline underline-offset-2">
            Source Manager
          </a>
          .
        </p>
      </div>

      <div className="space-y-3">
        {sources.map((source) => (
          <div
            key={source.name}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{source.name}</h3>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColors[source.status] ?? ''}`}
                  >
                    {source.status}
                  </span>
                  <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-500">
                    {source.type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-400">{source.description}</p>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-500">
                  <span>Refresh: {source.refreshCadence}</span>
                  {source.apiKeyEnvVar && (
                    <span>
                      Env:{' '}
                      <code className="rounded bg-white/5 px-1 py-0.5 text-zinc-400">
                        {source.apiKeyEnvVar}
                      </code>
                    </span>
                  )}
                  {!source.apiKey && <span>No API key required</span>}
                </div>
                {source.notes && (
                  <p className="mt-1.5 text-xs text-amber-400/80">{source.notes}</p>
                )}
              </div>
              {source.docsUrl && (
                <a
                  href={source.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
                >
                  Docs ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
