/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "red-primary": "#ee4d2d",
        errorBackground: "#fff6f7",
        "blue-primary": "#05a",
        "gray-primary": "#dbdbdb",
        "gray-secondary": "rgba(0,0,0,.26)",
        "yellow-primary": "#ffbf00",
        "foreground-primary": "#fefaec",
        "grow-primary": "#555",
      },
      flex: {
        1: "1 1 0%",
        2: "2 1 0%",
        3: "3 1 0%",
        4: "4 1 0%",
        5: "5 1 0%",
        6: "6 1 0%",
        7: "7 1 0%",
        8: "8 1 0%",
        9: "9 1 0%",
      },
    },
  },
  plugins: [],
};
