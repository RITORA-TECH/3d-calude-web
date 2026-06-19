"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";

/* ---------- palette ---------- */
const PAINT = "#18233f";
const PAINT_DARK = "#0f1830";
const GLASS = "#9fd8ff";
const TIRE = "#101013";
const RIM = "#c9ccd6";
const ACCENT = "#ff5d3b";

/* ---------- math helpers ---------- */
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* ---------- one explodable part ---------- */
type PartDef = {
  home: [number, number, number];
  explode: [number, number, number]; // extra offset when fully exploded
  spin?: [number, number, number]; // extra rotation when exploded
  children: React.ReactNode;
};

function buildParts(): PartDef[] {
  const paint = (
    <meshStandardMaterial color={PAINT} metalness={0.95} roughness={0.28} />
  );
  const paintDark = (
    <meshStandardMaterial color={PAINT_DARK} metalness={0.9} roughness={0.35} />
  );

  const parts: PartDef[] = [
    // chassis / lower body
    {
      home: [0, 0.55, 0],
      explode: [0, -1.6, 0],
      children: (
        <RoundedBox args={[4.3, 0.55, 1.95]} radius={0.14} smoothness={4} castShadow>
          {paintDark}
        </RoundedBox>
      ),
    },
    // hood (front)
    {
      home: [1.25, 0.95, 0],
      explode: [2.0, 0.9, 0],
      spin: [0, 0, -0.4],
      children: (
        <RoundedBox args={[1.5, 0.32, 1.75]} radius={0.1} smoothness={4} castShadow>
          {paint}
        </RoundedBox>
      ),
    },
    // cabin / roof
    {
      home: [-0.15, 1.2, 0],
      explode: [0, 2.6, 0],
      spin: [0.3, 0, 0],
      children: (
        <RoundedBox args={[1.7, 0.62, 1.55]} radius={0.16} smoothness={4} castShadow>
          {paint}
        </RoundedBox>
      ),
    },
    // rear deck
    {
      home: [-1.55, 0.95, 0],
      explode: [-2.1, 0.8, 0],
      spin: [0, 0, 0.4],
      children: (
        <RoundedBox args={[1.1, 0.34, 1.8]} radius={0.1} smoothness={4} castShadow>
          {paint}
        </RoundedBox>
      ),
    },
    // windshield (glass)
    {
      home: [0.7, 1.25, 0],
      explode: [1.4, 2.4, 0],
      spin: [0.5, 0, 0],
      children: (
        <mesh rotation={[0, 0, -0.5]} castShadow>
          <boxGeometry args={[0.08, 0.7, 1.45]} />
          <meshPhysicalMaterial
            color={GLASS}
            transmission={0.9}
            transparent
            opacity={0.55}
            roughness={0.05}
            metalness={0}
            thickness={0.3}
          />
        </mesh>
      ),
    },
    // left door
    {
      home: [-0.15, 0.7, 0.99],
      explode: [0, 0.4, 2.2],
      spin: [0, -0.6, 0],
      children: (
        <RoundedBox args={[1.7, 0.7, 0.08]} radius={0.06} smoothness={4} castShadow>
          {paint}
        </RoundedBox>
      ),
    },
    // right door
    {
      home: [-0.15, 0.7, -0.99],
      explode: [0, 0.4, -2.2],
      spin: [0, 0.6, 0],
      children: (
        <RoundedBox args={[1.7, 0.7, 0.08]} radius={0.06} smoothness={4} castShadow>
          {paint}
        </RoundedBox>
      ),
    },
    // front bumper
    {
      home: [2.15, 0.5, 0],
      explode: [2.6, 0.2, 0],
      children: (
        <RoundedBox args={[0.35, 0.45, 1.85]} radius={0.12} smoothness={4} castShadow>
          {paintDark}
        </RoundedBox>
      ),
    },
    // rear bumper
    {
      home: [-2.15, 0.5, 0],
      explode: [-2.6, 0.2, 0],
      children: (
        <RoundedBox args={[0.35, 0.45, 1.85]} radius={0.12} smoothness={4} castShadow>
          {paintDark}
        </RoundedBox>
      ),
    },
    // spoiler
    {
      home: [-2.0, 1.15, 0],
      explode: [-2.6, 2.2, 0],
      spin: [0, 0, 0.6],
      children: (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.06, 1.6]} />
            <meshStandardMaterial color={PAINT_DARK} metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ),
    },
    // headlights (emissive)
    {
      home: [2.2, 0.75, 0.6],
      explode: [3.0, 1.2, 1.0],
      children: (
        <mesh>
          <boxGeometry args={[0.12, 0.2, 0.45]} />
          <meshStandardMaterial color="#ffffff" emissive="#bfe6ff" emissiveIntensity={3} />
        </mesh>
      ),
    },
    {
      home: [2.2, 0.75, -0.6],
      explode: [3.0, 1.2, -1.0],
      children: (
        <mesh>
          <boxGeometry args={[0.12, 0.2, 0.45]} />
          <meshStandardMaterial color="#ffffff" emissive="#bfe6ff" emissiveIntensity={3} />
        </mesh>
      ),
    },
    // tail lights (accent)
    {
      home: [-2.2, 0.8, 0],
      explode: [-3.1, 1.4, 0],
      children: (
        <mesh>
          <boxGeometry args={[0.1, 0.18, 1.4]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={2.5} />
        </mesh>
      ),
    },
    // engine block (hidden inside, rises on explode)
    {
      home: [1.2, 0.55, 0],
      explode: [1.2, 2.9, 0],
      spin: [0, 1.2, 0],
      children: (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.6, 1.1]} />
            <meshStandardMaterial color="#2a2f3a" metalness={1} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <boxGeometry args={[0.5, 0.3, 0.7]} />
            <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.2} metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ),
    },
  ];

  // four wheels
  const wheelXY: [number, number][] = [
    [1.45, 0.99],
    [1.45, -0.99],
    [-1.45, 0.99],
    [-1.45, -0.99],
  ];
  for (const [x, z] of wheelXY) {
    parts.push({
      home: [x, 0.5, z],
      explode: [x * 0.4, -1.8, z * 1.8],
      children: (
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.35, 28]} />
            <meshStandardMaterial color={TIRE} metalness={0.2} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.06, 20]} />
            <meshStandardMaterial color={RIM} metalness={1} roughness={0.25} />
          </mesh>
        </group>
      ),
    });
  }

  return parts;
}

