/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				// Light mode defaults (override in dark mode)
				background: {
					DEFAULT: '#FAFAFA',
					dark: '#0A0A0A',
				},
				surface: {
					DEFAULT: '#FFFFFF',
					dark: '#141414',
				},
				primary: {
					DEFAULT: '#2563EB', // Professional blue
					light: '#3B82F6',
					dark: '#60A5FA',
				},
				accent: {
					DEFAULT: '#8B5CF6', // Soulful purple
					light: '#A78BFA',
					dark: '#A78BFA',
				},
				text: {
					main: {
						DEFAULT: '#1A1A1A',
						dark: '#F5F5F5',
					},
					secondary: {
						DEFAULT: '#4B5563',
						dark: '#D1D5DB',
					},
					muted: {
						DEFAULT: '#6B7280',
						dark: '#A3A3A3',
					},
				},
				border: {
					subtle: {
						DEFAULT: '#E5E7EB',
						dark: '#262626',
					},
					strong: {
						DEFAULT: '#D1D5DB',
						dark: '#404040',
					},
				},
			},
			fontFamily: {
				sans: ['Inter', '"Noto Sans SC"', '"PingFang SC"', 'system-ui', 'sans-serif'],
				heading: ['Outfit', '"Noto Sans SC"', 'sans-serif'],
				mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
			},
			fontSize: {
				'display': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
				'display-sm': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
			},
			spacing: {
				'18': '4.5rem',
				'22': '5.5rem',
			},
			borderRadius: {
				'2xl': '1rem',
				'3xl': '1.5rem',
			},
			boxShadow: {
				'soft': '0 4px 20px rgba(0, 0, 0, 0.03)',
				'soft-lg': '0 10px 40px rgba(0, 0, 0, 0.05)',
				'glow': '0 0 40px rgba(139, 92, 246, 0.15)',
				'glow-sm': '0 0 20px rgba(139, 92, 246, 0.1)',
			},
			animation: {
				'fade-in': 'fadeIn 0.6s ease-out',
				'fade-in-up': 'fadeInUp 0.6s ease-out',
				'float': 'float 6s ease-in-out infinite',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				fadeInUp: {
					'0%': { opacity: '0', transform: 'translateY(16px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-8px)' },
				},
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-glow': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
			},
		},
	},
	plugins: [],
}
