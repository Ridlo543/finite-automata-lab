/** @type {import('tailwindcss').Config} */

const em = (px) => `${px / 16}em`;
const rem = (px) => ({ [px]: `${px / 16}rem` });
const px = (num) => ({ [num]: `${num}px` });

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['"Nunito Variable"', "sans-serif"],
      },
      colors: {
        white: "#ffffff",
        violet: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
      },
      spacing: {
        "8xl": "96rem",
        "9xl": "128rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      borderWidth: {
        ...px(2),
        ...px(3),
        ...px(5),
      },
      fontSize: {
        ...rem(12),
        ...rem(13),
      },
      screens: {
        tyd: { max: em(399) },
        ty: em(400),
        xsd: { max: em(599) },
        xs: em(600),
        smd: { max: em(767) },
        sm: em(768),
        mdd: { max: em(959) },
        md: em(960),
        lgd: { max: em(1023) },
        lg: em(1024),
        xld: { max: em(1279) },
        xl: em(1280),
      },
    },
  },
  plugins: [require("daisyui")],
};
