import { defineConfig, presetWind3, presetIcons } from "unocss"

export default defineConfig({
  presets: [
    presetWind3(),
    presetIcons({
      scale: 1.2,
    }),
  ],
  shortcuts: {
    "color-base": "color-neutral-800 dark:color-neutral-300",
    "bg-base": "bg-zinc-100 dark:bg-dark-800",
    "card": "bg-white dark:bg-dark-600 rounded-xl shadow-sm",
    "btn": "op50 hover:op85 cursor-pointer transition-all",
  },
})
