"use client";

import { useMemo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

useGLTF.preload("/models/RobotExpressive/RobotExpressive.glb");

const ONCE = new Set(["Sitting", "Wave", "ThumbsUp", "Yes", "No", "Jump", "Punch"]);

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
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      if (color) {
        const mat = m.material as THREE.MeshStandardMaterial;
        if (mat && "color" in mat) {
          m.material = mat.clone();
          (m.material as THREE.MeshStandardMaterial).color = new THREE.Color(color);
        }
      }
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
