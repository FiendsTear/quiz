/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        "auto-200": "repeat(auto-fill, 200px)",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
