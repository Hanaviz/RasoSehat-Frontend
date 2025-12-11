/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx,html}'],
  theme: { extend: {} },
  plugins: [daisyui],
  daisyui: { themes: ['light'] },
};
