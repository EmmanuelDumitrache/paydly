import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite alternate',
        'glow-soft': 'glow-soft 2.5s ease-in-out infinite alternate',
        'light-sweep': 'light-sweep 6s ease-in-out infinite',
        'notification-enter': 'notification-enter 0.5s ease-out forwards',
        'notification-exit': 'notification-exit 0.5s ease-in forwards',
        'gradient-move': 'gradient-move 8s ease-in-out infinite',
        'gradient-drift': 'gradient-drift 12s ease-in-out infinite',
        'fade-up': 'fade-up 700ms ease-out forwards',
      },
      keyframes: {
        'glow-soft': {
          '0%': {
            'box-shadow':
              '0 0 4px rgba(255,255,255,0.25), 0 0 8px rgba(99,102,241,0.20), 0 0 12px rgba(99,102,241,0.15)',
          },
          '100%': {
            'box-shadow':
              '0 0 6px rgba(255,255,255,0.35), 0 0 12px rgba(99,102,241,0.25), 0 0 18px rgba(99,102,241,0.20)',
          },
        },
        glow: {
          '0%': {
            'box-shadow':
              '0 0 5px rgba(255, 255, 255, 0.5), 0 0 10px rgba(255, 255, 255, 0.3), 0 0 15px rgba(255, 255, 255, 0.2)',
          },
          '100%': {
            'box-shadow':
              '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4), 0 0 40px rgba(147, 197, 253, 0.3)',
          },
        },
        'light-sweep': {
          '0%': {
            'background-position': '0% 0%',
          },
          '100%': {
            'background-position': '200% 0%',
          },
        },
        'gradient-move': {
          '0%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
          '100%': {
            'background-position': '0% 50%',
          },
        },
        'gradient-drift': {
          '0%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '40% 50%',
          },
          '100%': {
            'background-position': '0% 50%',
          },
        },
        'notification-enter': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'notification-exit': {
          '0%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
        },
        'fade-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(12px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0px)',
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
