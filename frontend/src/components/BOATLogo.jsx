const GOLD = '#D4AF37'
const FONT = "Cinzel, Georgia, serif"

function Wheel({ cx, cy, r }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} stroke={GOLD} strokeWidth="5" fill="none" />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i * 36 * Math.PI) / 180
        const s = Math.sin(a)
        const c = Math.cos(a)
        return (
          <line
            key={i}
            x1={cx + 9 * s}   y1={cy - 9 * c}
            x2={cx + (r - 4) * s} y2={cy - (r - 4) * c}
            stroke={GOLD} strokeWidth="2.5" strokeLinecap="round"
          />
        )
      })}
      <circle cx={cx} cy={cy} r="8" fill={GOLD} />
    </>
  )
}

export default function BOATLogo({ className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 800 240"
      className={className}
      style={{ display: 'block', ...style }}
      aria-label="BOAT"
      role="img"
    >
      {/* Outer ellipse */}
      <ellipse cx="400" cy="120" rx="390" ry="108"
        fill="none" stroke={GOLD} strokeWidth="1.5" opacity="0.5" />

      {/* Left rule + dot */}
      <circle cx="14" cy="120" r="4.5" fill={GOLD} />
      <line x1="20" y1="120" x2="232" y2="120" stroke={GOLD} strokeWidth="1.5" />

      {/* Right rule + dot */}
      <line x1="568" y1="120" x2="780" y2="120" stroke={GOLD} strokeWidth="1.5" />
      <circle cx="786" cy="120" r="4.5" fill={GOLD} />

      {/* B */}
      <text
        x="316" y="158"
        textAnchor="end"
        fontFamily={FONT}
        fontSize="108"
        fontWeight="700"
        fill={GOLD}
      >B</text>

      {/* Bicycle wheel replacing O */}
      <Wheel cx={400} cy={120} r={75} />

      {/* AT */}
      <text
        x="490" y="158"
        textAnchor="start"
        fontFamily={FONT}
        fontSize="108"
        fontWeight="700"
        fill={GOLD}
      >AT</text>
    </svg>
  )
}
