/**
 * Tailwind config: explicitly safelist mobile-safe utilities
 * and register them via plugin so production builds won't purge them.
 */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  safelist: [
    'min-h-screen-safe',
    'h-screen-safe',
    'screen-safe',
    'input-no-autofill',
    { pattern: /^min-h-screen-safe$/, variants: ['sm','md','lg','xl','2xl'] },
    { pattern: /^h-screen-safe$/, variants: ['sm','md','lg','xl','2xl'] },
    { pattern: /^screen-safe$/, variants: ['sm','md','lg','xl','2xl'] },
    { pattern: /^input-no-autofill$/, variants: ['sm','md','lg','xl','2xl'] }
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
    // plugin to register mobile-safe utilities at build time
    function({ addUtilities }) {
      const newUtilities = {
        '.min-h-screen-safe': {
          'min-height': '100svh',
          'min-height': '100dvh',
          'min-height': '100vh'
        },
        '.h-screen-safe': {
          'height': '100svh',
          'height': '100dvh',
          'height': '100vh'
        },
        '.screen-safe': {
          'height': '100svh',
          'height': '100dvh',
          'height': '100vh'
        },
        '.input-no-autofill': {
          '-webkit-text-fill-color': 'inherit',
          'box-shadow': '0 0 0px 1000px #fff inset',
          'transition': 'background-color 5000s ease-in-out 0s'
        }
      };
      addUtilities(newUtilities, { variants: ['responsive'] });
    }
  ]
}
