export type ThemeKey = 'ocean-blue' | 'dawn-white' | 'midnight-black'

export type AntdAlgorithm = 'dark' | 'default'

export interface ThemeConfig {
  key: ThemeKey
  label: string
  cssVars: Record<string, string>
  antdToken: Record<string, string | number>
  algorithm: AntdAlgorithm
}

const oceanBlue: ThemeConfig = {
  key: 'ocean-blue',
  label: '深海蓝',
  cssVars: {
    '--bg-body': '#0b1120',
    '--bg-surface': '#0f172a',
    '--bg-elevated': '#1e293b',
    '--bg-hover': '#334155',

    '--text-primary': '#f1f5f9',
    '--text-secondary': '#94a3b8',
    '--text-muted': '#64748b',

    '--accent': '#0ea5e9',
    '--accent-hover': '#38bdf8',
    '--accent-soft': 'rgba(14, 165, 233, 0.15)',

    '--border': 'rgba(148, 163, 184, 0.1)',
    '--border-hover': 'rgba(148, 163, 184, 0.2)',

    '--up': '#ef4444',
    '--down': '#22c55e',
    '--up-soft': 'rgba(239, 68, 68, 0.15)',
    '--down-soft': 'rgba(34, 197, 94, 0.15)',

    '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
    '--shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
    '--shadow-glow': '0 0 20px rgba(14, 165, 233, 0.15)',

    '--radius': '12px',
    '--radius-sm': '8px',
    '--radius-lg': '16px',
  },
  antdToken: {
    colorPrimary: '#0ea5e9',
    colorBgBase: '#0b1120',
    colorTextBase: '#f1f5f9',
    colorBorder: 'rgba(148, 163, 184, 0.1)',
    colorBgContainer: '#0f172a',
    colorBgElevated: '#1e293b',
  },
  algorithm: 'dark',
}

const dawnWhite: ThemeConfig = {
  key: 'dawn-white',
  label: '晨曦白',
  cssVars: {
    '--bg-body': '#f8fafc',
    '--bg-surface': '#ffffff',
    '--bg-elevated': '#f1f5f9',
    '--bg-hover': '#e2e8f0',

    '--text-primary': '#0f172a',
    '--text-secondary': '#475569',
    '--text-muted': '#94a3b8',

    '--accent': '#2563eb',
    '--accent-hover': '#3b82f6',
    '--accent-soft': 'rgba(37, 99, 235, 0.1)',

    '--border': 'rgba(148, 163, 184, 0.25)',
    '--border-hover': 'rgba(148, 163, 184, 0.4)',

    '--up': '#dc2626',
    '--down': '#16a34a',
    '--up-soft': 'rgba(220, 38, 38, 0.08)',
    '--down-soft': 'rgba(22, 163, 74, 0.08)',

    '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.06)',
    '--shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.06)',
    '--shadow-glow': '0 0 20px rgba(37, 99, 235, 0.12)',

    '--radius': '12px',
    '--radius-sm': '8px',
    '--radius-lg': '16px',
  },
  antdToken: {
    colorPrimary: '#2563eb',
    colorBgBase: '#f8fafc',
    colorTextBase: '#0f172a',
    colorBorder: 'rgba(148, 163, 184, 0.25)',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#f1f5f9',
  },
  algorithm: 'default',
}

const midnightBlack: ThemeConfig = {
  key: 'midnight-black',
  label: '极夜黑',
  cssVars: {
    '--bg-body': '#000000',
    '--bg-surface': '#0a0a0a',
    '--bg-elevated': '#141414',
    '--bg-hover': '#1f1f1f',

    '--text-primary': '#ffffff',
    '--text-secondary': '#a3a3a3',
    '--text-muted': '#737373',

    '--accent': '#a855f7',
    '--accent-hover': '#c084fc',
    '--accent-soft': 'rgba(168, 85, 247, 0.15)',

    '--border': 'rgba(255, 255, 255, 0.08)',
    '--border-hover': 'rgba(255, 255, 255, 0.15)',

    '--up': '#ff4444',
    '--down': '#00d084',
    '--up-soft': 'rgba(255, 68, 68, 0.12)',
    '--down-soft': 'rgba(0, 208, 132, 0.12)',

    '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.5)',
    '--shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
    '--shadow-glow': '0 0 20px rgba(168, 85, 247, 0.2)',

    '--radius': '12px',
    '--radius-sm': '8px',
    '--radius-lg': '16px',
  },
  antdToken: {
    colorPrimary: '#a855f7',
    colorBgBase: '#000000',
    colorTextBase: '#ffffff',
    colorBorder: 'rgba(255, 255, 255, 0.08)',
    colorBgContainer: '#0a0a0a',
    colorBgElevated: '#141414',
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
