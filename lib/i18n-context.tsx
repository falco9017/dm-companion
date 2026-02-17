'use client'

import { createContext, useContext } from 'react'
import { t as translate, type Locale } from './i18n'

interface I18nContextValue {
  t: (key: string, params?: Record<string, string | number>) => string
  locale: Locale
}

const I18nContext = createContext<I18nContextValue>({
  t: (key) => key,
  locale: 'en',
})

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  const tFn = (key: string, params?: Record<string, string | number>) =>
    translate(locale, key, params)

  return (
    <I18nContext.Provider value={{ t: tFn, locale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
