import { useCallback, useEffect, useState } from 'react'
import {
  defaultThemeKey,
  storageKey,
  themes,
  themeList,
  type ThemeConfig,
  type ThemeKey,
} from '../styles/themes'

function applyCssVars(theme: ThemeConfig) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme.key)
  for (const [key, value] of Object.entries(theme.cssVars)) {
    root.style.setProperty(key, value)
  }
}

function getInitialThemeKey(): ThemeKey {
  try {
    const stored = localStorage.getItem(storageKey) as ThemeKey | null
    if (stored && themes[stored]) return stored
  } catch {
    // ignore
  }
  return defaultThemeKey
}

const THEME_CHANGE_EVENT = 'quant-ai:themechange'

export function useTheme() {
  const [currentTheme, setCurrentThemeState] = useState<ThemeKey>(getInitialThemeKey)

  useEffect(() => {
    applyCssVars(themes[currentTheme])
  }, [currentTheme])

  /* 跨标签页同步 */
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue && themes[e.newValue as ThemeKey]) {
        setCurrentThemeState(e.newValue as ThemeKey)
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  /* 同窗口跨组件同步 */
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ThemeKey>).detail
      if (detail && themes[detail]) {
        setCurrentThemeState(detail)
      }
    }
    window.addEventListener(THEME_CHANGE_EVENT, handler)
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handler)
  }, [])

  const setTheme = useCallback((key: ThemeKey) => {
    if (!themes[key]) return
    setCurrentThemeState(key)
    try {
      localStorage.setItem(storageKey, key)
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: key }))
  }, [])

  const themeConfig = themes[currentTheme]

  return {
    currentTheme,
    setTheme,
    themeConfig,
    themeList,
    antdToken: themeConfig.antdToken,
    algorithm: themeConfig.algorithm,
  }
}
