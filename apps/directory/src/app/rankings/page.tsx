import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Fantasy Football Rankings | Red Zone Fantasy',
  description: 'A curated directory of the best fantasy football ranking tools and sites — redraft, dynasty, DFS, and more.',
}

interface RankingSite {
  name: string
  description: string
  url: string
  badge?: string
  tags?: string[]
}

const SECTIONS: { title: string; description: string; sites: RankingSite[] }[] = [
  {
    title: 'Consensus & Aggregators',
    description: 'Multi-source consensus rankings that blend expert opinions into one reliable list.',
    sites: [
      {
        name: 'FantasyPros',
        description: 'The gold standard for consensus rankings — aggregates hundreds of experts into a single ECR (Expert Consensus Ranking).',
        url: 'https://www.fantasypros.com/nfl/rankings/consensus-cheatsheets.php',
        badge: 'Top Pick',
        tags: ['Redraft', 'Dynasty', 'DFS'],
      },
      {
        name: 'Sleeper Consensus',
        description: 'ADP and consensus rankings directly from Sleeper drafts — reflects real user behavior at scale.',
        url: 'https://sleeper.com/nfl/adp',
        tags: ['Redraft', 'Dynasty'],
      },
      {
        name: 'NFL.com Rankings',
        description: 'Official NFL fantasy rankings updated weekly by NFL staff analysts.',
        url: 'https://fantasy.nfl.com/research/rankings',
        tags: ['Redraft'],
      },
    ],
  },
  {
    title: 'Redraft Rankings',
    description: 'Season-long redraft rankings — best for standard, PPR, and half-PPR leagues.',
    sites: [
      {
        name: 'ESPN Fantasy Rankings',
        description: 'ESPN\'s player rankings with expert projections, updated daily throughout the season.',
        url: 'https://www.espn.com/fantasy/football/story/_/id/29608595/fantasy-football-rankings',
        tags: ['Redraft'],
      },
      {
        name: 'Yahoo Fantasy Rankings',
        description: 'Yahoo\'s weekly rankings and season projections, including rest-of-season (ROS) outlooks.',
        url: 'https://sports.yahoo.com/fantasy/football/rankings/',
        tags: ['Redraft'],
      },
      {
        name: '4for4 Fantasy',
        description: 'Data-driven rankings with strength of schedule overlays, target share, and snap count analysis.',
        url: 'https://www.4for4.com/rankings',
        badge: 'Data-Driven',
        tags: ['Redraft', 'DFS'],
      },
      {
        name: 'The Athletic Rankings',
        description: 'Premium rankings from top NFL writers and fantasy analysts — PPR, standard, and superflex.',
        url: 'https://theathletic.com/fantasy-football/',
        tags: ['Redraft'],
      },
    ],
  },
  {
    title: 'Dynasty Rankings',
    description: 'Long-term keeper and dynasty league rankings — values players by age, ceiling, and career trajectory.',
    sites: [
      {
        name: 'FantasyPros Dynasty',
        description: 'Industry-leading dynasty consensus rankings aggregated from top dynasty analysts.',
        url: 'https://www.fantasypros.com/nfl/rankings/dynasty-overall.php',
        badge: 'Top Pick',
        tags: ['Dynasty'],
      },
      {
        name: 'Dynasty Process',
        description: 'Deep analytical dynasty rankings with trade calculators and value-based tiers.',
        url: 'https://www.dynastyprocess.com/',
        tags: ['Dynasty'],
      },
      {
        name: 'Underdog Dynasty ADP',
        description: 'Real draft ADP from Underdog best ball and dynasty drafts — reflects the market.',
        url: 'https://underdognetwork.com/football',
        tags: ['Dynasty', 'Best Ball'],
      },
      {
        name: 'Domain Fantasy Football',
        description: 'Dynasty rankings, databases, and trade tools. Strong community and Discord.',
        url: 'https://www.youtube.com/@domainfantasyfootball',
        tags: ['Dynasty'],
      },
      {
        name: 'Keep Trade Cut',
        description: 'Community-voted dynasty player values — great for gauging the market on any player.',
        url: 'https://keeptradecut.com/',
        tags: ['Dynasty'],
      },
    ],
  },
  {
    title: 'DFS Rankings',
    description: 'Daily fantasy specific rankings focused on value, ceiling, and game-stack optimization.',
    sites: [
      {
        name: 'FantasyPros DFS',
        description: 'Optimal DFS lineup tools and GPP rankings for DraftKings and FanDuel.',
        url: 'https://www.fantasypros.com/nfl/dfs/salary-analysis.php',
        tags: ['DFS'],
      },
      {
        name: 'RotoGrinders',
        description: 'Professional DFS rankings, ownership projections, and slate breakdowns.',
        url: 'https://rotogrinders.com/rankings/nfl',
        tags: ['DFS'],
      },
      {
        name: 'Establish the Run',
        description: 'Sharp DFS analysis with target share, snap count data, and game theory.',
        url: 'https://www.establishtherun.com/',
        badge: 'Sharp',
        tags: ['DFS', 'Redraft'],
      },
    ],
  },
  {
    title: 'Tools & Calculators',
    description: 'Interactive tools for trade values, draft simulations, and waiver wire analysis.',
    sites: [
      {
        name: 'FantasyPros Trade Analyzer',
        description: 'Compare trade values side-by-side using consensus expert data.',
        url: 'https://www.fantasypros.com/nfl/trade-analyzer/',
        tags: ['Tools'],
      },
      {
        name: 'Pro Football Reference',
        description: 'Historical stats, game logs, and depth charts for detailed player research.',
        url: 'https://www.pro-football-reference.com/',
        tags: ['Tools', 'Stats'],
      },
      {
        name: 'Next Gen Stats',
        description: 'NFL\'s official advanced metrics — separation, time to throw, rushing yards over expected.',
        url: 'https://nextgenstats.nfl.com/',
        tags: ['Tools', 'Stats'],
      },
      {
        name: 'Rotowire Depth Charts',
        description: 'Up-to-date depth charts, injury reports, and player news for all 32 teams.',
        url: 'https://www.rotowire.com/football/depth-charts.php',
        tags: ['Tools'],
      },
    ],
  },
]

