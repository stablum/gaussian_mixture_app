export function isDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

export const themeColors = {
  axis: {
    light: '#374151',
    dark: '#d1d5db'
  },
  text: {
    light: '#111827', 
    dark: '#f3f4f6'
  },
  legendBg: {
    light: 'white',
    dark: '#374151'
  },
  legendBorder: {
    light: 'gray',
    dark: '#6b7280'
  },
  mixtureCurve: {
    light: 'black',
    dark: '#f3f4f6'
  }
} as const;

export function getThemeColor(colorKey: keyof typeof themeColors): string {
  const isDark = isDarkMode();
  return isDark ? themeColors[colorKey].dark : themeColors[colorKey].light;
}