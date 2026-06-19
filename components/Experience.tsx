"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  ContactShadows,
  MeshReflectorMaterial,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import Ferrari from "./Ferrari";
import Agent from "./Agent";
import { scrollState } from "@/lib/scroll";

/* ---------- helpers ---------- */
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = THREE.MathUtils.lerp;

const IMPACT = new THREE.Vector3(2.6, 0.8, 0);
const HERO_LAND = -1.2; // where the hero car comes to rest after the crash

/* developer crew: where they stand, which side they enter from, what they "do" */
const DEVS = [
  { stand: [-3.3, 1.7] as const, enter: -11, work: "Punch" },
  { stand: [-2.7, -1.8] as const, enter: -11, work: "Yes" },
  { stand: [0.9, 1.9] as const, enter: 11, work: "Punch" },
  { stand: [0.4, -1.9] as const, enter: 11, work: "ThumbsUp" },
];

/* ---------- crash debris ---------- */
function useDebris(count = 40) {
  return useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 1.3 + 0.5,
        (Math.random() - 0.5) * 2
      ).normalize();
      arr.push({
        vel: dir.multiplyScalar(4 + Math.random() * 7),
        size: 0.08 + Math.random() * 0.26,
        spin: new THREE.Vector3(
          Math.random() * 8,
          Math.random() * 8,
          Math.random() * 8
        ),
        color: Math.random() > 0.5 ? "#c81e2a" : "#b8c0cc",
      });
    }
    return arr;
  }, [count]);
}

