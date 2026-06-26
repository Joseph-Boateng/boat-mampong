const GOLD = '#D4AF37'

const spokes = [
  [20, 17, 20,   3   ],
  [22.6, 18.5, 34.7, 11.5],
  [22.6, 21.5, 34.7, 28.5],
  [20, 23, 20,   37  ],
  [17.4, 21.5,  5.3, 28.5],
  [17.4, 18.5,  5.3, 11.5],
]

export default function BOATLogo({ className = '', style = {} }) {
  return (
    <span
      className={`inline-flex items-center font-bold ${className}`}
      style={{ color: GOLD, gap: '0.05em', lineHeight: 1, ...style }}
    >
      <span>B</span>
      <svg
        viewBox="0 0 40 40"
        width="0.8em"
        height="0.8em"
        fill="none"
        stroke={GOLD}
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="20" cy="20" r="18" strokeWidth="2.5" />
        <circle cx="20" cy="20" r="3" fill={GOLD} stroke="none" />
        {spokes.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1.5" />
        ))}
      </svg>
      <span>AT</span>
    </span>
  )
}
