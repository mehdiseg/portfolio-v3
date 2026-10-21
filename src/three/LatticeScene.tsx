import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Theme } from '../context/UIContext'
import { cssVar, isFinePointer } from '../lib/utils'

interface LatticeSceneProps {
  active: boolean
  theme: Theme
  reducedMotion: boolean
}

// Réseau euclidien (lattice) : la structure derrière ML-KEM et ML-DSA.
// Les points décalés et leurs vecteurs d'erreur illustrent le problème LWE.
export default function LatticeScene({ active, theme, reducedMotion }: LatticeSceneProps) {
  const colors = useMemo(
    () => ({ bg: cssVar('--deep', '#0c1322'), node: cssVar('--accent', '#9d8cff'), noise: cssVar('--c-infra', '#4c8dff') }),
    // recalculées au changement de thème
    [theme],
  )
  const fine = useMemo(isFinePointer, [])

  return (
    <Canvas dpr={[1, 1.5]} frameloop={active ? 'always' : 'never'} camera={{ position: [0, 0, 12.5], fov: 38 }}>
      <color attach="background" args={[colors.bg]} />
      <Lattice nodeColor={colors.node} noiseColor={colors.noise} reducedMotion={reducedMotion} light={theme === 'light'} />
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={fine} autoRotate={!reducedMotion} autoRotateSpeed={0.9} enableDamping />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.5} intensity={theme === 'light' ? 0.3 : 1} radius={0.6} />
      </EffectComposer>
    </Canvas>
  )
}

function Lattice({ nodeColor, noiseColor, reducedMotion, light }: { nodeColor: string; noiseColor: string; reducedMotion: boolean; light: boolean }) {
  const group = useRef<THREE.Group>(null)
  const nodesRef = useRef<THREE.InstancedMesh>(null)
  const noisyRef = useRef<THREE.InstancedMesh>(null)
  const errorRef = useRef<THREE.LineSegments>(null)

  const data = useMemo(() => {
    const N = 5
    const S = 1.15
    const b1 = new THREE.Vector3(1, 0.2, 0.05).multiplyScalar(S)
    const b2 = new THREE.Vector3(0.25, 1, 0.12).multiplyScalar(S)
    const b3 = new THREE.Vector3(0.1, 0.3, 1).multiplyScalar(S)
    const h = (N - 1) / 2
    const idx = (i: number, j: number, k: number) => (i * N + j) * N + k
    const nodes: THREE.Vector3[] = []
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++)
        for (let k = 0; k < N; k++)
          nodes.push(new THREE.Vector3().addScaledVector(b1, i - h).addScaledVector(b2, j - h).addScaledVector(b3, k - h))
    const edges: number[] = []
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++)
        for (let k = 0; k < N; k++) {
          const a = nodes[idx(i, j, k)]
          ;[
            [i + 1, j, k],
            [i, j + 1, k],
            [i, j, k + 1],
          ].forEach(([x, y, z]) => {
            if (x >= N || y >= N || z >= N) return
            const b = nodes[idx(x, y, z)]
            edges.push(a.x, a.y, a.z, b.x, b.y, b.z)
          })
        }
    const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random())
    const noisy = nodes
      .map((p, i) => ({ i, p, e: new THREE.Vector3(gauss(), gauss(), gauss()).multiplyScalar(0.17), phase: Math.random() * 6.28 }))
      .filter(() => Math.random() < 0.34)
    return { nodes, edges: new Float32Array(edges), noisy }
  }, [])

  const errorPositions = useMemo(() => new Float32Array(data.noisy.length * 6), [data])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useLayoutEffect(() => {
    const mesh = nodesRef.current
    if (!mesh) return
    data.nodes.forEach((p, i) => {
      dummy.position.copy(p)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [data, dummy])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const noisy = noisyRef.current
    const err = errorRef.current
    if (!noisy || !err) return
    data.noisy.forEach((n, k) => {
      const amp = reducedMotion ? 1 : 0.65 + 0.35 * Math.sin(t * 1.4 + n.phase)
      const x = n.p.x + n.e.x * amp
      const y = n.p.y + n.e.y * amp
      const z = n.p.z + n.e.z * amp
      dummy.position.set(x, y, z)
      dummy.updateMatrix()
      noisy.setMatrixAt(k, dummy.matrix)
      errorPositions.set([n.p.x, n.p.y, n.p.z, x, y, z], k * 6)
    })
    noisy.instanceMatrix.needsUpdate = true
    err.geometry.attributes.position.needsUpdate = true
    if (group.current && !reducedMotion) group.current.rotation.x = 0.4 + Math.sin(t * 0.25) * 0.08
  })

  const nodeEmissive = useMemo(() => new THREE.Color(nodeColor).multiplyScalar(light ? 1 : 1.8), [nodeColor, light])
  const noiseEmissive = useMemo(() => new THREE.Color(noiseColor).multiplyScalar(light ? 1 : 2.4), [noiseColor, light])

  return (
    <group ref={group} rotation={[0.4, 0.5, -0.1]}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.edges, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={nodeColor} transparent opacity={light ? 0.35 : 0.22} />
      </lineSegments>
      <instancedMesh ref={nodesRef} args={[undefined, undefined, data.nodes.length]}>
        <sphereGeometry args={[0.07, 14, 14]} />
        <meshBasicMaterial color={nodeEmissive} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={noisyRef} args={[undefined, undefined, data.noisy.length]} frustumCulled={false}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshBasicMaterial color={noiseEmissive} toneMapped={false} />
      </instancedMesh>
      <lineSegments ref={errorRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[errorPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={noiseColor} transparent opacity={0.8} />
      </lineSegments>
    </group>
  )
}