const TAG_COLORS: Record<string, string> = {
  Redraft: 'bg-blue-500/10 text-blue-400',
  Dynasty: 'bg-purple-500/10 text-purple-400',
  DFS: 'bg-green-500/10 text-green-400',
  'Best Ball': 'bg-amber-500/10 text-amber-400',
  Tools: 'bg-zinc-700 text-zinc-400',
  Stats: 'bg-zinc-700 text-zinc-400',
  Sharp: 'bg-red-500/10 text-red-400',
}

export default function RankingsPage() {
  return (
    <main className="min-h-screen" style={{ background: 'rgb(10,10,10)' }}>
      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Page header */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <Link href="/" className="text-sm transition-colors" style={{ color: 'rgb(163,163,163)' }}>
              Home
            </Link>
            <span style={{ color: 'rgb(82,82,82)' }}>/</span>
            <span className="text-sm text-white">Rankings</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Fantasy Football Rankings</h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: 'rgb(163,163,163)' }}>
            A curated directory of the best ranking sites and tools — one place to explore all sources without bouncing between tabs. The idea is not to reinvent the wheel, but to make navigating the ecosystem faster.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <div className="mb-4 border-b pb-3" style={{ borderColor: 'rgb(38,38,38)' }}>
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                <p className="mt-0.5 text-sm" style={{ color: 'rgb(115,115,115)' }}>{section.description}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {section.sites.map((site) => (
                  <a
                    key={site.name}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col rounded-xl border p-4 transition-colors"
                    style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(18,18,18)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgb(63,63,63)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgb(38,38,38)' }}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className="font-medium text-white group-hover:text-red-400 transition-colors">
                        {site.name}
                      </span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {site.badge && (
                          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: 'rgb(220,38,38,0.15)', color: 'rgb(220,38,38)' }}>
                            {site.badge}
                          </span>
                        )}
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 opacity-30 group-hover:opacity-60 transition-opacity">
                          <path d="M2 10L10 2M4 2h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <p className="mb-3 text-xs leading-relaxed" style={{ color: 'rgb(115,115,115)' }}>
                      {site.description}
                    </p>
                    {site.tags && (
                      <div className="mt-auto flex flex-wrap gap-1">
                        {site.tags.map((tag) => (
                          <span key={tag} className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TAG_COLORS[tag] ?? 'bg-zinc-700 text-zinc-400'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 rounded-xl border p-5" style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(18,18,18)' }}>
          <p className="text-xs" style={{ color: 'rgb(115,115,115)' }}>
            <span className="font-semibold text-white">Missing a source?</span> Use the feedback button to suggest a ranking site or tool you think should be included. We curate this list based on quality and community reputation.
          </p>
        </div>
      </div>
    </main>
  )
}
