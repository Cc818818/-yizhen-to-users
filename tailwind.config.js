/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 中性黑：50 最浅 -> 950 最深。
        // 关键：800 用作"极细描边"，在 950 的底色上几乎是发丝线。
        primary: {
          50: "#F6F5F3",
          100: "#EBE9E5",
          200: "#D5D2CB",
          300: "#B5B1AA",
          400: "#8F8B84",
          500: "#6E6A64",
          600: "#54514C",
          700: "#3B3936",
          800: "#232322",
          900: "#121212",
          950: "#0A0A0B",
        },
        // 暖米白：替代原来的橙色强调色，用于主按钮与标题高亮
        accent: {
          50: "#FDFCF9",
          100: "#FAF7F0",
          200: "#F4EFE3",
          300: "#EDE6D7",
          400: "#E6DDCA",
          500: "#DDD2BB",
          600: "#CFC2A6",
          700: "#A99B80",
          800: "#7B7059",
          900: "#4E463A",
          950: "#2A251D",
        },
      },
      borderRadius: {
        card: "22px",
        pill: "999px",
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
    },
  },
  plugins: [],
};
