import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

// 6 fases de la planta, espaciadas a lo largo del eje X (track físico continuo)
const PHASES = [
  { id: 'intake', x: 0,   label: 'Captación' },
  { id: 'coag',   x: 14,  label: 'Coagulación + Floculación' },
  { id: 'sedim',  x: 28,  label: 'Sedimentación' },   // HERO hi-fi
  { id: 'filtr',  x: 42,  label: 'Filtración' },
  { id: 'disinf', x: 56,  label: 'Desinfección' },
  { id: 'sludge', x: 70,  label: 'Lodos + Recuperación' },
]

// ---------- Piezas procedurales ----------

function Tank({ position, radius = 1.2, height = 2.4, color = '#3b82f6', metal = 0.4, roughness = 0.35, hero = false }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, height, 48]} />
        <meshStandardMaterial color={color} metalness={metal} roughness={roughness} />
      </mesh>
      <mesh position={[0, height / 2 + 0.05, 0]}>
        <cylinderGeometry args={[radius * 0.98, radius, 0.12, 48]} />
        <meshStandardMaterial color="#1e3a8a" metalness={0.6} roughness={0.3} />
      </mesh>
      {hero && (
        <mesh position={[0, height / 2 + 0.4, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#60a5fa" metalness={0.1} roughness={0.2} transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  )
}

function Pipe({ from, to, color = '#94a3b8' }) {
  const mid = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2]
  const len = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2])
  return (
    <mesh position={mid} rotation={[0, 0, Math.atan2(to[1] - from[1], to[0] - from[0])]}>
      <cylinderGeometry args={[0.12, 0.12, len, 12]} />
      <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
    </mesh>
  )
}

function Silhouette({ position, kind }) {
  // Blocking/silueta para fases no-hero: geometría simple, color oscuro, sin detalle
  const geo = useMemo(() => {
    switch (kind) {
      case 'intake': return <boxGeometry args={[3.2, 2.2, 2.2]} />
      case 'coag': return <cylinderGeometry args={[1.6, 1.6, 3.0, 24]} />
      case 'filtr': return <boxGeometry args={[3.4, 2.6, 2.0]} />
      case 'disinf': return <cylinderGeometry args={[1.3, 1.3, 3.4, 24]} />
      case 'sludge': return <coneGeometry args={[2.0, 3.0, 24]} />
      default: return <boxGeometry args={[2.0, 2.0, 2.0]} />
    }
  }, [kind])
  return (
    <group position={position}>
      <mesh castShadow>{geo}<meshStandardMaterial color="#475569" metalness={0.3} roughness={0.6} /></mesh>
    </group>
  )
}

// ---------- Fase hero: Sedimentación (clarificador) ----------
function HeroClarifier({ position }) {
  return (
    <group position={position}>
      <Tank position={[0, 0, 0]} radius={2.2} height={1.6} color="#2563eb" hero />
      <Tank position={[3.4, 0, 0]} radius={1.4} height={2.0} color="#3b82f6" />
      <Pipe from={[0, 0.8, 0]} to={[3.4, 1.0, 0]} />
      <Pipe from={[3.4, 1.0, 0]} to={[5.2, 0.6, 0]} />
      {/* flujo de agua */}
      <mesh position={[0, 1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.06, 12, 48]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.6} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

// ---------- Track completo ----------
function PlantTrack() {
  return (
    <group>
      {PHASES.map((p) => (
        p.id === 'sedim'
          ? <HeroClarifier key={p.id} position={[p.x, 0, 0]} />
          : <Silhouette key={p.id} position={[p.x, 0, 0]} kind={p.id} />
      ))}
      {/* suelo continuo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[35, -1.4, 0]}>
        <planeGeometry args={[90, 20]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
    </group>
  )
}

// ---------- Cámara scroll-scrubbed ----------
function ScrollCamera() {
  const { camera } = useThree()
  const target = useRef(0)
  useFrame(() => {
    // progreso 0..1 según scroll de la página
    const progress = Math.min(1, Math.max(0, window.scrollY / (document.body.scrollHeight - window.innerHeight)))
    // fase activa (1..6) → posición X de esa fase
    const stage = Math.min(6, Math.max(1, Math.floor(progress * 6) + 1))
    const x = PHASES[stage - 1].x
    target.current += (x - target.current) * 0.08
    camera.position.set(target.current, 2.6, 6)
    camera.lookAt(target.current, 0.8, 0)
  })
  return null
}

export default function PlantScene() {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2.6, 6], fov: 45 }}>
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.7} />
                  <directionalLight position={[20, 20, 10]} intensity={1.8} castShadow />
                  <pointLight position={[28, 6, 4]} intensity={1.2} color="#38bdf8" />
                  <pointLight position={[0, 6, 4]} intensity={0.8} color="#60a5fa" />
                  <pointLight position={[35, 8, -6]} intensity={0.6} color="#7dd3fc" />
            <PlantTrack />
            <ScrollCamera />
            <ContactShadows position={[35, -1.3, 0]} opacity={0.5} scale={90} blur={2.4} far={4} />
    </Canvas>
  )
}
