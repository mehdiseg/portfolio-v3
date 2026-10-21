import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Html, Lightformer, Line, OrbitControls, PerformanceMonitor, RoundedBox, Sparkles } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Line2 } from 'three-stdlib'
import type { Theme } from '../context/UIContext'
import type { CategoryId, DeviceType } from '../data/projects'
import { TOPO_LINKS, TOPO_NODES, type TopoNode } from '../data/topology'
import { cssVar, cx, isFinePointer } from '../lib/utils'

export interface TopologySceneProps {
  active: boolean
  theme: Theme
  reducedMotion: boolean
  hovered: string | null
  category: CategoryId | null
  spinSignal: number
  onHover: (id: string | null) => void
  onSelect: (projectId: string) => void
}

type Palette = Record<CategoryId | 'core' | 'bg' | 'metal' | 'accent', string>

const STEP = 0.11
const LABEL_Y: Record<DeviceType, number> = { server: 0.66, switch: 0.36, firewall: 0.42, board: 0.32, app: 0.58, cloud: 0.72 }

function usePalette(theme: Theme): Palette {
  return useMemo(
    () => ({
      bg: cssVar('--scene-bg', '#070b14'),
      metal: cssVar('--metal', '#1a2237'),
      accent: cssVar('--accent', '#9d8cff'),
      core: cssVar('--muted', '#8f9cb6'),
      infra: cssVar('--c-infra', '#4c8dff'),
      secu: cssVar('--c-secu', '#ff7a45'),
      dev: cssVar('--c-dev', '#3dd68c'),
      stage: cssVar('--c-stage', '#f5c451'),
    }),
    // recalculée à chaque changement de thème (les variables CSS changent)
    [theme],
  )
}

export default function TopologyScene(props: TopologySceneProps) {
  const [dprMax, setDprMax] = useState(1.6)
  return (
    <Canvas
      dpr={[1, dprMax]}
      frameloop={props.active ? 'always' : 'never'}
      camera={{ position: [0, 0.6, 10.5], fov: 36 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => props.onHover(null)}
    >
      <PerformanceMonitor onDecline={() => setDprMax(1)} onIncline={() => setDprMax(1.75)} />
      <SceneContents {...props} />
    </Canvas>
  )
}

function SceneContents({ theme, reducedMotion, hovered, category, spinSignal, onHover, onSelect }: TopologySceneProps) {
  const palette = usePalette(theme)
  const light = theme === 'light'
  const fine = useMemo(isFinePointer, [])

  useEffect(() => {
    document.body.style.cursor = hovered && hovered !== 'internet' ? 'pointer' : ''
    return () => {
      document.body.style.cursor = ''
    }
  }, [hovered])

  return (
    <>
      <color attach="background" args={[palette.bg]} />
      <fog attach="fog" args={[palette.bg, 11, 24]} />
      <ambientLight intensity={light ? 1.1 : 0.35} />
      <directionalLight position={[4, 6, 5]} intensity={light ? 1.6 : 1.2} />
      <pointLight position={[-4, -2, 4]} intensity={light ? 6 : 22} color={palette.accent} distance={14} />

      <Environment key={theme} resolution={128} frames={1}>
        <Lightformer form="rect" intensity={light ? 3 : 2.4} position={[0, 4, 4]} scale={[9, 1.6, 1]} />
        <Lightformer form="rect" intensity={1.3} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color={palette.infra} />
        <Lightformer form="rect" intensity={1.1} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color={palette.accent} />
      </Environment>

      <ViewOffset />
      <Network
        palette={palette}
        hovered={hovered}
        category={category}
        reducedMotion={reducedMotion}
        spinSignal={spinSignal}
        onHover={onHover}
        onSelect={onSelect}
      />
      <Sparkles count={70} scale={[14, 9, 7]} size={1.6} speed={reducedMotion ? 0 : 0.25} opacity={light ? 0.35 : 0.55} color={palette.accent} />

      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        enableRotate={fine}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.4}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.5}
        minPolarAngle={Math.PI * 0.3}
        maxPolarAngle={Math.PI * 0.64}
      />

      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.62} luminanceSmoothing={0.18} intensity={light ? 0.35 : 1.15} radius={0.72} />
        <Vignette eskil={false} offset={0.25} darkness={light ? 0 : 0.55} />
      </EffectComposer>
    </>
  )
}

