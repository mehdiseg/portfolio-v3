import { motion, useMotionValue, useSpring } from 'motion/react'
import type { ReactNode } from 'react'
import { useUI } from '../context/UIContext'

// Le bouton suit légèrement le curseur : un retour visuel discret à l'approche
export function Magnetic({ children, strength = 0.28 }: { children: ReactNode; strength?: number }) {
  const { reducedMotion } = useUI()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 240, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 240, damping: 18, mass: 0.4 })

  if (reducedMotion) return <>{children}</>

  return (
    <motion.span
      className="inline-flex"
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}
