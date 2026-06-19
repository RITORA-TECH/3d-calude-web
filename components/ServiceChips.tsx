"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { services } from "@/lib/content";
import { makeLabelTexture } from "@/lib/label";
import { scrollState } from "@/lib/scroll";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * The five services, each tied to a part of the car. They burst OUT of the
 * crash (so the viewer sees what the car is "made of" = what we build), hang
 * in the air to be read, then fly BACK INTO the repaired car as the dev crew
 * reassembles it.
 */
const BURST = new THREE.Vector3(2.0, 0.9, 0); // the impact point (parts fly out)
const CAR = new THREE.Vector3(-1.0, 0.85, 0); // repaired car (parts fly back in)

const SLOTS: [number, number, number][] = [
  [-2.4, 3.0, 1.0],
  [-0.2, 4.4, -0.4],
  [2.0, 4.9, 0.8],
  [4.2, 4.0, -0.5],
  [6.2, 2.8, 0.7],
];

const ACCENTS = ["#ff5d3b", "#3b82f6", "#22c55e", "#a855f7", "#06b6d4"];

export default function ServiceChips() {
  const chips = useMemo(
    () =>
      services.slice(0, 5).map((s, i) => ({
        // title + the car part it maps to, so the metaphor is explicit
        tex: makeLabelTexture(s.title, s.part, ACCENTS[i % ACCENTS.length]),
        slot: new THREE.Vector3(...SLOTS[i]),
        accent: ACCENTS[i % ACCENTS.length],
      })),
    []
  );

  const refs = useRef<THREE.Group[]>([]);
  const tmp = useRef(new THREE.Vector3());

  useFrame(() => {
    const p = scrollState.progress;
    const out = smooth(0.37, 0.47, p); // burst out of the crash
    const back = smooth(0.55, 0.64, p); // fly back into the repaired car

    chips.forEach((chip, i) => {
      const g = refs.current[i];
      if (!g) return;
      const delay = i * 0.05;
      const b = clamp01((out - delay) / (1 - delay));
      const scale = b * (1 - back);
      g.visible = scale > 0.001;
      if (!g.visible) return;
      if (back <= 0.0001) {
        // burst point -> slot
        tmp.current.copy(BURST).lerp(chip.slot, b);
      } else {
        // slot -> repaired car (reassembly)
        tmp.current.copy(chip.slot).lerp(CAR, back);
      }
      g.position.copy(tmp.current);
      g.scale.setScalar(scale);
    });
  });

  return (
    <>
      {chips.map((chip, i) => (
        <Billboard
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
          visible={false}
        >
          {/* glow */}
          <mesh position={[0, 0, -0.05]} scale={[3.6, 1.5, 1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              color={chip.accent}
              transparent
              opacity={0.28}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          {/* label */}
          <mesh>
            <planeGeometry args={[3.0, 1.125]} />
            <meshBasicMaterial map={chip.tex} transparent toneMapped={false} />
          </mesh>
        </Billboard>
      ))}
    </>
  );
}
