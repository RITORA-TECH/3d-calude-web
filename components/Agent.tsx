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

  const logoTex = useTexture("/ritora-symbol.png");

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

    attachChestBadge(c, logoTex);
    return c;
  }, [scene, color, logoTex]);

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

/**
 * Build the circular "R" chest badge and rivet it to the torso BONE, so it
 * inherits the skeletal animation and stays stuck to the chest as the robot
 * walks, leans and turns (rather than floating in the group's static space).
 */
function attachChestBadge(root: THREE.Object3D, tex: THREE.Texture) {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  root.updateWorldMatrix(true, true);

  // chest position comes from the Torso mesh bounds (its front surface)…
  const torso = root.getObjectByName("Torso") as THREE.Mesh | null;
  const tbox = new THREE.Box3();
  if (torso?.geometry) {
    torso.geometry.computeBoundingBox();
    tbox.copy(torso.geometry.boundingBox!).applyMatrix4(torso.matrixWorld);
  } else if (torso) {
    tbox.setFromObject(torso);
  } else {
    tbox.setFromObject(root);
  }
  const size = tbox.getSize(new THREE.Vector3());
  const center = tbox.getCenter(new THREE.Vector3());
  const r = size.x * 0.11; // small emblem (~a tenth of the chest width)

  // …and it's parented to the Torso *bone* so it animates with the body.
  let bone: THREE.Object3D | null = null;
  root.traverse((o) => {
    if (!bone && (o as THREE.Bone).isBone && /torso/i.test(o.name)) bone = o;
  });
  if (!bone) {
    root.traverse((o) => {
      if (!bone && (o as THREE.Bone).isBone && /(chest|spine|abdomen)/i.test(o.name)) bone = o;
    });
  }
  const parent: THREE.Object3D = bone ?? root;

  const badge = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.CircleGeometry(r * 1.12, 56),
    new THREE.MeshStandardMaterial({
      color: "#ff5d3b",
      roughness: 0.5,
      metalness: 0.1,
      emissive: new THREE.Color("#ff5d3b"),
      emissiveIntensity: 0.25,
    })
  );
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(r, 56),
    new THREE.MeshStandardMaterial({ color: "#0a0c16", roughness: 0.45, metalness: 0.3 })
  );
  disc.position.z = r * 0.01;
  const symbol = new THREE.Mesh(
    new THREE.PlaneGeometry(r * 1.7, r * 1.7),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.3,
      depthWrite: false,
      toneMapped: false,
    })
  );
  symbol.position.z = r * 0.02;
  symbol.renderOrder = 2;
  badge.add(ring, disc, symbol);

  // place it at the chest front, facing the model's forward (+Z), then convert
  // that world-space pose into the bone's local frame so it rivets cleanly.
  const desired = new THREE.Matrix4().compose(
    new THREE.Vector3(center.x, center.y, tbox.max.z + r * 0.04),
    new THREE.Quaternion(),
    new THREE.Vector3(1, 1, 1)
  );
  parent.updateWorldMatrix(true, false);
  const local = parent.matrixWorld.clone().invert().multiply(desired);
  badge.applyMatrix4(local);
  parent.add(badge);
}
