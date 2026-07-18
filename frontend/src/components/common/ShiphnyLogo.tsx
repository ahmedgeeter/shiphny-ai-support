import React from 'react'

export function ShiphnyLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="196" width="90" height="7" rx="3.5" fill="#fff" opacity="0.6"/>
      <rect x="130" y="196" width="106" height="7" rx="3.5" fill="#fff" opacity="0.6"/>
      <rect x="20" y="118" width="150" height="78" rx="10" fill="#2D3E50"/>
      <path d="M170 138 L170 196 L230 196 L230 158 L210 138 Z" fill="#E0442E"/>
      <path d="M178 146 L178 168 L220 168 L220 160 L205 146 Z" fill="#B8D4E8" opacity="0.9"/>
      <rect x="225" y="128" width="7" height="18" rx="3.5" fill="#2D3E50"/>
      <rect x="2" y="145" width="40" height="6" rx="3" fill="#2D3E50" opacity="0.5"/>
      <rect x="2" y="160" width="28" height="6" rx="3" fill="#2D3E50" opacity="0.4"/>
      <rect x="2" y="175" width="18" height="6" rx="3" fill="#2D3E50" opacity="0.3"/>
      <circle cx="80" cy="200" r="20" fill="#2D3E50"/>
      <circle cx="80" cy="200" r="10" fill="#F5F5F5"/>
      <circle cx="80" cy="200" r="4" fill="#2D3E50"/>
      <circle cx="190" cy="200" r="20" fill="#2D3E50"/>
      <circle cx="190" cy="200" r="10" fill="#F5F5F5"/>
      <circle cx="190" cy="200" r="4" fill="#2D3E50"/>
      <rect x="68" y="66" width="84" height="68" rx="8" fill="#E0442E"/>
      <rect x="68" y="108" width="84" height="26" fill="#C73A28"/>
      <rect x="104" y="66" width="14" height="68" fill="#fff" opacity="0.25"/>
      <rect x="68" y="94" width="84" height="12" fill="#fff" opacity="0.25"/>
      <ellipse cx="91" cy="56" rx="19" ry="13" fill="#E0442E" transform="rotate(-30 91 56)"/>
      <ellipse cx="131" cy="56" rx="19" ry="13" fill="#E0442E" transform="rotate(30 131 56)"/>
      <circle cx="111" cy="66" r="9" fill="#E0442E"/>
      <path d="M105 40 L117 40 L117 62 L111 56 L105 62 Z" fill="#fff" opacity="0.9"/>
    </svg>
  )
}
