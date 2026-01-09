tailwind.config = {
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Merriweather', 'serif'],
            },
            colors: {
                lab: {
                    primary: '#047857', // Emerald 700
                    dark: '#064e3b',    // Emerald 900
                    accent: '#d97706',  // Amber 600
                    slate: '#0f172a',   // Slate 900
                    light: '#f0fdf4',   // Emerald 50
                    surface: '#ffffff'
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        }
    }
}