function Stage() {
  const { camera } = useThree();

  // actors
  const walker = useRef<THREE.Group>(null!);
  const walkerAct = useRef("Wave");
  const driver = useRef<THREE.Group>(null!);
  const driverAct = useRef("Sitting");

  const hero = useRef<THREE.Group>(null!);
  const enemy = useRef<THREE.Group>(null!);
  const heroRoll = useRef(0);
  const enemyRoll = useRef(0);

  const flash = useRef<THREE.Mesh>(null!);
  const flashMat = useRef<THREE.MeshBasicMaterial>(null!);
  const debrisGroup = useRef<THREE.Group>(null!);
  const debris = useDebris();

  // dev crew refs
  const devRefs = useRef<THREE.Group[]>([]);
  const devActs = useRef(DEVS.map(() => ({ current: "Idle" })));

  // camera scratch vectors
  const camPos = useRef(new THREE.Vector3(7, 2.4, 9));
  const camLook = useRef(new THREE.Vector3(0.6, 1, 0));
  const tmpPos = useRef(new THREE.Vector3());
  const tmpLook = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    const p = scrollState.progress;

    /* ---- phase scalars (tuned to the 5 HTML sections) ---- */
    const walk = smooth(0.1, 0.2, p); // Hero
    const drive = smooth(0.26, 0.43, p); // Transition
    const air = clamp01((p - 0.44) / 0.13); // hero airborne window
    const flipSpin = smooth(0.44, 0.57, p); // tumble while airborne
    const landed = smooth(0.55, 0.63, p); // settles on landing
    const knock = smooth(0.47, 0.56, p);
    const uncrash = smooth(0.71, 0.8, p); // cars repaired (Team section)
    const devIn = smooth(0.66, 0.73, p);
    const devOut = smooth(0.8, 0.86, p);
    const carsAway = smooth(0.84, 0.92, p);
    const end = smooth(0.92, 1, p);
    const impulse = smooth(0.44, 0.47, p) * (1 - smooth(0.48, 0.56, p));

    /* ---- WALKER (agent arriving) ---- */
    if (walker.current) {
      const vis = p < 0.215;
      walker.current.visible = vis;
      if (vis) {
        let a = "Walking";
        if (p < 0.045) a = "Wave";
        else if (p < 0.1) a = "Idle";
        walkerAct.current = a;
        walker.current.position.set(lerp(3.4, -1.0, walk), 0, lerp(1.0, 1.3, walk));
        walker.current.rotation.y = lerp(0.35, -Math.PI / 2, smooth(0.08, 0.16, p));
        walker.current.scale.setScalar(0.4);
      }
    }

    /* ---- DRIVER (seated in the cockpit, rides with the car) ---- */
    if (driver.current) {
      driver.current.visible = p > 0.2;
      driverAct.current = "Sitting";
    }

    /* ---- HERO CAR (red) — drives, flies, tumbles, lands, repaired, leaves ---- */
    if (hero.current) {
      let hx = lerp(-1.5, 0.5, drive);
      hx = lerp(hx, HERO_LAND, knock);
      hx = lerp(hx, -26, carsAway);
      const hy = 3.7 * Math.sin(Math.PI * air); // launches and comes down
      hero.current.position.set(hx, hy, 0);

      // two full barrel rolls while airborne → lands upright, slight damage tilt, then fixed
      let rz = flipSpin * Math.PI * 4;
      rz = lerp(rz, 0.18, landed);
      rz = lerp(rz, 0, uncrash);
      hero.current.rotation.set(0, Math.PI / 2, rz);

      const moving = (drive > 0.02 && drive < 0.98) || carsAway > 0.02;
      heroRoll.current = moving ? 20 : 0;
    }

    /* ---- ENEMY CAR (silver) ---- */
    if (enemy.current) {
      let ex = lerp(16, 4.9, drive);
      ex = lerp(ex, 6.4, knock);
      ex = lerp(ex, 26, carsAway);
      const ey = 1.1 * Math.sin(Math.PI * clamp01((p - 0.45) / 0.12));
      enemy.current.position.set(ex, ey, 0);
      // a sharp jolt that rocks back to level
      const erz = Math.sin(flipSpin * Math.PI * 2) * 0.5 * (1 - uncrash);
      enemy.current.rotation.set(0, -Math.PI / 2, erz);
      const moving = (drive > 0.02 && drive < 0.98) || carsAway > 0.02;
      enemyRoll.current = moving ? 22 : 0;
    }

    /* ---- IMPACT FLASH ---- */
    if (flash.current && flashMat.current) {
      flash.current.position.copy(IMPACT);
      flash.current.scale.setScalar(0.1 + impulse * 2.0);
      flashMat.current.opacity = impulse * 0.6;
    }

    /* ---- DEBRIS ---- */
    if (debrisGroup.current) {
      const t = clamp01((p - 0.44) / 0.16);
      const live = t > 0 && t < 1;
      debrisGroup.current.visible = live;
      if (live) {
        const tt = t * 1.5;
        debrisGroup.current.children.forEach((child, i) => {
          const d = debris[i];
          child.position.set(
            IMPACT.x + d.vel.x * tt,
            Math.max(0.05, IMPACT.y + d.vel.y * tt - 4.4 * tt * tt),
            IMPACT.z + d.vel.z * tt
          );
          child.rotation.set(d.spin.x * tt, d.spin.y * tt, d.spin.z * tt);
          child.scale.setScalar(Math.max(0.001, (1 - t) * d.size));
        });
      }
    }

    /* ---- DEV CREW: walk in, fix, thumbs-up, leave ---- */
    const showDev = p > 0.64 && p < 0.88;
    DEVS.forEach((d, i) => {
      const g = devRefs.current[i];
      if (!g) return;
      g.visible = showDev;
      if (!showDev) return;
      let x = lerp(d.enter, d.stand[0], devIn);
      x = lerp(x, d.enter, devOut);
      g.position.set(x, 0, d.stand[1]);
      g.scale.setScalar(0.34);
      const arrived = devIn > 0.98 && devOut < 0.02;
      devActs.current[i].current = arrived ? d.work : "Walking";
      // face the wrecked car while working, face exit while leaving
      const tx = devOut > 0.02 ? d.enter : HERO_LAND;
      g.rotation.y = Math.atan2(tx - x, 0 - d.stand[1]);
    });

    /* ---- CAMERA: cinematic path + crash shake ---- */
    const cp = tmpPos.current;
    cp.set(7, 2.4, 9);
    cp.lerp(V(0.5, 3, 13), smooth(0.1, 0.3, p)); // wide drive
    cp.lerp(V(3, 3.6, 11), smooth(0.34, 0.44, p)); // approach, raised
    cp.lerp(V(1.5, 5.5, 15), smooth(0.46, 0.56, p)); // follow the flying car
    cp.lerp(V(-1.8, 3.6, 12), smooth(0.64, 0.74, p)); // fix scene (Team section)
    cp.lerp(V(0, 5, 17), smooth(0.84, 0.92, p)); // cars leave / projects

    const cl = tmpLook.current;
    cl.set(0.6, 1, 0);
    cl.lerp(V(2.6, 1.2, 0), smooth(0.3, 0.44, p));
    cl.lerp(V(1.5, 2.4, 0), smooth(0.46, 0.56, p)); // look up at airborne car
    cl.lerp(V(-1, 1, 0), smooth(0.64, 0.74, p)); // hero + crew
    cl.lerp(V(0, 1.3 + end * 0.4, 0), smooth(0.84, 0.92, p));

    if (impulse > 0.001) {
      cp.x += (Math.random() - 0.5) * impulse * 1.2;
      cp.y += (Math.random() - 0.5) * impulse * 0.9;
    }

    const k = 1 - Math.exp(-4 * dt);
    camPos.current.lerp(cp, k);
    camLook.current.lerp(cl, k);
    camera.position.copy(camPos.current);
    camera.lookAt(camLook.current);
  });

  return (
    <>
      {/* lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[6, 10, 6]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      >
        <orthographicCamera attach="shadow-camera" args={[-16, 16, 16, -16, 0.1, 50]} />
      </directionalLight>
      <directionalLight position={[-8, 5, -6]} intensity={1.1} color="#ff7a52" />
      <pointLight position={[0, 4, -8]} intensity={40} color="#3b6bff" distance={30} />

      <Environment resolution={256} environmentIntensity={0.6}>
        <Lightformer intensity={2} position={[0, 7, 0]} scale={[14, 7, 1]} rotation={[Math.PI / 2, 0, 0]} />
        <Lightformer intensity={1.4} position={[7, 3, 5]} scale={[7, 7, 1]} color="#ffd6c2" />
        <Lightformer intensity={1.2} position={[-7, 3, -5]} scale={[7, 7, 1]} color="#9fc0ff" />
        <Lightformer intensity={1} position={[0, 1, 9]} scale={[12, 4, 1]} />
      </Environment>

      {/* arriving agent */}
      <group ref={walker}>
        <Agent actionRef={walkerAct} />
      </group>

      {/* hero car with the agent seated in the cockpit */}
      <group ref={hero}>
        <Ferrari color="#c81e2a" rollRef={heroRoll} />
        <group ref={driver} position={[-0.32, 0.24, -0.15]} scale={0.28}>
          <Agent actionRef={driverAct} />
        </group>
      </group>

      {/* oncoming car */}
      <group ref={enemy}>
        <Ferrari color="#aeb6c2" rollRef={enemyRoll} />
      </group>

      {/* dev crew */}
      {DEVS.map((d, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) devRefs.current[i] = el;
          }}
          visible={false}
        >
          <Agent actionRef={devActs.current[i]} color="#7cf2c8" />
        </group>
      ))}

      {/* impact flash */}
      <mesh ref={flash} position={IMPACT} scale={0}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial ref={flashMat} color="#ffd9a8" transparent opacity={0} toneMapped={false} />
      </mesh>

      {/* debris */}
      <group ref={debrisGroup} visible={false}>
        {debris.map((d, i) => (
          <mesh key={i} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={d.color} metalness={0.7} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* contact shadow + reflective floor */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.55}
        scale={42}
        blur={2.6}
        far={12}
        resolution={1024}
        color="#000000"
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[180, 180]} />
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

/* tiny vector pool to avoid garbage in the loop */
const _v = new THREE.Vector3();
function V(x: number, y: number, z: number) {
  return _v.set(x, y, z);
}

export default function Experience() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [7, 2.4, 9], fov: 38, near: 0.1, far: 100 }}
    >
      <color attach="background" args={["#05070f"]} />
      <fog attach="fog" args={["#05070f", 26, 56]} />

      <Suspense fallback={null}>
        <Stage />
      </Suspense>

      <EffectComposer>
        <Bloom intensity={0.9} luminanceThreshold={0.25} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}
