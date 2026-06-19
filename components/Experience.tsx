"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  ContactShadows,
  MeshReflectorMaterial,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import CarModel from "./CarModel";
import { scrollState } from "@/lib/scroll";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* moves the camera through the story as the user scrolls */
function CameraRig() {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 1, 0));
  const target = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const o = scrollState.progress;
    const intro = smooth(0, 0.1, o); // car arrives
    const apart = smooth(0.14, 0.45, o); // exploded
    const end = smooth(0.78, 1, o); // projects

    // hero → exploded → projects camera positions
    const tx = THREE.MathUtils.lerp(10, 1.5, apart);
    const ty = THREE.MathUtils.lerp(2.2, 6.5, apart) + end * 1.5;
    const tz = THREE.MathUtils.lerp(11, 13.5, apart);

    // a touch of cinematic drift as the car arrives
    target.current.set(
      tx - intro * 1.5 + Math.sin(o * 4) * 0.4 * (1 - apart),
      ty,
      tz
    );
    lookTarget.current.set(0, 1.2 + apart * 0.6, 0);

    const k = 1 - Math.exp(-3 * delta);
    camera.position.lerp(target.current, k);
    look.current.lerp(lookTarget.current, k);
    camera.lookAt(look.current);
  });

  return null;
}

function Rig() {
  return (
    <>
      {/* key + fill + accent rim */}
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[6, 10, 6]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      >
        <orthographicCamera attach="shadow-camera" args={[-12, 12, 12, -12, 0.1, 40]} />
      </directionalLight>
      <directionalLight position={[-8, 4, -6]} intensity={1.1} color="#ff7a52" />
      <pointLight position={[0, 3, -8]} intensity={30} color="#3b6bff" distance={25} />

      {/* studio reflections built from light cards (no external HDR needed) */}
      <Environment resolution={256} environmentIntensity={0.55}>
        <Lightformer intensity={2} position={[0, 6, 0]} scale={[12, 6, 1]} rotation={[Math.PI / 2, 0, 0]} />
        <Lightformer intensity={1.4} position={[6, 2, 4]} scale={[6, 6, 1]} color="#ffd6c2" />
        <Lightformer intensity={1.2} position={[-6, 2, -4]} scale={[6, 6, 1]} color="#9fc0ff" />
        <Lightformer intensity={1} position={[0, 1, 8]} scale={[10, 3, 1]} />
      </Environment>

      <CarModel />

      {/* soft contact shadow under the car */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.55}
        scale={34}
        blur={2.6}
        far={10}
        resolution={1024}
        color="#000000"
      />

      {/* glossy reflective floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <MeshReflectorMaterial
          resolution={1024}
          blur={[400, 120]}
          mixBlur={1}
          mixStrength={2.2}
          mirror={0.55}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color="#05070f"
          metalness={0.6}
          roughness={0.85}
        />
      </mesh>
    </>
  );
}

export default function Experience() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [10, 2.2, 11], fov: 38, near: 0.1, far: 100 }}
    >
      <color attach="background" args={["#05070f"]} />
      <fog attach="fog" args={["#05070f", 22, 48]} />

      <Suspense fallback={null}>
        <Rig />
      </Suspense>

      <CameraRig />

      <EffectComposer>
        <Bloom
          intensity={0.85}
          luminanceThreshold={0.25}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.2} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}
