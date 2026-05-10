import { defineConfig, presetWind3, presetIcons, transformerVariantGroup } from "unocss"

function hex2rgba(hex: string): [number, number, number] | undefined {
  hex = hex.replace(/^#/, "")
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("")
  const n = parseInt(hex, 16)
  if (isNaN(n)) return undefined
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

const allColors: Record<string, Record<number, string>> = {
  red: { 400: "#f87171" },
  blue: { 400: "#60a5fa" },
  green: { 400: "#4ade80" },
  orange: { 400: "#fb923c" },
  yellow: { 400: "#facc15" },
  purple: { 400: "#c084fc" },
  slate: { 400: "#94a3b8" },
  gray: { 400: "#9ca3af" },
  teal: { 400: "#2dd4bf" },
  indigo: { 400: "#818cf8" },
  pink: { 400: "#f472b6" },
  cyan: { 400: "#22d3ee" },
  violet: { 400: "#a78bfa" },
  fuchsia: { 400: "#e879f9" },
  rose: { 400: "#fb7185" },
  emerald: { 400: "#34d399" },
}

export default defineConfig({
  transformers: [transformerVariantGroup()],
  presets: [
    presetWind3(),
    presetIcons({ scale: 1.2 }),
  ],
  rules: [
    [/^sprinkle-(.+)$/, ([_, d]) => {
      const hex = allColors[d]?.[400]
      if (hex) {
        const rgba = hex2rgba(hex)
        if (rgba) {
          return {
            "background-image": `radial-gradient(ellipse 80% 80% at 50% -30%, rgba(${rgba.join(", ")}, 0.3), rgba(255, 255, 255, 0))`,
          }
        }
      }
    }],
  ],
  shortcuts: {
    "color-base": "color-neutral-800 dark:color-neutral-300",
    "bg-base": "bg-zinc-100 dark:bg-dark-800",
    "card": "bg-white dark:bg-dark-600 rounded-xl shadow-sm",
    "btn": "op50 hover:op85 cursor-pointer transition-all",
  },
  safelist: [
    ...Object.keys(allColors).map(k =>
      `bg-${k} color-${k} bg-${k}-500 color-${k}-500 sprinkle-${k}
       dark:bg-${k} dark:color-${k}`.trim().split(/\s+/)).flat(),
  ],
  extendTheme: (theme) => {
    (theme as any).colors.primary = (theme as any).colors.red
    return theme
  },
})
