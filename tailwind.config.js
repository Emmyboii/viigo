/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '2050px',
        'lj': '1400px',
        'lf': '1050px',
        'lw': '1101px',
        'mf': '950px',
        'mp': '980px',
        'mc': '900px',
        'mk': '850px',
        'mh': '700px',
        'sh': '600px',
        'sd': '550px',
        'sa': '500px',
        'sp': '450px',
        'sk': '400px',
        'sc': '360px',
        'sr': '340px',
        'sb': '300px',
      },
    },
  },
  plugins: [],
}

