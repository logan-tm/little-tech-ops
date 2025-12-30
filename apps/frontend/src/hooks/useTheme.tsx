import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext<{
  theme: ValidTheme

  toggleTheme: () => void
  setTheme: (newTheme: ValidTheme) => void
}>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
})

type ValidTheme = 'light' | 'dark'

type ThemeProviderProps = {
  children: React.ReactNode
  theme: ValidTheme
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme')

      if (savedTheme && ['light', 'dark'].includes(savedTheme))
        return savedTheme as ValidTheme

      return (
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      ) as ValidTheme
    }

    return 'light' as ValidTheme
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme)

    localStorage.setItem('theme', currentTheme)
  }, [currentTheme])

  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const setTheme = (newTheme: ValidTheme) => {
    if (currentTheme !== newTheme) {
      setCurrentTheme(newTheme)
    }
  }

  return (
    <ThemeContext.Provider
      value={{ theme: currentTheme, toggleTheme, setTheme }}
    >
      {/* <div className={currentTheme === 'dark' ? 'dark' : ''}>{children}</div> */}

      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
