"use client";

import { useMemo } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

useGLTF.preload("/models/ferrari.glb", "/draco/");
useTexture.preload("/ritora-symbol.png");

/** A flat "R" emblem on a wheel's outer face — spins with the wheel. */
function addWheelLogo(model: THREE.Object3D, wheelName: string, tex: THREE.Texture) {
  const wheel = model.getObjectByName(wheelName);
  if (!wheel) return;
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(wheel);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const wpos = wheel.getWorldPosition(new THREE.Vector3());
  const sign = center.x >= 0 ? 1 : -1; // outward side
  const radius = Math.max(size.y, size.z) / 2;
  const outerX = sign > 0 ? box.max.x : box.min.x;
  const s = radius * 1.2;

  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    alphaTest: 0.4,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  // local to the wheel node (its origin is the spin axis), proud of the tyre face
  m.position.set(outerX - wpos.x + sign * 0.012, 0, 0);
  m.rotation.y = sign > 0 ? Math.PI / 2 : -Math.PI / 2;
  m.scale.set(sign * s, s, 1); // sign flips X so the R reads correctly on both sides
  m.renderOrder = 2;
  wheel.add(m);
}

type Props = {
  color?: string;
  /** mutable spin speed (radians/sec) set by the orchestrator */
  rollRef: React.RefObject<number>;
};

export default function Ferrari({ color = "#c81e2a", rollRef }: Props) {
  const { scene } = useGLTF("/models/ferrari.glb", "/draco/");
  const logoTex = useTexture("/ritora-symbol.png");

  const model = useMemo(() => {
    const c = scene.clone(true);
    logoTex.colorSpace = THREE.SRGBColorSpace;
    logoTex.anisotropy = 8;

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

    // brand the car: "R" on each wheel face (no logo on the body itself)
    for (const w of ["wheel_fl", "wheel_fr", "wheel_rl", "wheel_rr"]) {
      addWheelLogo(c, w, logoTex);
    }
    return c;
  }, [scene, color, logoTex]);

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
