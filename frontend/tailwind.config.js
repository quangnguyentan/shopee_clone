/** @type {import('tailwindcss').Config} */
module.exports = {
   content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors : {
        "red-primary" : "#ee4d2d"
      }
    },
  },
  plugins: [],
}

