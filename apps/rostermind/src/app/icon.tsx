import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="2.5" fill="#a78bfa" />
          <circle cx="5" cy="8" r="1.5" fill="#60a5fa" />
          <circle cx="19" cy="8" r="1.5" fill="#22d3ee" />
          <circle cx="5" cy="16" r="1.5" fill="#818cf8" />
          <circle cx="19" cy="16" r="1.5" fill="#a78bfa" />
          <line x1="12" y1="12" x2="5" y2="8" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.9" />
          <line x1="12" y1="12" x2="19" y2="8" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.9" />
          <line x1="12" y1="12" x2="5" y2="16" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.9" />
          <line x1="12" y1="12" x2="19" y2="16" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.9" />
        </svg>
      </div>
    ),
    { ...size },
  )
}
