import type { Context } from 'grammy'

export const DEVOPS_COMMANDS = ['/status', '/logs', '/deploy', '/prs', '/build']

interface RenderService {
  suspended?: string
  state?: string
}

interface RenderLogEntry {
  message: string
  timestamp?: string
}

interface GitHubPR {
  number: number
  title: string
  user?: { login: string }
  html_url: string
  head?: { ref: string }
}

export async function handleDevops(ctx: Context, text: string): Promise<void> {
  const parts = text.trim().split(/\s+/)
  const command = parts[0]?.toLowerCase() ?? ''
  const arg = parts[1]?.toLowerCase()

  const RENDER_API_KEY = process.env.RENDER_API_KEY ?? ''
  const RENDER_SERVICE_ID_API = process.env.RENDER_SERVICE_ID_API ?? ''
  const RENDER_SERVICE_ID_WORKER = process.env.RENDER_SERVICE_ID_WORKER ?? ''
  const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN ?? ''
  const GITHUB_REPO = process.env.GITHUB_REPO ?? ''

  await ctx.reply('⏳ Fetching...')

  try {
    switch (command) {
      case '/status': {
        const services = [
          { id: RENDER_SERVICE_ID_API, name: 'API' },
          { id: RENDER_SERVICE_ID_WORKER, name: 'Worker' },
        ].filter((s) => s.id)

        if (!services.length) {
          await ctx.reply('No service IDs configured. Set RENDER_SERVICE_ID_API and RENDER_SERVICE_ID_WORKER in .env')
          return
        }

        const results = await Promise.all(
          services.map(async ({ id, name }) => {
            const res = await fetch(`https://api.render.com/v1/services/${id}`, {
              headers: { Authorization: `Bearer ${RENDER_API_KEY}`, Accept: 'application/json' },
            })
            if (!res.ok) return `${name}: ❓ (HTTP ${res.status})`
            const data = (await res.json()) as { service?: RenderService }
            const svc = data.service ?? (data as unknown as RenderService)
            if (svc.suspended === 'suspended') return `${name}: ⏸ Suspended`
            if (svc.state === 'available') return `${name}: ✅ Live`
            return `${name}: ⚠️ ${svc.state ?? 'Unknown'}`
          }),
        )

        await ctx.reply(`*Service Status:*\n${results.join('\n')}`, { parse_mode: 'Markdown' })
        break
      }

      case '/logs': {
        const serviceId = arg === 'worker' ? RENDER_SERVICE_ID_WORKER : RENDER_SERVICE_ID_API
        const serviceName = arg === 'worker' ? 'Worker' : 'API'

        if (!serviceId) {
          await ctx.reply(
            `No service ID configured for ${serviceName}. Set RENDER_SERVICE_ID_${(arg ?? 'api').toUpperCase()} in .env`,
          )
          return
        }

        const res = await fetch(
          `https://api.render.com/v1/services/${serviceId}/logs?limit=50&direction=backward`,
          { headers: { Authorization: `Bearer ${RENDER_API_KEY}`, Accept: 'application/json' } },
        )

        if (!res.ok) {
          await ctx.reply(`❌ Render API error: ${res.status} ${res.statusText}`)
          return
        }

        const data = (await res.json()) as RenderLogEntry[] | { logs?: RenderLogEntry[] }
        const entries = Array.isArray(data) ? data : (data as { logs?: RenderLogEntry[] }).logs ?? []
        const lines = entries
          .slice(-30)
          .map((l) => l.message ?? '')
          .join('\n')
          .slice(0, 3500)

        await ctx.reply(
          `📋 *${serviceName} logs (last 30 lines):*\n\`\`\`\n${lines || '(no logs)'}\n\`\`\``,
          { parse_mode: 'Markdown' },
        )
        break
      }

      case '/deploy':
      case '/build': {
        const serviceId = arg === 'worker' ? RENDER_SERVICE_ID_WORKER : RENDER_SERVICE_ID_API
        const serviceName = arg === 'worker' ? 'Worker' : 'API'

        if (!serviceId) {
          await ctx.reply(
            'No service ID configured. Set RENDER_SERVICE_ID_API or RENDER_SERVICE_ID_WORKER in .env',
          )
          return
        }

        const res = await fetch(`https://api.render.com/v1/services/${serviceId}/deploys`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RENDER_API_KEY}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ clearCache: false }),
        })

        const data = (await res.json()) as { id?: string; error?: string }

        if (res.ok) {
          await ctx.reply(
            `🚀 Deploy triggered for *${serviceName}*\nDeploy ID: \`${data.id ?? 'unknown'}\``,
            { parse_mode: 'Markdown' },
          )
        } else {
          await ctx.reply(`❌ Deploy failed (${res.status}): ${data.error ?? JSON.stringify(data)}`)
        }
        break
      }

      case '/prs': {
        if (!GITHUB_REPO || !GITHUB_TOKEN) {
          await ctx.reply(
            'Set GITHUB_REPO (e.g. username/repo-name) and GITHUB_PERSONAL_ACCESS_TOKEN in .env',
          )
          return
        }

        const res = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/pulls?state=open&per_page=10`,
          {
            headers: {
              Authorization: `Bearer ${GITHUB_TOKEN}`,
              'User-Agent': 'telegram-agent',
              Accept: 'application/vnd.github+json',
            },
          },
        )

        if (!res.ok) {
          await ctx.reply(`❌ GitHub API error: ${res.status} ${res.statusText}`)
          return
        }

        const prs = (await res.json()) as GitHubPR[]

        if (!Array.isArray(prs) || prs.length === 0) {
          await ctx.reply('No open pull requests.')
          return
        }

        const list = prs
          .map((pr) => `• #${pr.number}: *${pr.title}* (${pr.user?.login ?? 'unknown'})`)
          .join('\n')

        await ctx.reply(`🔀 *Open Pull Requests:*\n${list}`, { parse_mode: 'Markdown' })
        break
      }

      default:
        await ctx.reply(`Unknown devops command: ${command}. Try /help`)
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await ctx.reply(`❌ Error: ${msg}`)
  }
}