// Décale la projection : la topologie occupe la droite sur grand écran, le haut sur mobile
function ViewOffset() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  useEffect(() => {
    const { width: w, height: h } = size
    // même seuil que la mise en page du hero (lg = 1024 px)
    if (w >= 1024) {
      camera.setViewOffset(w, h, -w * 0.22, h * 0.085, w, h)
      camera.position.setLength(w / h > 1.9 ? 11.6 : 12.6)
    } else {
      // le haut du canvas passe sous la barre de navigation : on descend légèrement la scène
      camera.setViewOffset(w, h, 0, -h * 0.05, w, h)
      camera.position.setLength(w / h < 0.85 ? 17.5 : 13.5)
    }
    camera.updateProjectionMatrix()
    return () => camera.clearViewOffset()
  }, [camera, size])
  return null
}

interface LinkData {
  a: string
  b: string
  curve: THREE.QuadraticBezierCurve3
  points: THREE.Vector3[]
  delay: number
  category: CategoryId | 'core'
}

interface NetworkProps {
  palette: Palette
  hovered: string | null
  category: CategoryId | null
  reducedMotion: boolean
  spinSignal: number
  onHover: (id: string | null) => void
  onSelect: (projectId: string) => void
}

function Network({ palette, hovered, category, reducedMotion, spinSignal, onHover, onSelect }: NetworkProps) {
  const group = useRef<THREE.Group>(null)
  const spinVelocity = useRef(0)

  const indexOf = useMemo(() => new Map(TOPO_NODES.map((n, i) => [n.id, i])), [])
  const nodeOf = useMemo(() => new Map(TOPO_NODES.map((n) => [n.id, n])), [])

  const links = useMemo<LinkData[]>(
    () =>
      TOPO_LINKS.map(([a, b]) => {
        const A = nodeOf.get(a)!
        const B = nodeOf.get(b)!
        const pa = new THREE.Vector3(...A.position)
        const pb = new THREE.Vector3(...B.position)
        const mid = pa.clone().lerp(pb, 0.5)
        mid.z += 0.45
        mid.y += 0.12
        const curve = new THREE.QuadraticBezierCurve3(pa, mid, pb)
        return {
          a,
          b,
          curve,
          points: curve.getPoints(48),
          delay: Math.max(indexOf.get(a)!, indexOf.get(b)!) * STEP + 0.3,
          category: B.category,
        }
      }),
    [indexOf, nodeOf],
  )

  const related = useMemo(() => {
    if (!hovered) return null
    const set = new Set([hovered])
    TOPO_LINKS.forEach(([a, b]) => {
      if (a === hovered) set.add(b)
      if (b === hovered) set.add(a)
    })
    return set
  }, [hovered])

  useEffect(() => {
    if (spinSignal) spinVelocity.current += reducedMotion ? 0 : 9
  }, [spinSignal, reducedMotion])

  useFrame((_, dt) => {
    const g = group.current
    if (!g || spinVelocity.current < 0.01) return
    g.rotation.y += spinVelocity.current * dt
    spinVelocity.current *= Math.pow(0.15, dt)
  })

  const colorFor = (c: CategoryId | 'core') => palette[c]
  const isDim = (node: TopoNode) =>
    (related !== null && !related.has(node.id)) || (category !== null && node.category !== category)

  return (
    <group ref={group}>
      {links.map((l) => {
        const touchesHover = hovered !== null && (l.a === hovered || l.b === hovered)
        const inCategory = category !== null && l.category === category
        const dim = (hovered !== null && !touchesHover) || (category !== null && !inCategory)
        return (
          <NetLink
            key={`${l.a}-${l.b}`}
            points={l.points}
            color={colorFor(l.category)}
            delay={l.delay}
            active={touchesHover || inCategory}
            dim={dim}
            reducedMotion={reducedMotion}
          />
        )
      })}
      {TOPO_NODES.map((node, i) => (
        <Device
          key={node.id}
          node={node}
          delay={i * STEP}
          color={colorFor(node.category)}
          metal={palette.metal}
          hovered={hovered === node.id}
          dim={isDim(node)}
          reducedMotion={reducedMotion}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
      <Packets links={links} colorFor={colorFor} reducedMotion={reducedMotion} />
    </group>
  )
}

interface NetLinkProps {
  points: THREE.Vector3[]
  color: string
  delay: number
  active: boolean
  dim: boolean
  reducedMotion: boolean
}

function NetLink({ points, color, delay, active, dim, reducedMotion }: NetLinkProps) {
  const ref = useRef<Line2>(null)
  useFrame(({ clock }) => {
    const material = ref.current?.material
    if (!material) return
    const appear = reducedMotion ? 1 : THREE.MathUtils.clamp((clock.elapsedTime - delay) / 0.6, 0, 1)
    const target = (active ? 0.95 : dim ? 0.07 : 0.34) * appear
    material.opacity = THREE.MathUtils.lerp(material.opacity, target, reducedMotion ? 1 : 0.14)
    material.linewidth = active ? 2.4 : 1.3
  })
  return <Line ref={ref} points={points} color={color} lineWidth={1.3} transparent opacity={0} depthWrite={false} />
}

interface PacketsProps {
  links: LinkData[]
  colorFor: (c: CategoryId | 'core') => string
  reducedMotion: boolean
}

function Packets({ links, colorFor, reducedMotion }: PacketsProps) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const items = useMemo(
    () =>
      links.flatMap((_, i) => {
        const base = [{ link: i, offset: Math.random(), speed: 0.16 + Math.random() * 0.2, dir: 1 }]
        if (i % 2 === 0) base.push({ link: i, offset: Math.random(), speed: 0.12 + Math.random() * 0.14, dir: -1 })
        return base
      }),
    [links],
  )
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const point = useMemo(() => new THREE.Vector3(), [])

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const color = new THREE.Color()
    items.forEach((it, i) => {
      color.set(colorFor(links[it.link].category)).multiplyScalar(2.4)
      mesh.setColorAt(i, color)
    })
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [items, links, colorFor])

  useFrame(({ clock }) => {
    const mesh = ref.current
    if (!mesh) return
    const t = clock.elapsedTime
    items.forEach((it, i) => {
      const link = links[it.link]
      const visible = reducedMotion || t > link.delay + 0.7
      let u = reducedMotion ? it.offset : (it.offset + t * it.speed) % 1
      if (it.dir < 0) u = 1 - u
      link.curve.getPoint(u, point)
      dummy.position.copy(point)
      dummy.scale.setScalar(visible ? 1 : 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} frustumCulled={false}>
      <sphereGeometry args={[0.042, 12, 12]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

interface DeviceProps {
  node: TopoNode
  delay: number
  color: string
  metal: string
  hovered: boolean
  dim: boolean
  reducedMotion: boolean
  onHover: (id: string | null) => void
  onSelect: (projectId: string) => void
}

function Device({ node, delay, color, metal, hovered, dim, reducedMotion, onHover, onSelect }: DeviceProps) {
  const ref = useRef<THREE.Group>(null)
  const scale = useRef(reducedMotion ? 1 : 0)
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])

  const body = useMemo(
    () => new THREE.MeshStandardMaterial({ color: metal, metalness: 0.75, roughness: 0.32 }),
    [metal],
  )
  const led = useMemo(
    () => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.2, toneMapped: false }),
    [color],
  )
  useEffect(
    () => () => {
      body.dispose()
      led.dispose()
    },
    [body, led],
  )

  useFrame(({ clock }, dt) => {
    const g = ref.current
    if (!g) return
    const t = clock.elapsedTime
    const target = reducedMotion || t > delay ? (hovered ? 1.18 : 1) : 0
    scale.current = reducedMotion ? target : THREE.MathUtils.damp(scale.current, target, 7, dt)
    g.scale.setScalar(Math.max(scale.current, 0.001))
    if (!reducedMotion) g.position.y = node.position[1] + Math.sin(t * 0.8 + phase) * 0.05
    led.emissiveIntensity = (dim ? 0.5 : hovered ? 3.4 : 2.2) + (reducedMotion ? 0 : Math.sin(t * 2.4 + phase) * 0.5)
  })

  return (
    <group
      ref={ref}
      position={node.position}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(node.id)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        onHover(null)
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (node.projectId) onSelect(node.projectId)
      }}
    >
      <mesh>
        <sphereGeometry args={[0.62, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <DeviceModel type={node.device} body={body} led={led} />
      <Html position={[0, LABEL_Y[node.device], 0]} center distanceFactor={7.5} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div
          className={cx('topo-label', hovered && 'is-hover', dim && 'is-dim')}
          style={{ animationDelay: `${reducedMotion ? 0 : delay + 0.35}s`, color }}
        >
          <span className="dot" style={{ background: color }} />
          <span style={{ color: 'var(--fg)' }}>{node.label}</span>
        </div>
      </Html>
    </group>
  )
}

function DeviceModel({ type, body, led }: { type: DeviceType; body: THREE.Material; led: THREE.Material }) {
  switch (type) {
    case 'server':
      return (
        <group>
          <RoundedBox args={[0.52, 0.74, 0.5]} radius={0.05} smoothness={3} material={body} />
          {[-0.22, -0.07, 0.08, 0.23].map((y) => (
            <mesh key={y} position={[-0.04, y, 0.252]} material={led}>
              <boxGeometry args={[0.32, 0.028, 0.01]} />
            </mesh>
          ))}
          <mesh position={[0.19, 0.23, 0.252]} material={led}>
            <boxGeometry args={[0.04, 0.04, 0.01]} />
          </mesh>
        </group>
      )
    case 'switch':
      return (
        <group>
          <RoundedBox args={[1.06, 0.2, 0.48]} radius={0.04} smoothness={3} material={body} />
          {Array.from({ length: 10 }, (_, i) => (
            <mesh key={i} position={[-0.42 + i * 0.085, 0.01, 0.242]} material={led}>
              <boxGeometry args={[0.05, 0.045, 0.01]} />
            </mesh>
          ))}
        </group>
      )
    case 'firewall':
      return (
        <group>
          <RoundedBox args={[0.84, 0.32, 0.5]} radius={0.05} smoothness={3} material={body} />
          <mesh position={[0, 0.03, 0.252]} material={led}>
            <boxGeometry args={[0.6, 0.05, 0.01]} />
          </mesh>
          {[-0.3, -0.22, -0.14].map((x) => (
            <mesh key={x} position={[x, -0.08, 0.252]} material={led}>
              <boxGeometry args={[0.04, 0.04, 0.01]} />
            </mesh>
          ))}
        </group>
      )
    case 'board':
      return (
        <group rotation={[0.35, 0, 0]}>
          <RoundedBox args={[0.66, 0.06, 0.46]} radius={0.02} smoothness={2} material={body} />
          <mesh position={[0.02, 0.06, 0]} material={body}>
            <boxGeometry args={[0.2, 0.06, 0.2]} />
          </mesh>
          {[-0.2, -0.05].map((z) => (
            <mesh key={z} position={[0.28, 0.06, z]} material={body}>
              <boxGeometry args={[0.12, 0.08, 0.1]} />
            </mesh>
          ))}
          <mesh position={[-0.24, 0.045, 0.16]} material={led}>
            <boxGeometry args={[0.05, 0.03, 0.05]} />
          </mesh>
          <mesh position={[-0.24, 0.045, 0.06]} material={led}>
            <boxGeometry args={[0.05, 0.03, 0.05]} />
          </mesh>
        </group>
      )
    case 'app':
      return (
        <group>
          <RoundedBox args={[0.66, 0.44, 0.05]} radius={0.025} smoothness={2} material={body} />
          <mesh position={[0, 0.01, 0.027]} material={led}>
            <planeGeometry args={[0.56, 0.34]} />
          </mesh>
          <mesh position={[0, -0.3, -0.02]} material={body}>
            <boxGeometry args={[0.06, 0.16, 0.04]} />
          </mesh>
          <mesh position={[0, -0.38, 0]} material={body}>
            <boxGeometry args={[0.3, 0.025, 0.16]} />
          </mesh>
        </group>
      )
    case 'cloud':
      return (
        <group>
          <mesh>
            <icosahedronGeometry args={[0.46, 1]} />
            <meshBasicMaterial color="#8f9cb6" wireframe transparent opacity={0.45} />
          </mesh>
          <mesh material={led}>
            <sphereGeometry args={[0.16, 24, 24]} />
          </mesh>
        </group>
      )
  }
}
