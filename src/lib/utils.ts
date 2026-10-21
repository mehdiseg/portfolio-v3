export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

export const cssVar = (name: string, fallback = '') =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
  } catch {
    return false
  }
}

export function downloadFile(href: string, name: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export const isFinePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

export const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
