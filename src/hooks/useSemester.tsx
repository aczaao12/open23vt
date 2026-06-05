import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getActiveSemester, getSemesters } from '@/lib/api'
import type { Semester } from '@/types/database'

interface SemesterContextValue {
  activeSemester: Semester | null
  semesters: Semester[]
  loading: boolean
  refresh: () => Promise<void>
}

const SemesterContext = createContext<SemesterContextValue>({
  activeSemester: null,
  semesters: [],
  loading: true,
  refresh: async () => {},
})

export function SemesterProvider({ children }: { children: ReactNode }) {
  const [activeSemester, setActiveSemester] = useState<Semester | null>(null)
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    const [active, all] = await Promise.all([getActiveSemester(), getSemesters()])
    setActiveSemester(active)
    setSemesters(all)
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([getActiveSemester(), getSemesters()]).then(([active, all]) => {
      if (cancelled) return
      setActiveSemester(active)
      setSemesters(all)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  return (
    <SemesterContext.Provider value={{ activeSemester, semesters, loading, refresh }}>
      {children}
    </SemesterContext.Provider>
  )
}

export function useActiveSemester() {
  return useContext(SemesterContext)
}
