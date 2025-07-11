export function SvgDefs() {
  return (
    <svg width='0' height='0' style={{ position: 'absolute', overflow: 'hidden' }}>
      <defs>
        <radialGradient id='logo_gradient' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='translate(26.5 26.5) rotate(45) scale(167.584)'>
          <stop offset='0.4' stopColor="var(--color-fd-background, black)" />
          <stop offset='0.9' stopColor='var(--color-fd-primary, white)' />
        </radialGradient>
      </defs>
    </svg>
  )
}
