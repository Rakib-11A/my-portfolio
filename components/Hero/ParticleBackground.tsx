"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 4000;
const SPHERE_RADIUS = 1.7;
const REPEL_RADIUS = 0.55;
const REPEL_STRENGTH = 0.6;
const RETURN_LERP = 0.075;
const ROT_SPEED_Y = 0.045;
const ROT_SPEED_X = 0.012;

function particleJitter(index: number): number {
  const value = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function Particles() {
  const pointsRef = useRef<THREE.Points>(null);

  // Even sphere distribution via Fibonacci spiral. Slight radial jitter
  // gives the surface a hint of depth without breaking the silhouette.
  const { positions, original } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const original = new Float32Array(PARTICLE_COUNT * 3);
    const goldenAngle = Math.PI * (Math.sqrt(5) - 1);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = SPHERE_RADIUS * (0.92 + particleJitter(i) * 0.16);
      const yNorm = 1 - (i / (PARTICLE_COUNT - 1)) * 2;
      const ringRadius = Math.sqrt(1 - yNorm * yNorm);
      const theta = goldenAngle * i;

      const x = Math.cos(theta) * ringRadius * r;
      const y = yNorm * r;
      const z = Math.sin(theta) * ringRadius * r;

      positions[i * 3]     = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      original[i * 3]      = x;
      original[i * 3 + 1]  = y;
      original[i * 3 + 2]  = z;
    }
    return { positions, original };
  }, []);

  // Reusable vectors — avoid GC churn inside useFrame.
  const mouseWorld = useMemo(() => new THREE.Vector3(), []);
  const mouseLocal = useMemo(() => new THREE.Vector3(), []);
  const rayDir = useMemo(() => new THREE.Vector3(), []);

  const { camera, pointer } = useThree();

  useFrame((_, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    points.rotation.y += delta * ROT_SPEED_Y;
    points.rotation.x += delta * ROT_SPEED_X;

    // Project NDC pointer onto z=0 plane in world space.
    mouseWorld.set(pointer.x, pointer.y, 0.5).unproject(camera);
    rayDir.copy(mouseWorld).sub(camera.position).normalize();
    if (rayDir.z !== 0) {
      const t = -camera.position.z / rayDir.z;
      mouseWorld.copy(camera.position).addScaledVector(rayDir, t);
    }

    // Mouse must be in the system's local frame so repulsion follows the rotation.
    mouseLocal.copy(mouseWorld);
    points.worldToLocal(mouseLocal);

    const arr = points.geometry.attributes.position.array as Float32Array;
    const r2 = REPEL_RADIUS * REPEL_RADIUS;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const iy = ix + 1;
      const iz = ix + 2;
      const ox = original[ix];
      const oy = original[iy];
      const oz = original[iz];

      const dx = ox - mouseLocal.x;
      const dy = oy - mouseLocal.y;
      const dz = oz - mouseLocal.z;
      const d2 = dx * dx + dy * dy + dz * dz;

      let tx = ox;
      let ty = oy;
      let tz = oz;

      if (d2 < r2) {
        const d = Math.sqrt(d2) || 0.0001;
        const force = (1 - d / REPEL_RADIUS) * REPEL_STRENGTH;
        tx += (dx / d) * force;
        ty += (dy / d) * force;
        tz += (dz / d) * force;
      }

      arr[ix] += (tx - arr[ix]) * RETURN_LERP;
      arr[iy] += (ty - arr[iy]) * RETURN_LERP;
      arr[iz] += (tz - arr[iz]) * RETURN_LERP;
    }

    points.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#d4af37"
        size={0.014}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ParticleBackground() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 4], fov: 55 }}
      className="!absolute inset-0"
    >
      <ambientLight intensity={0.5} />
      <Particles />
    </Canvas>
  );
}
