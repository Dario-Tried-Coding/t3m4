export function SvgDefs() {
  return (
    <svg width='0' height='0' style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id='logo-gradient' x1='0' y1='0' x2='155' y2='155' gradientUnits='userSpaceOnUse'>
          <stop stopColor='currentColor' />
          <stop offset='0.754808' stopColor='var(--color-fd-primary)' />
        </linearGradient>
      </defs>
    </svg>
  )
}