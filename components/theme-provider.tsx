'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a fallback during SSR that matches the default theme
    return (
      <div 
        className={props.defaultTheme || 'light'} 
        style={{ display: 'contents' }}
      >
        {children}
      </div>
    )
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}