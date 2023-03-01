/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        "auto-200": "repeat(auto-fill, 200px)",
      },
      animation: {
        countdown: "countdown 15s ease forwards"
      },
      keyframes: {
        countdown: {
          "0%": {
            "box-shadow":
              "60px -60px 0 2px green, -60px -60px 0 2px green, -60px 60px 0 2px green, 60px 60px 0 2px green, 0 0 0 2px #E94E3D",
          },
          "25%": {
            "box-shadow":
              "0 -125px 0 2px green, -60px -60px 0 2px green, -60px 60px 0 2px green, 60px 60px 0 2px green, 0 0 0 2px #fff",
          },
          "50%": {
            "box-shadow":
              "0 -125px 0 2px green, -125px 0px 0 2px green, -60px 60px 0 2px green, 60px 60px 0 2px green, 0 0 0 2px #fff",
          },
          "75%": {
            "box-shadow":
              "0 -125px 0 2px green, -125px 0px 0 2px green, 0px 125px 0 2px green, 60px 60px 0 2px green, 0 0 0 2px #fff",
          },
          "100%": {
            "box-shadow":
              "0 -125px 0 2px green, -125px 0px 0 2px green, 0px 125px 0 2px green, 120px 40px 0 2px green, 0 0 0 2px #fff",
          },
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
