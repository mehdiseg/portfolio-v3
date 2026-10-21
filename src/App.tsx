import { MotionConfig } from 'motion/react'
import { ScrollProgress, SkipLink, Toaster } from './components/Chrome'
import { CommandPalette } from './components/CommandPalette'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Nav } from './components/Nav'
import { Parcours } from './components/Parcours'
import { ProjectModal } from './components/ProjectModal'
import { Projects } from './components/Projects'
import { Skills } from './components/Skills'
import { Terminal } from './components/Terminal'
import { Veille } from './components/Veille'
import { UIProvider } from './context/UIContext'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <UIProvider>
        <SkipLink />
        <ScrollProgress />
        <Nav />
        <main id="main">
          <Hero />
          <Parcours />
          <Skills />
          <Projects />
          <Veille />
          <Contact />
        </main>
        <Footer />
        <ProjectModal />
        <CommandPalette />
        <Terminal />
        <Toaster />
      </UIProvider>
    </MotionConfig>
  )
}
