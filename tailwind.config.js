/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#f7e7a9',
          primary: '#d4af37',
          dark: '#aa771c',
          border: '#caa148',
        }
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
        orbitron: ['Orbitron', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
