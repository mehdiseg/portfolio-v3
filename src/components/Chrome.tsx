import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react'
import { useUI } from '../context/UIContext'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, mass: 0.3 })
  return (
    <motion.div
      aria-hidden="true"
      className="no-print fixed inset-x-0 top-0 z-[55] h-[2px] origin-left bg-accent"
      style={{ scaleX }}
    />
  )
}

export function Toaster() {
  const { toasts } = useUI()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[95] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.p
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-xl border border-line bg-deep px-4 py-2.5 text-sm shadow-xl"
          >
            {t.message}
          </motion.p>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function SkipLink() {
  return (
    <a
      href="#main"
      className="fixed top-2 left-2 z-[100] -translate-y-20 rounded-lg bg-fg px-4 py-2 text-ink transition-transform focus:translate-y-0"
    >
      Aller au contenu
    </a>
  )
}
