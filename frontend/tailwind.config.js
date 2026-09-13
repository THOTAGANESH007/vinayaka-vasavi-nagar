/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xs: '400px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FBF3E6",
          deep: "#F3E6D0",
        },
        saffron: {
          DEFAULT: "#E07A2C",
          light: "#F0A05A",
          dark: "#C0611A",
        },
        maroon: {
          DEFAULT: "#7A2130",
          deep: "#571622",
          light: "#9A3444",
        },
        gold: {
          DEFAULT: "#C89B45",
          light: "#E0C382",
        },
        ink: "#2B1B14",
      },
      fontFamily: {
        display: ["'Marcellus'", "serif"],
        body: ["'Manrope'", "sans-serif"],
      },
      borderRadius: {
        arch: "50% 50% 0 0",
      },
      backgroundImage: {
        "diya-glow": "radial-gradient(circle at top, rgba(224,122,44,0.18), transparent 60%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        shimmer: "shimmer 1.8s linear infinite",
      },
    },
  },
  plugins: [],
}
