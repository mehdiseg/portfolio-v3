import { useEffect, useState } from 'react'

export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const visible = new Map<string, boolean>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting))
        const first = ids.find((id) => visible.get(id))
        setActive(first ?? '')
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [ids])

  return active
}
