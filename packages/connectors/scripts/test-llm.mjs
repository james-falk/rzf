import OpenAI from 'openai'

const key = process.env.OPENAI_API_KEY
if (!key) {
  console.error('OPENAI_API_KEY not set')
  process.exit(1)
}

const client = new OpenAI({ apiKey: key })

console.log('Testing OpenAI gpt-4o-mini...')

const response = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  max_tokens: 60,
  messages: [
    { role: 'system', content: 'You are a fantasy football assistant. Respond in JSON.' },
    { role: 'user', content: 'Grade Patrick Mahomes as a fantasy QB in one word. Respond: {"grade": "...", "reason": "..."}' },
  ],
})

const content = response.choices[0]?.message?.content ?? ''
const tokens = (response.usage?.prompt_tokens ?? 0) + (response.usage?.completion_tokens ?? 0)

console.log(`Response: ${content}`)
console.log(`Tokens used: ${tokens}`)
console.log('OpenAI is working correctly.')
