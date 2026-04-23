export type ThemeKey = 'ocean-blue' | 'dawn-white' | 'midnight-black'

export type AntdAlgorithm = 'dark' | 'default'

export interface ThemeConfig {
  key: ThemeKey
  label: string
  cssVars: Record<string, string>
  antdToken: Record<string, string | number>
  algorithm: AntdAlgorithm
}

/* ───────────────────────────────────────────────
   Ocean Blue  深海蓝
   沉浸式深蓝黑，accent 用高饱和电光蓝
   ─────────────────────────────────────────────── */
const oceanBlue: ThemeConfig = {
  key: 'ocean-blue',
  label: '深海蓝',
  cssVars: {
    '--bg-body': '#030712',
    '--bg-surface': '#0b1221',
    '--bg-elevated': '#111d35',
    '--bg-hover': '#1a2d4d',

    '--text-primary': '#f0f9ff',
    '--text-secondary': '#94a3b8',
    '--text-muted': '#64748b',

    '--accent': '#0ea5e9',
    '--accent-hover': '#38bdf8',
    '--accent-soft': 'rgba(14, 165, 233, 0.12)',

    '--border': 'rgba(148, 163, 184, 0.08)',
    '--border-hover': 'rgba(148, 163, 184, 0.15)',

    '--up': '#f87171',
    '--down': '#4ade80',
    '--up-soft': 'rgba(248, 113, 113, 0.12)',
    '--down-soft': 'rgba(74, 222, 128, 0.12)',

    '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.4)',
    '--shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
    '--shadow-glow': '0 0 20px rgba(14, 165, 233, 0.2)',

    '--radius': '12px',
    '--radius-sm': '8px',
    '--radius-lg': '16px',

    '--gradient-start': '#0ea5e9',
    '--gradient-end': '#22d3ee',
    '--glass-bg': 'rgba(11, 18, 33, 0.85)',
    '--glass-border': 'rgba(148, 163, 184, 0.06)',
    '--pulse-glow-color': 'rgba(14, 165, 233, 0.5)',
  },
  antdToken: {
    colorPrimary: '#0ea5e9',
    colorBgBase: '#030712',
    colorTextBase: '#f0f9ff',
    colorBorder: 'rgba(148, 163, 184, 0.08)',
    colorBgContainer: '#0b1221',
    colorBgElevated: '#111d35',
  },
  algorithm: 'dark',
}

/* ───────────────────────────────────────────────
   Dawn White  晨曦白
   暖白底色 + 高级 Indigo  accent，简洁有质感
   ─────────────────────────────────────────────── */
const dawnWhite: ThemeConfig = {
  key: 'dawn-white',
  label: '晨曦白',
  cssVars: {
    '--bg-body': '#fafaf9',
    '--bg-surface': '#ffffff',
    '--bg-elevated': '#f5f5f4',
    '--bg-hover': '#e7e5e4',

    '--text-primary': '#1c1917',
    '--text-secondary': '#57534e',
    '--text-muted': '#a8a29e',

    '--accent': '#4f46e5',
    '--accent-hover': '#6366f1',
    '--accent-soft': 'rgba(79, 70, 229, 0.1)',

    '--border': 'rgba(120, 113, 108, 0.12)',
    '--border-hover': 'rgba(120, 113, 108, 0.22)',

    '--up': '#dc2626',
    '--down': '#16a34a',
    '--up-soft': 'rgba(220, 38, 38, 0.08)',
    '--down-soft': 'rgba(22, 163, 74, 0.08)',

    '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
    '--shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
    '--shadow-glow': '0 0 20px rgba(79, 70, 229, 0.12)',

    '--radius': '12px',
    '--radius-sm': '8px',
    '--radius-lg': '16px',

    '--gradient-start': '#4f46e5',
    '--gradient-end': '#818cf8',
    '--glass-bg': 'rgba(255, 255, 255, 0.8)',
    '--glass-border': 'rgba(120, 113, 108, 0.08)',
    '--pulse-glow-color': 'rgba(79, 70, 229, 0.4)',
  },
  antdToken: {
    colorPrimary: '#4f46e5',
    colorBgBase: '#fafaf9',
    colorTextBase: '#1c1917',
    colorBorder: 'rgba(120, 113, 108, 0.12)',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#f5f5f4',
  },
  algorithm: 'default',
}

/* ───────────────────────────────────────────────
   Midnight Black  极夜黑
   纯黑基底 + 霓虹 Fuchsia  accent，赛博感
   ─────────────────────────────────────────────── */
const midnightBlack: ThemeConfig = {
  key: 'midnight-black',
  label: '极夜黑',
  cssVars: {
    '--bg-body': '#000000',
    '--bg-surface': '#09090b',
    '--bg-elevated': '#18181b',
    '--bg-hover': '#27272a',

    '--text-primary': '#fafafa',
    '--text-secondary': '#a1a1aa',
    '--text-muted': '#71717a',

    '--accent': '#d946ef',
    '--accent-hover': '#e879f9',
    '--accent-soft': 'rgba(217, 70, 239, 0.15)',

    '--border': 'rgba(255, 255, 255, 0.06)',
    '--border-hover': 'rgba(255, 255, 255, 0.12)',

    '--up': '#f87171',
    '--down': '#4ade80',
    '--up-soft': 'rgba(248, 113, 113, 0.12)',
    '--down-soft': 'rgba(74, 222, 128, 0.12)',

    '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.5)',
    '--shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
    '--shadow-glow': '0 0 20px rgba(217, 70, 239, 0.25)',

    '--radius': '12px',
    '--radius-sm': '8px',
    '--radius-lg': '16px',

    '--gradient-start': '#d946ef',
    '--gradient-end': '#f0abfc',
    '--glass-bg': 'rgba(9, 9, 11, 0.85)',
    '--glass-border': 'rgba(255, 255, 255, 0.05)',
    '--pulse-glow-color': 'rgba(217, 70, 239, 0.5)',
  },
  antdToken: {
    colorPrimary: '#d946ef',
    colorBgBase: '#000000',
    colorTextBase: '#fafafa',
    colorBorder: 'rgba(255, 255, 255, 0.06)',
    colorBgContainer: '#09090b',
    colorBgElevated: '#18181b',
  },
  algorithm: 'dark',
}

export const themes: Record<ThemeKey, ThemeConfig> = {
  'ocean-blue': oceanBlue,
  'dawn-white': dawnWhite,
  'midnight-black': midnightBlack,
}

export const themeList = Object.values(themes)

export const defaultThemeKey: ThemeKey = 'dawn-white'
export const storageKey = 'quant-ai-theme'
