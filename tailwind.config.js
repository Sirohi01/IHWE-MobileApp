/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ihwe: {
          green: "#23471d",
          greenDark: "#1a3a14",
          greenLight: "#357a38",
          blue: "#061d49",
          blueDark: "#031b47",
        },
        gold: {
          light: "#f5c842",
          DEFAULT: "#ffdd00",
          dark: "#ffa500",
        }
      }
    },
  },
  plugins: [],
}
