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
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          {/* Shield shape */}
          <path
            d="M12 2L4 6v5c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V6L12 2z"
            fill="#3b82f6"
            fillOpacity="0.25"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Lock body */}
          <rect x="9" y="11" width="6" height="5" rx="1" fill="#60a5fa" />
          {/* Lock shackle */}
          <path
            d="M10 11V9a2 2 0 0 1 4 0v2"
            stroke="#93c5fd"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size },
  )
}
