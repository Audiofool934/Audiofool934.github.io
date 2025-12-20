/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class', // Manual toggle for "Dark Side of the Moon"
	theme: {
		extend: {
			colors: {
				// Strict B&W Palette
				black: '#000000',
				white: '#ffffff',
				// Neutral Grays for subtle hierarchy
				neutral: {
					50: '#fafafa',
					100: '#f5f5f5',
					200: '#e5e5e5',
					300: '#d4d4d4',
					400: '#a3a3a3',
					500: '#737373',
					600: '#525252',
					700: '#404040',
					800: '#262626',
					900: '#171717',
					950: '#0a0a0a',
				},
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
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