export default function CarModel() {
  const group = useRef<THREE.Group>(null!);
  const refs = useRef<THREE.Group[]>([]);
  const parts = useRef<PartDef[]>(buildParts());
  // first 4 wheels live at the tail of the array
  const wheelStart = parts.current.length - 4;
  const wheelRoll = useRef(0);

  useFrame((_, delta) => {
    const o = scrollState.progress; // 0 → 1 across the page

    // phase curves
    const driveIn = smooth(0.0, 0.1, o); // 0→1 car arrives
    const explode = smooth(0.14, 0.4, o) * (1 - smooth(0.66, 0.82, o)); // up then back
    const driveOff = smooth(0.82, 1.0, o); // exits to the right

    // chassis travels in from the left and later rolls off-screen
    const baseX = THREE.MathUtils.lerp(-22, 0, driveIn) + driveOff * 26;
    if (group.current) {
      group.current.position.x = baseX;
      // gentle hero turntable while assembled
      group.current.rotation.y = (1 - explode) * Math.sin(o * 6) * 0.12 - 0.35;
    }

    // wheels roll whenever the car is moving
    const moving = driveIn < 1 ? 1 : driveOff > 0 ? 1 : 0;
    wheelRoll.current += delta * 9 * moving;

    const list = parts.current;
    for (let i = 0; i < list.length; i++) {
      const el = refs.current[i];
      if (!el) continue;
      const p = list[i];
      el.position.set(
        p.home[0] + p.explode[0] * explode,
        p.home[1] + p.explode[1] * explode,
        p.home[2] + p.explode[2] * explode
      );
      if (p.spin) {
        el.rotation.set(p.spin[0] * explode, p.spin[1] * explode, p.spin[2] * explode);
      }
      // roll the wheels around their axle (Z)
      if (i >= wheelStart) {
        el.rotation.z = -wheelRoll.current;
      }
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      {parts.current.map((p, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
        >
          {p.children}
        </group>
      ))}
    </group>
  );
}
