"use client";

import { useMemo, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

useGLTF.preload("/models/ferrari.glb", "/draco/");
useTexture.preload("/ritora-symbol.png");

const _q = new THREE.Quaternion();

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
  /** 0 = whole car · 1 = blown into parts (parts fly out then back) */
  explodeRef?: React.RefObject<number>;
  /** 1 = visible · 0 = faded away (the wrecked enemy dissolves at the end) */
  fadeRef?: React.RefObject<number>;
};

export default function Ferrari({ color = "#c81e2a", rollRef, explodeRef, fadeRef }: Props) {
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
        // clone materials so each car (hero/enemy) fades & recolours independently
        if (m.material) m.material = (m.material as THREE.Material).clone();
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

  // every detachable part of the car, with a random outward blast trajectory
  const parts = useMemo(() => {
    const cands: THREE.Object3D[] = [];
    const main = model.getObjectByName("main");
    if (main) for (const ch of main.children) cands.push(ch);
    for (const n of ["wheel_fl", "wheel_fr", "wheel_rl", "wheel_rr", "steering_wheel"]) {
      const o = model.getObjectByName(n);
      if (o) cands.push(o);
    }
    return cands.map((obj) => {
      const basePos = obj.position.clone();
      const dir = new THREE.Vector3(basePos.x, 0, basePos.z);
      if (dir.lengthSq() < 0.02) dir.set(Math.random() - 0.5, 0, Math.random() - 0.5);
      dir.normalize();
      dir.x += (Math.random() - 0.5) * 0.7;
      dir.z += (Math.random() - 0.5) * 0.7;
      dir.y = 0.6 + Math.random() * 1.4; // parts fly upward & out
      dir.normalize();
      return {
        obj,
        basePos,
        baseQuat: obj.quaternion.clone(),
        dir,
        axis: new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize(),
        spin: 2 + Math.random() * 4,
        dist: 1.3 + Math.random() * 2.6,
      };
    });
  }, [model]);

  // materials we fade out when the wrecked car dissolves
  const fadeMats = useMemo(() => {
    const mats: (THREE.Material & { opacity: number; transparent: boolean })[] = [];
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.material)
        mats.push(m.material as THREE.Material & { opacity: number; transparent: boolean });
    });
    return mats;
  }, [model]);

  const exploded = useRef(false);
  const fadeInit = useRef(false);

  useFrame((_, dt) => {
    const e = explodeRef?.current ?? 0;
    if (e > 0.0001) {
      // blow the car apart: each part slides out along its blast vector & tumbles
      for (const pt of parts) {
        pt.obj.position.copy(pt.basePos).addScaledVector(pt.dir, e * pt.dist);
        _q.setFromAxisAngle(pt.axis, e * pt.spin);
        pt.obj.quaternion.copy(pt.baseQuat).multiply(_q);
      }
      exploded.current = true;
    } else {
      // re-seat every part exactly once when the crew finishes the rebuild
      if (exploded.current) {
        for (const pt of parts) {
          pt.obj.position.copy(pt.basePos);
          pt.obj.quaternion.copy(pt.baseQuat);
        }
        exploded.current = false;
      }
      const roll = rollRef.current ?? 0;
      for (const w of wheels) w.rotation.x -= roll * dt;
    }

    // dissolve (the totalled enemy car vanishing at the end)
    if (fadeRef) {
      const f = fadeRef.current ?? 1;
      if (f < 0.999) {
        // flip materials to transparent ONCE (changing the flag needs a recompile)
        if (!fadeInit.current) {
          for (const m of fadeMats) {
            m.transparent = true;
            m.needsUpdate = true;
          }
          fadeInit.current = true;
        }
        for (const m of fadeMats) m.opacity = Math.max(0, f);
      }
    }
  });

  return <primitive object={model} />;
}
