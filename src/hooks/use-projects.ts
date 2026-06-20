import { useCallback, useEffect, useState } from 'react'
import type { Project } from '@/lib/aquarium/types'
import { mockProjects } from '@/lib/aquarium/projects-data'

const STORAGE_KEY = 'aquadash:projects:v1'

function load(): Project[] {
  if (typeof window === 'undefined') return mockProjects
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return mockProjects
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return mockProjects
    return parsed as Project[]
  } catch {
    return mockProjects
  }
}

const listeners = new Set<() => void>()
let cache: Project[] | null = null

function emit() { listeners.forEach((fn) => fn()) }

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() => {
    if (cache) return cache
    cache = load()
    return cache
  })

  useEffect(() => {
    const fn = () => setProjects(cache ?? load())
    listeners.add(fn)
    return () => { listeners.delete(fn) }
  }, [])

  const replace = useCallback((next: Project[]) => {
    cache = next
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
    emit()
  }, [])

  const reset = useCallback(() => {
    cache = mockProjects
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    emit()
  }, [])

  return { projects, replace, reset }
}
