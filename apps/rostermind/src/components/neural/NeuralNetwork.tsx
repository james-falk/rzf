'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Node {
  id: number
  x: number
  y: number
  radius: number
  color: string
  pulseDelay: number
  pulseSpeed: number
  vx: number
  vy: number
  label?: string
}

interface Edge {
  from: number
  to: number
  signal: Signal | null
  opacity: number
}

interface Signal {
  progress: number
  speed: number
  color: string
}

interface Props {
  className?: string
  nodeCount?: number
}

const NODE_COLORS = [
  '#60a5fa', // blue
  '#a78bfa', // purple
  '#22d3ee', // cyan
  '#818cf8', // indigo
  '#c084fc', // violet
]

const LABELS = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'FLEX', 'IR']

function dist(a: Node, b: Node) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export function NeuralNetwork({ className = '', nodeCount = 28 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const animFrameRef = useRef<number>(0)
  const nodesRef = useRef<Node[]>([])
  const edgesRef = useRef<Edge[]>([])
  const [ready, setReady] = useState(false)

  const init = useCallback((width: number, height: number) => {
    const nodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 3 + 2,
      color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)]!,
      pulseDelay: Math.random() * 4000,
      pulseSpeed: 2000 + Math.random() * 2000,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      label: Math.random() < 0.25 ? LABELS[Math.floor(Math.random() * LABELS.length)] : undefined,
    }))

    // Build edges: connect nodes within 220px, max 3 edges per node
    const edges: Edge[] = []
    const connectionCount = new Array(nodeCount).fill(0)
    const MAX_DIST = Math.min(width, height) * 0.38
    const MAX_CONN = 4

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (connectionCount[i]! >= MAX_CONN || connectionCount[j]! >= MAX_CONN) continue
        const d = dist(nodes[i]!, nodes[j]!)
        if (d < MAX_DIST) {
          edges.push({
            from: i,
            to: j,
            signal: null,
            opacity: 0.06 + (1 - d / MAX_DIST) * 0.12,
          })
          connectionCount[i]++
          connectionCount[j]++
        }
      }
    }

    nodesRef.current = nodes
    edgesRef.current = edges
    setReady(true)
  }, [nodeCount])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const setSize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      init(canvas.width, canvas.height)
    }

    setSize()
    const ro = new ResizeObserver(setSize)
    ro.observe(canvas)

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    canvas.addEventListener('mousemove', onMouseMove)

    // Randomly fire signals along edges
    const signalInterval = setInterval(() => {
      const edges = edgesRef.current
      const idleEdges = edges.filter((e) => !e.signal)
      const toFire = Math.floor(Math.random() * 3) + 1
      for (let i = 0; i < toFire && idleEdges.length > 0; i++) {
        const idx = Math.floor(Math.random() * idleEdges.length)
        const edge = idleEdges[idx]!
        const node = nodesRef.current[edge.from]
        edge.signal = {
          progress: 0,
          speed: 0.004 + Math.random() * 0.006,
          color: node?.color ?? '#60a5fa',
        }
        idleEdges.splice(idx, 1)
      }
    }, 180)

    let lastTime = 0

    const draw = (time: number) => {
      const dt = Math.min(time - lastTime, 50)
      lastTime = time

      const w = canvas.width
      const h = canvas.height
      const nodes = nodesRef.current
      const edges = edgesRef.current
      const mouse = mouseRef.current

      ctx.clearRect(0, 0, w, h)

      // Move nodes slowly, bounce off walls
      for (const node of nodes) {
        // Mouse repulsion
        const mdx = node.x - mouse.x
        const mdy = node.y - mouse.y
        const md = Math.sqrt(mdx ** 2 + mdy ** 2)
        if (md < 120) {
          const force = (120 - md) / 120 * 0.4
          node.vx += (mdx / md) * force
          node.vy += (mdy / md) * force
        }

        // Dampen
        node.vx *= 0.98
        node.vy *= 0.98

        node.x += node.vx * dt
        node.y += node.vy * dt

        if (node.x < node.radius) { node.x = node.radius; node.vx *= -1 }
        if (node.x > w - node.radius) { node.x = w - node.radius; node.vx *= -1 }
        if (node.y < node.radius) { node.y = node.radius; node.vy *= -1 }
        if (node.y > h - node.radius) { node.y = h - node.radius; node.vy *= -1 }
      }

      // Draw edges
      for (const edge of edges) {
        const a = nodes[edge.from]!
        const b = nodes[edge.to]!

        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)

        const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
        gradient.addColorStop(0, `rgba(99,102,241,${edge.opacity})`)
        gradient.addColorStop(1, `rgba(139,92,246,${edge.opacity})`)
        ctx.strokeStyle = gradient
        ctx.lineWidth = 0.8
        ctx.stroke()

        // Animate signal along edge
        if (edge.signal) {
          const sig = edge.signal
          sig.progress += sig.speed * dt

          const sx = a.x + (b.x - a.x) * sig.progress
          const sy = a.y + (b.y - a.y) * sig.progress

          // Signal head glow
          const sigGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 8)
          sigGrad.addColorStop(0, sig.color + 'ff')
          sigGrad.addColorStop(0.4, sig.color + '99')
          sigGrad.addColorStop(1, sig.color + '00')
          ctx.beginPath()
          ctx.arc(sx, sy, 8, 0, Math.PI * 2)
          ctx.fillStyle = sigGrad
          ctx.fill()

          // Signal trail
          const trailStart = Math.max(0, sig.progress - 0.12)
          const tx = a.x + (b.x - a.x) * trailStart
          const ty = a.y + (b.y - a.y) * trailStart
          const trailGrad = ctx.createLinearGradient(tx, ty, sx, sy)
          trailGrad.addColorStop(0, sig.color + '00')
          trailGrad.addColorStop(1, sig.color + 'cc')
          ctx.beginPath()
          ctx.moveTo(tx, ty)
          ctx.lineTo(sx, sy)
          ctx.strokeStyle = trailGrad
          ctx.lineWidth = 1.5
          ctx.stroke()

          if (sig.progress >= 1) edge.signal = null
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const pulse = (Math.sin((time + node.pulseDelay) / node.pulseSpeed) + 1) / 2
        const glowRadius = node.radius * (2.5 + pulse * 2)

        // Outer glow
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowRadius)
        glow.addColorStop(0, node.color + 'aa')
        glow.addColorStop(1, node.color + '00')
        ctx.beginPath()
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * (0.8 + pulse * 0.4), 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.fill()

        // Mouse proximity highlight
        const md = Math.sqrt((node.x - mouse.x) ** 2 + (node.y - mouse.y) ** 2)
        if (md < 100) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius + 3 + (100 - md) / 20, 0, Math.PI * 2)
          ctx.strokeStyle = node.color + '88'
          ctx.lineWidth = 1
          ctx.stroke()
        }

        // Position label
        if (node.label) {
          ctx.font = `bold ${Math.round(node.radius * 2.2)}px system-ui`
          ctx.fillStyle = node.color + 'cc'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(node.label, node.x, node.y - node.radius * 3)
        }
      }

      animFrameRef.current = requestAnimationFrame(draw)
    }

    animFrameRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      clearInterval(signalInterval)
      ro.disconnect()
      canvas.removeEventListener('mousemove', onMouseMove)
    }
  }, [init, ready])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full ${className}`}
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 1s ease' }}
    />
  )
}
