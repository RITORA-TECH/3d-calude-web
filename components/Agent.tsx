"use client";

import { useMemo, useRef } from "react";
import { useGLTF, useAnimations, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

useGLTF.preload("/models/RobotExpressive/RobotExpressive.glb");
useTexture.preload("/ritora-symbol.png");

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

  // Circular Ritora "R" badge centered on the chest, facing forward (+Z).
  // Anchored to the Torso mesh's own bounds so it lands correctly on every
  // crew member regardless of their group scale.
  const logoTex = useTexture("/ritora-symbol.png");
  const chest = useMemo(() => {
    logoTex.colorSpace = THREE.SRGBColorSpace;
    logoTex.anisotropy = 8;
    cloned.updateWorldMatrix(true, true);
    const torso = cloned.getObjectByName("Torso") as THREE.Mesh | null;
    const tbox = new THREE.Box3();
    if (torso?.geometry) {
      torso.geometry.computeBoundingBox();
      tbox.copy(torso.geometry.boundingBox!).applyMatrix4(torso.matrixWorld);
    } else if (torso) {
      tbox.setFromObject(torso);
    } else {
      tbox.setFromObject(cloned);
    }
    const size = tbox.getSize(new THREE.Vector3());
    const center = tbox.getCenter(new THREE.Vector3());
    // small emblem — roughly a tenth of the chest width, centered
    const r = size.x * 0.11;
    return {
      // middle of the chest, sitting just proud of the front surface
      position: [center.x, center.y, tbox.max.z + r * 0.04] as [number, number, number],
      radius: r,
    };
  }, [cloned, logoTex]);

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

      {/* circular chest badge: accent ring · dark disc · "R" symbol */}
      <group position={chest.position}>
        <mesh>
          <circleGeometry args={[chest.radius * 1.12, 56]} />
          <meshStandardMaterial color="#ff5d3b" roughness={0.5} metalness={0.1} emissive="#ff5d3b" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, 0, chest.radius * 0.01]}>
          <circleGeometry args={[chest.radius, 56]} />
          <meshStandardMaterial color="#0a0c16" roughness={0.45} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0, chest.radius * 0.02]} renderOrder={2}>
          <planeGeometry args={[chest.radius * 1.7, chest.radius * 1.7]} />
          <meshBasicMaterial map={logoTex} transparent alphaTest={0.3} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
