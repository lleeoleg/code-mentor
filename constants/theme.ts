/**
 * Палитра CodeMentor — совпадает с frontend/src/index.css
 */
export const AppTheme = {
  bg: '#f4f3ff',
  bgAlt: '#ede9fe',
  card: '#ffffff',
  cardHover: '#faf5ff',
  text: '#1e1b4b',
  textMuted: '#64748b',
  accent: '#6366f1',
  accentHover: '#4f46e5',
  accentViolet: '#8b5cf6',
  accentPink: '#ec4899',
  border: '#e0e7ff',
  error: '#ef4444',
  green: '#10b981',
  gradientPage: ['#eef2ff', '#fdf4ff', '#ecfeff'] as const,
  gradientBtn: ['#6366f1', '#8b5cf6', '#a855f7'] as const,
  gradientHeader: ['#4338ca', '#6366f1', '#a855f7'] as const,
  radius: 14,
  radiusSm: 10,
  decorOpacity: 0.22,
};

export const Colors = {
  light: {
    text: AppTheme.text,
    background: AppTheme.bg,
    tint: AppTheme.accent,
    icon: AppTheme.textMuted,
    tabIconDefault: AppTheme.textMuted,
    tabIconSelected: AppTheme.accent,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};

export const chipStyles = {
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: AppTheme.border,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: AppTheme.accent,
    borderColor: AppTheme.accent,
  },
  chipText: { fontSize: 14, color: AppTheme.textMuted, fontWeight: '600' as const },
  chipTextActive: { color: '#fff' },
};
