/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class', // Manual toggle for "Dark Side of the Moon"
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				heading: ['Inter', 'system-ui', 'sans-serif'],
				mono: ['"JetBrains Mono"', 'monospace'],
			},
			borderWidth: {
				DEFAULT: '1px',
			},
			borderColor: {
				DEFAULT: '#000000', // Default border is black (Line aesthetic)
			},
			backgroundImage: {
				// Subtle grain or noise could be added here if requested, keeping it clean for now
			}
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}
