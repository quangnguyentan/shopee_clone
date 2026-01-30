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
        "gray-tertiary": "d8d8d8",
        "gray-blackground": "#f5f5f5",
        "yellow-primary": "#ffbf00",
        "foreground-primary": "#fefaec",
        "grow-primary": "#555",
        "seperator-color": "#ffffff38",
        "red-secondary": "#d0011b",
        "red-tertiary": "#ffbda6",
        "black-shadow": "#00000042",
        discount: "#FEEEEA",
        lightning: "#ec3814",
        "yellow-primary": "#ffe97a",
        "red-rgb": "rgb(238, 77, 45)",
      },
      backgroundImage: {
        "red-gradient": "linear-gradient(-180deg, #f53d2d, #f63)",
        "linear-sale": "linear-gradient(270deg,#ffb000 0%,#eb1717 100%)",
      },
      listStyleType: {
        square: "square",
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
      spacing: {
        header: "119px",
      },
      height: {
        "screen-minus-header": "calc(100vh - 119px)",
      },
    },
  },

  plugins: [],
};
