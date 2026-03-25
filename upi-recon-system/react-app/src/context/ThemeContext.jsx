import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

// Theme options
// 'light'   = current white/blue palette (same as default)
// 'default' = alias for light (white/blue palette)  
// 'dark'    = dark navy (#0f172a) + light-blue (#38bdf8) accent
export const THEMES = ['default', 'dark', 'light']

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'default'
  })

  useEffect(() => {
    const root = document.documentElement
    // Remove previous theme classes
    root.classList.remove('theme-dark', 'theme-light', 'theme-default')
    // Apply current
    root.classList.add(`theme-${theme}`)
    localStorage.setItem('app-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
