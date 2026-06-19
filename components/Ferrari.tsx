"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

useGLTF.preload("/models/ferrari.glb", "/draco/");

type Props = {
  color?: string;
  /** mutable spin speed (radians/sec) set by the orchestrator */
  rollRef: React.RefObject<number>;
};

export default function Ferrari({ color = "#c81e2a", rollRef }: Props) {
  const { scene } = useGLTF("/models/ferrari.glb", "/draco/");

  const model = useMemo(() => {
    const c = scene.clone(true);

    const body = c.getObjectByName("body") as THREE.Mesh | undefined;
    if (body) {
      body.material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(color),
        metalness: 1,
        roughness: 0.35,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
      });
    }

    const glass = c.getObjectByName("glass") as THREE.Mesh | undefined;
    if (glass) {
      glass.material = new THREE.MeshPhysicalMaterial({
        color: "#0d1118",
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.8,
        transparent: true,
        opacity: 0.65,
      });
    }

    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    return c;
  }, [scene, color]);

  const wheels = useMemo(
    () =>
      (["wheel_fl", "wheel_fr", "wheel_rl", "wheel_rr"]
        .map((n) => model.getObjectByName(n))
        .filter(Boolean) as THREE.Object3D[]),
    [model]
  );

  useFrame((_, dt) => {
    const roll = rollRef.current ?? 0;
    for (const w of wheels) w.rotation.x -= roll * dt;
  });

  return <primitive object={model} />;
}
