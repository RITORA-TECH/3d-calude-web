"use client";

import { useMemo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

useGLTF.preload("/models/RobotExpressive/RobotExpressive.glb");

// only the seated pose should freeze on its last frame; everything else loops
const ONCE = new Set(["Sitting"]);

type Props = {
  /** desired clip name, mutated by the orchestrator */
  actionRef: React.RefObject<string>;
  color?: string;
};

/** A self-contained, independently-animated robot (cloned so we can have many). */
export default function Agent({ actionRef, color }: Props) {
  const group = useRef<THREE.Group>(null!);
  const { scene, animations } = useGLTF(
    "/models/RobotExpressive/RobotExpressive.glb"
  );

  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Group;
    const tint = color ? new THREE.Color(color) : null;
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      const src = m.material as THREE.MeshStandardMaterial;
      if (!src || !("color" in src)) return;
      // glossy, environment-lit finish so the robot reads as a polished android
      const mat = src.clone();
      mat.metalness = 0.85;
      mat.roughness = 0.25;
      mat.envMapIntensity = 1.4;
      if (tint) {
        // keep the model's shading variation but push it toward the crew colour
        mat.color.lerp(tint, 0.7);
        mat.emissive = tint.clone().multiplyScalar(0.15);
      }
      m.material = mat;
    });
    return c;
  }, [scene, color]);

  const { actions } = useAnimations(animations, group);
  const current = useRef("");

  useFrame(() => {
    const want = actionRef.current || "Idle";
    if (want === current.current) return;
    const next = actions[want];
    const prev = actions[current.current];
    if (next) {
      next.reset().fadeIn(0.3).play();
      if (ONCE.has(want)) {
        next.clampWhenFinished = true;
        next.setLoop(THREE.LoopOnce, 1);
      } else {
        next.setLoop(THREE.LoopRepeat, Infinity);
      }
    }
    if (prev) prev.fadeOut(0.3);
    current.current = want;
  });

  return (
    <group ref={group}>
      <primitive object={cloned} />
    </group>
  );
}
