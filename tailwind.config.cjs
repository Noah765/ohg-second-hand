const plugin = require('tailwindcss/plugin');
const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette').default;

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				neutral: {
					50: '#d9d9d9',
					100: '#cacaca',
					500: '#aaaaaa',
					600: '#bbbbbb',
					800: '#222222',
					900: '#050d18'
				}
			},
			boxShadow: {
				1: '0 0 0 1px black',
				2: '0 0 0 2px black',
				3: '0 0 0 3px black',
				4: '0 0 0 4px black'
			}
		}
	},
	plugins: [
		plugin(({ matchComponents, theme }) => {
			matchComponents(
				{
					lines: (value) => ({
						display: 'flex',
						alignItems: 'center',
						'&:before': {
							content: "''",
							width: '100%',
							height: '0.25rem',
							marginRight: '0.25rem',
							backgroundColor: value,
							borderRadius: '9999px'
						},
						'&:after': {
							content: "''",
							width: '100%',
							height: '0.25rem',
							marginLeft: '0.25rem',
							backgroundColor: value,
							borderRadius: '9999px'
						}
					}),
					line: (value) => ({
						display: 'block',
						width: '100%',
						height: '0.25rem',
						backgroundColor: value,
						borderRadius: '9999px'
					}),
					'line-vertical': (value) => ({
						display: 'inline-block',
						height: '100%',
						minWidth: '0.25rem',
						backgroundColor: value,
						borderRadius: '9999px'
					})
				},
				{ values: flattenColorPalette(theme('colors')), type: 'color' }
			);
		})
	]
};
