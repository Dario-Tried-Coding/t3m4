import plugin from 'tailwindcss/plugin'
import animatePlugin from 'tailwindcss-animate'

function withOpacity(color: string) {
  return `hsla(var(${color}), <alpha-value>)`
}

export const shadcnUIPlugin = plugin(
  ({ addBase }) => {
    addBase({
      '*': { '@apply border-border outline-ring/50': {} },
      body: { '@apply bg-background text-foreground': {} },
    })
  },
  {
    theme: {
      extend: {
        borderRadius: {
          lg: 'var(--radius)',
          md: 'calc(var(--radius) - 2px)',
          sm: 'calc(var(--radius) - 4px)',
        },
        colors: {
          background: withOpacity('--background'),
          foreground: withOpacity('--foreground'),
          card: {
            DEFAULT: withOpacity('--card'),
            foreground: withOpacity('--card-foreground'),
          },
          popover: {
            DEFAULT: withOpacity('--popover'),
            foreground: withOpacity('--popover-foreground'),
          },
          primary: {
            DEFAULT: withOpacity('--primary'),
            foreground: withOpacity('--primary-foreground'),
          },
          secondary: {
            DEFAULT: withOpacity('--secondary'),
            foreground: withOpacity('--secondary-foreground'),
          },
          muted: {
            DEFAULT: withOpacity('--muted'),
            foreground: withOpacity('--muted-foreground'),
          },
          accent: {
            DEFAULT: withOpacity('--accent'),
            foreground: withOpacity('--accent-foreground'),
          },
          destructive: {
            DEFAULT: withOpacity('--destructive'),
            foreground: withOpacity('--destructive-foreground'),
          },
          border: withOpacity('--border'),
          input: withOpacity('--input'),
          ring: withOpacity('--ring'),
          chart: {
            '1': withOpacity('--chart-1'),
            '2': withOpacity('--chart-2'),
            '3': withOpacity('--chart-3'),
            '4': withOpacity('--chart-4'),
            '5': withOpacity('--chart-5'),
          },
        },
      },
    },
    plugins: [animatePlugin],
  }
)