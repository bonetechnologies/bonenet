export const globalTheme = {
  colors: {
    primary: {
      main: '#FF4D8D',
      light: '#FF7AA7',
      dark: '#D93D75',
      gradient: 'linear-gradient(135deg, #FF4D8D 0%, #FF8F71 100%)'
    },
    accent: {
      main: '#4DFFB8',
      light: '#7AFFC9',
      dark: '#3DD99B'
    },
    background: {
      primary: '#000000',
      secondary: '#0A0A0F',
      tertiary: '#13131F',
      elevated: '#1C1C2B',
      glow: 'rgba(255, 77, 141, 0.15)'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0C0',
      accent: '#FF4D8D',
      glow: '0 0 10px rgba(255, 77, 141, 0.5)'
    },
    success: '#4DFF91',
    error: '#FF4D4D',
    warning: '#FFB84D',
    info: '#4DC9FF',
    border: {
      primary: '#2A2A3A',
      glow: '0 0 5px rgba(255, 77, 141, 0.3)'
    }
  },
  typography: {
    fontFamily: {
      primary: "'Inter', sans-serif",
      display: "'Press Start 2P', monospace",
      mono: "'IBM Plex Mono', monospace"
    },
    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    size: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      xxl: '2rem'
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
    section: '96px'
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px'
  },
  effects: {
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  }
};

export type GlobalTheme = typeof globalTheme;