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

export function useTheme() {
  const [currentTheme, setCurrentThemeState] = useState<ThemeKey>(getInitialThemeKey)

  useEffect(() => {
    applyCssVars(themes[currentTheme])
  }, [currentTheme])

  const setTheme = useCallback((key: ThemeKey) => {
    if (!themes[key]) return
    setCurrentThemeState(key)
    try {
      localStorage.setItem(storageKey, key)
    } catch {
      // ignore
    }
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
