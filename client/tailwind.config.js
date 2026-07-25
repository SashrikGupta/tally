/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme]'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces. `*-solid` opts out of the user's translucency setting for
        // places where content must stay readable regardless (menus, editors).
        base: 'var(--bg-base)',
        'base-solid': 'var(--bg-base-solid)',
        elevated: 'var(--bg-elevated)',
        'elevated-solid': 'var(--bg-elevated-solid)',
        overlay: 'var(--bg-overlay)',
        'overlay-solid': 'var(--bg-overlay-solid)',
        inset: 'var(--bg-inset)',
        'inset-solid': 'var(--bg-inset-solid)',

        titlebar: 'var(--titlebar-bg)',
        rail: 'var(--rail-bg)',
        panel: 'var(--panel-bg)',
        statusbar: 'var(--statusbar-bg)',

        fg: {
          DEFAULT: 'var(--fg-default)',
          muted: 'var(--fg-muted)',
          subtle: 'var(--fg-subtle)',
          accent: 'var(--fg-on-accent)',
        },

        border: {
          subtle: 'var(--border-subtle)',
          DEFAULT: 'var(--border-default)',
          focus: 'var(--border-focus)',
        },

        accent: {
          DEFAULT: 'var(--accent-bg)',
          fg: 'var(--accent-fg)',
          border: 'var(--accent-border)',
          soft: 'var(--accent-soft)',
        },
        success: {
          DEFAULT: 'var(--success-bg)',
          fg: 'var(--success-fg)',
          border: 'var(--success-border)',
          soft: 'var(--success-soft)',
        },
        warning: {
          DEFAULT: 'var(--warning-bg)',
          fg: 'var(--warning-fg)',
          border: 'var(--warning-border)',
          soft: 'var(--warning-soft)',
        },
        danger: {
          DEFAULT: 'var(--danger-bg)',
          fg: 'var(--danger-fg)',
          border: 'var(--danger-border)',
          soft: 'var(--danger-soft)',
        },
        info: {
          DEFAULT: 'var(--info-bg)',
          fg: 'var(--info-fg)',
          border: 'var(--info-border)',
          soft: 'var(--info-soft)',
        },

        easy: 'var(--easy)',
        medium: 'var(--medium)',
        hard: 'var(--hard)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        overlay: 'var(--shadow-overlay)',
        glow: 'var(--glow-accent)',
        'glow-sm': 'var(--glow-accent-sm)',
        'glow-danger': 'var(--glow-danger)',
        'glow-success': 'var(--glow-success)',
      },
      spacing: {
        titlebar: '44px',
        rail: '52px',
        statusbar: '26px',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
        spring: 'var(--ease-spring)',
      },
      transitionDuration: {
        fast: 'var(--dur-fast)',
        base: 'var(--dur-base)',
        slow: 'var(--dur-slow)',
      },
      backdropBlur: {
        glass: 'var(--glass-blur)',
      },
    },
  },
  plugins: [],
};
