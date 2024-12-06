/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'clamp-shrink': 'clamp(6px, calc(6px + 0.9vmin), 30px)',
        'clamp-s': 'clamp(8px, calc(8px + 0.7vmin), 30px)',
        'clamp': 'clamp(10px, calc(10px + 0.8vmin), 40px)',
        'clamp-l': 'clamp(12px, calc(10px + 0.9vmin), 60px)',
      }
    },
  },
  plugins: [],
};

