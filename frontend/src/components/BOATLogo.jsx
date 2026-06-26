const GOLD = '#D4AF37'

function BicycleWheel({ cx, cy, r }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} strokeWidth="1.5" />
      {[0, 60, 120].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        const dx = r * Math.sin(rad)
        const dy = r * Math.cos(rad)
        return <line key={i} x1={cx + dx} y1={cy - dy} x2={cx - dx} y2={cy + dy} strokeWidth="1" />
      })}
      <circle cx={cx} cy={cy} r="2.5" fill={GOLD} stroke="none" />
    </>
  )
}

export default function BOATLogo({ className = '', style = {} }) {
  return (
    <span
      className={`inline-flex items-center font-bold ${className}`}
      style={{ color: GOLD, gap: '0.05em', lineHeight: 1, ...style }}
    >
      <span>B</span>
      <svg
        viewBox="0 0 100 100"
        width="0.85em"
        height="0.85em"
        fill="none"
        stroke={GOLD}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* O ring */}
        <circle cx="50" cy="50" r="43" strokeWidth="4" />

        {/* Bicycle wheels — outer edge nearly touches inner O ring */}
        <BicycleWheel cx={29} cy={64} r={18} />
        <BicycleWheel cx={71} cy={64} r={18} />

        {/* Rear triangle: seat stay, chain stay, seat tube */}
        <line x1="29" y1="64" x2="37" y2="47" strokeWidth="1.5" />
        <line x1="29" y1="64" x2="50" y2="76" strokeWidth="1.5" />
        <line x1="37" y1="47" x2="50" y2="76" strokeWidth="1.5" />

        {/* Main triangle: top tube, down tube */}
        <line x1="37" y1="47" x2="64" y2="45" strokeWidth="1.5" />
        <line x1="64" y1="45" x2="50" y2="76" strokeWidth="1.5" />

        {/* Fork */}
        <line x1="64" y1="45" x2="71" y2="64" strokeWidth="1.5" />

        {/* Handlebar — stem up then bar across */}
        <line x1="64" y1="45" x2="64" y2="37" strokeWidth="1.5" />
        <line x1="57" y1="37" x2="71" y2="37" strokeWidth="2" />

        {/* Saddle — post up then seat rail */}
        <line x1="37" y1="47" x2="35" y2="37" strokeWidth="1.5" />
        <line x1="27" y1="37" x2="43" y2="37" strokeWidth="2" />
      </svg>
      <span>AT</span>
    </span>
  )
}
