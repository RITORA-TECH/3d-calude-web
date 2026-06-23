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
import ServiceChips from "./ServiceChips";
import { scrollState } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";

/* ---------- helpers ---------- */
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = THREE.MathUtils.lerp;

const IMPACT = new THREE.Vector3(2.0, 0.85, 0);
const HERO_LAND = -1.0;
const HERO_YAW = -Math.PI / 2; // nose points +X (its travel direction)
const ENEMY_YAW = Math.PI / 2; // nose points -X (its travel direction)
// world-space seat the walking agent climbs into (hero car at its start pose)
const SEAT = new THREE.Vector3(-1.3, 0.32, -0.18);

// dev crew — one robot per discipline, coloured to match its service, that
// surrounds the wreck and reassembles it. (5 pieces → 5 developers.)
const DEVS = [
  { stand: [-3.2, 1.4] as const, enter: -12, work: "Punch", color: "#ff5d3b" },
  { stand: [-3.2, -1.4] as const, enter: -12, work: "Yes", color: "#3b82f6" },
  { stand: [1.2, 1.4] as const, enter: 12, work: "Punch", color: "#22c55e" },
  { stand: [1.2, -1.4] as const, enter: 12, work: "ThumbsUp", color: "#a855f7" },
  { stand: [-1.0, -2.4] as const, enter: 12, work: "Yes", color: "#06b6d4" },
];

/* ---------- crash debris / parts ---------- */
function useDebris(count = 60) {
  return useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 1.4 + 0.5,
        (Math.random() - 0.5) * 2
      ).normalize();
      const spark = Math.random() > 0.6;
      arr.push({
        vel: dir.multiplyScalar(5 + Math.random() * 9),
        size: spark ? 0.05 + Math.random() * 0.08 : 0.1 + Math.random() * 0.3,
        spin: new THREE.Vector3(
          Math.random() * 10,
          Math.random() * 10,
          Math.random() * 10
        ),
        spark,
        color: spark ? "#ffae5a" : Math.random() > 0.5 ? "#c81e2a" : "#b8c0cc",
      });
    }
    return arr;
  }, [count]);
}

/* ---------- rising smoke plumes ---------- */
function useSmoke(count = 18) {
  return useMemo(() => {
    return Array.from({ length: count }, () => {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random();
      return {
        dir: new THREE.Vector3(
          Math.cos(a) * r,
          0.6 + Math.random() * 1.0,
          Math.sin(a) * r
        ),
        speed: 1.2 + Math.random() * 2.4,
        size: 0.8 + Math.random() * 1.8,
      };
    });
  }, [count]);
}

/* ---------- flickering electric arcs ---------- */
function useArcs(count = 10) {
  return useMemo(() => {
    return Array.from({ length: count }, () => ({
      pos: [
        (Math.random() - 0.5) * 2.6,
        0.4 + Math.random() * 1.9,
        (Math.random() - 0.5) * 2.6,
      ] as [number, number, number],
      rot: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ] as [number, number, number],
      len: 0.6 + Math.random() * 1.6,
    }));
  }, [count]);
}

function Stage() {
  const { camera, size } = useThree();
  const reduceMotion = useRef(prefersReducedMotion());

  const walker = useRef<THREE.Group>(null!);
  const walkerAct = useRef("Wave");
  const driver = useRef<THREE.Group>(null!);
  const driverAct = useRef("Sitting");

  // the same agent returns at the very end with a "let's connect" greeting
  const host = useRef<THREE.Group>(null!);
  const hostAct = useRef("Wave");

  const hero = useRef<THREE.Group>(null!);
  const enemy = useRef<THREE.Group>(null!);
  const heroRoll = useRef(0);
  const enemyRoll = useRef(0);
  const heroExplode = useRef(0); // 0 whole .. 1 blown apart
  const enemyFade = useRef(1); // 1 visible .. 0 dissolved

  const flash = useRef<THREE.Mesh>(null!);
  const flashMat = useRef<THREE.MeshBasicMaterial>(null!);
  const flashLight = useRef<THREE.PointLight>(null!);
  const ring = useRef<THREE.Mesh>(null!);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null!);
  const debrisGroup = useRef<THREE.Group>(null!);
  const debris = useDebris(110);
  const smokeGroup = useRef<THREE.Group>(null!);
  const smoke = useSmoke();
  const arcsGroup = useRef<THREE.Group>(null!);
  const arcs = useArcs();

  const devRefs = useRef<THREE.Group[]>([]);
  const devActs = useRef(DEVS.map(() => ({ current: "Idle" })));

  const camPos = useRef(new THREE.Vector3(7, 2.4, 9));
  const camLook = useRef(new THREE.Vector3(0.6, 1, 0));
  const tmpPos = useRef(new THREE.Vector3());
  const tmpLook = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    const p = scrollState.progress;

    /* ---- phase scalars (Hero / Transition / Team / Services / Projects) ---- */
    const approach = smooth(0.045, 0.14, p); // deliberate step-by-step walk to the car
    const arrive = smooth(0.14, 0.16, p); // brief crouch/pause beside the car
    const jump = smooth(0.16, 0.205, p); // leap up and into the cockpit
    const enter = jump; // position lerp follows the jump
    const drive = smooth(0.22, 0.34, p);
    const landed = smooth(0.44, 0.5, p);
    const knock = smooth(0.36, 0.46, p);
    const reassemble = smooth(0.55, 0.64, p); // pieces fly back, car repaired
    const devIn = smooth(0.46, 0.54, p);
    const devOut = smooth(0.66, 0.72, p);
    const impulse = smooth(0.34, 0.365, p) * (1 - smooth(0.38, 0.46, p));
    const ringT = clamp01((p - 0.345) / 0.12);
    const hostIn = smooth(0.88, 0.95, p); // agent returns to say hello

    /* ---- WALKER (greets, walks up step-by-step, then JUMPS into the cockpit) ---- */
    if (walker.current) {
      const vis = p < 0.214;
      walker.current.visible = vis;
      if (vis) {
        // greet → walk (step by step) → crouch → JUMP in → settle into the seat
        walkerAct.current =
          jump > 0.92
            ? "Sitting" // landed & settling into the seat
            : jump > 0.04
              ? "Jump" // the actual leap into the car
              : arrive > 0.4
                ? "Standing" // brief beat / crouch beside the car
                : approach > 0.02
                  ? "Walking" // deliberate steps toward the car
                  : "Wave"; // initial greeting
        // walk a longer, straighter path so the steps read clearly…
        const doorX = lerp(4.4, -1.05, approach);
        const doorZ = lerp(1.15, 1.1, approach);
        // …then a parabolic hop from beside the car up & over into the seat
        const hop = Math.sin(Math.PI * jump) * 0.9; // peak jump height
        walker.current.position.set(
          lerp(doorX, SEAT.x, jump),
          lerp(0, SEAT.y, jump) + hop,
          lerp(doorZ, SEAT.z, jump)
        );
        walker.current.rotation.y = lerp(
          lerp(0.35, -Math.PI / 2, approach), // turn to face the car, then walk
          Math.PI, // rotate into the seat as it lands
          jump
        );
        walker.current.scale.setScalar(lerp(0.42, 0.28, jump));
      }
    }

    /* ---- DRIVER (seated in the cockpit; ejects when the car shatters) -- */
    if (driver.current) {
      driver.current.visible = p > 0.205 && p < 0.35;
      driverAct.current = "Sitting";
    }

    /* ---- HERO CAR (red) — dashes in, SHATTERS into parts, gets rebuilt ---- */
    if (hero.current) {
      let hx = lerp(-1.5, 0.6, drive);
      hx = lerp(hx, HERO_LAND, knock); // recoils to its resting wreck spot
      hero.current.position.set(hx, 0, 0);
      hero.current.rotation.set(0, HERO_YAW, 0); // stays grounded & upright
      const moving = drive > 0.02 && drive < 0.9;
      heroRoll.current = moving ? 20 : 0;
      // blow the car into parts at impact, hold, then re-seat them as the crew rebuilds
      heroExplode.current = smooth(0.345, 0.4, p) * (1 - reassemble);
    }

    /* ---- ENEMY CAR (silver) — dashes in, stays wrecked on the ground, dissolves ---- */
    if (enemy.current) {
      let ex = lerp(16, 3.4, drive);
      ex = lerp(ex, 5.2, knock); // bounces back a little, then sits still
      enemy.current.position.set(ex, 0, 0);
      enemy.current.rotation.set(0, ENEMY_YAW, 0.16 * landed); // tilted = damaged
      const moving = drive > 0.02 && drive < 0.9;
      enemyRoll.current = moving ? 22 : 0;
      // the totalled car fades out near the end
      enemyFade.current = 1 - smooth(0.86, 0.93, p);
    }

    /* ---- EXPLOSIVE IMPACT: flash + light + shockwave ---- */
    if (flash.current && flashMat.current) {
      flash.current.position.copy(IMPACT);
      flash.current.scale.setScalar(0.1 + impulse * 4.6);
      flashMat.current.opacity = impulse * 0.8;
    }
    if (flashLight.current) flashLight.current.intensity = impulse * 120;
    if (ring.current && ringMat.current) {
      const show = ringT > 0 && ringT < 1;
      ring.current.visible = show;
      if (show) {
        ring.current.scale.setScalar(0.3 + ringT * 13);
        ringMat.current.opacity = (1 - ringT) * 0.7;
      }
    }

    // electric arcs flicker at the moment of impact
    if (arcsGroup.current) {
      const live = impulse > 0.02 && !reduceMotion.current;
      arcsGroup.current.visible = live;
      if (live) {
        for (const c of arcsGroup.current.children) c.visible = Math.random() > 0.45;
      }
    }

    /* ---- DEBRIS / parts flying out ---- */
    if (debrisGroup.current) {
      const t = clamp01((p - 0.34) / 0.16);
      const live = t > 0 && t < 1;
      debrisGroup.current.visible = live;
      if (live) {
        const tt = t * 1.6;
        debrisGroup.current.children.forEach((child, i) => {
          const d = debris[i];
          child.position.set(
            IMPACT.x + d.vel.x * tt,
            Math.max(0.05, IMPACT.y + d.vel.y * tt - 4.6 * tt * tt),
            IMPACT.z + d.vel.z * tt
          );
          child.rotation.set(d.spin.x * tt, d.spin.y * tt, d.spin.z * tt);
          child.scale.setScalar(Math.max(0.001, (1 - t) * d.size));
        });
      }
    }

    /* ---- SMOKE plumes billowing up from the wreck ---- */
    if (smokeGroup.current) {
      const t = clamp01((p - 0.345) / 0.24); // lingers past the debris
      const live = t > 0 && t < 1;
      smokeGroup.current.visible = live;
      if (live) {
        smokeGroup.current.children.forEach((child, i) => {
          const s = smoke[i];
          const tt = t * 2.4;
          child.position.set(
            IMPACT.x + s.dir.x * s.speed * tt,
            Math.max(0.1, IMPACT.y + s.dir.y * s.speed * tt),
            IMPACT.z + s.dir.z * s.speed * tt
          );
          child.scale.setScalar(s.size * (0.4 + t * 1.8));
          const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
          m.opacity = Math.sin(Math.PI * t) * 0.45;
        });
      }
    }

    /* ---- DEV CREW: walk in, reassemble the car, thumbs-up, step away ---- */
    const showDev = p > 0.44 && p < 0.74;
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
      const tx = devOut > 0.02 ? d.enter : HERO_LAND;
      g.rotation.y = Math.atan2(tx - x, 0 - d.stand[1]);
    });

    /* ---- HOST: the same agent returns at the end to say "let's connect" ---- */
    if (host.current) {
      const vis = p > 0.86;
      host.current.visible = vis;
      if (vis) {
        const hx = lerp(8.5, 2.3, hostIn);
        host.current.position.set(hx, 0, 4.6);
        host.current.rotation.y = lerp(-Math.PI / 2, -0.25, hostIn);
        host.current.scale.setScalar(0.6);
        hostAct.current = hostIn > 0.92 ? "Wave" : "Walking";
      }
    }

    /* ---- CAMERA ---- */
    const cp = tmpPos.current;
    cp.set(7, 2.4, 9);
    cp.lerp(V(0.5, 3, 13), smooth(0.22, 0.32, p)); // wide drive
    cp.lerp(V(2.5, 4, 11), smooth(0.33, 0.4, p)); // approach, raised
    cp.lerp(V(1.5, 5.5, 15), smooth(0.42, 0.5, p)); // follow the flying car
    cp.lerp(V(2.6, 4.2, 13), smooth(0.36, 0.47, p)); // read the part cards
    cp.lerp(V(-1.8, 3.6, 12), smooth(0.5, 0.6, p)); // reassembly
    cp.lerp(V(0, 3.2, 12), smooth(0.62, 0.72, p)); // repaired car
    cp.lerp(V(2, 2.6, 12), smooth(0.86, 0.95, p)); // host returns
    cp.lerp(V(2, 3.2, 15), smooth(0.95, 1, p)); // projects / connect

    const cl = tmpLook.current;
    cl.set(0.6, 1, 0);
    cl.lerp(V(1.8, 1, 0), smooth(0.22, 0.34, p));
    cl.lerp(V(2.2, 2.6, 0), smooth(0.36, 0.47, p)); // up at the airborne parts
    cl.lerp(V(-1, 1, 0), smooth(0.5, 0.6, p)); // hero + crew
    cl.lerp(V(-1, 1, 0), smooth(0.62, 0.72, p));
    cl.lerp(V(2.3, 1.4, 4.6), smooth(0.86, 0.97, p)); // look at the host

    // ---- 360° orbit around the shattering car (cinematic) ----
    const airOrbit = smooth(0.345, 0.52, p); // progress across the shatter beat
    const orbitWin =
      clamp01((p - 0.345) / 0.015) * (1 - clamp01((p - 0.52) / 0.03));
    if (orbitWin > 0.001 && !reduceMotion.current) {
      const ang = -Math.PI * 0.35 + airOrbit * Math.PI * 2.2; // ~1.1 revolutions
      const orbR = 8;
      _orbA.set(Math.cos(ang) * orbR, 3.6, Math.sin(ang) * orbR);
      _orbB.set(0.5, 1.4, 0); // look at the wreck on the ground
      cp.lerp(_orbA, orbitWin);
      cl.lerp(_orbB, orbitWin);
    }

    // camera shake is involuntary motion — skip it under reduced-motion
    if (impulse > 0.001 && !reduceMotion.current) {
      cp.x += (Math.random() - 0.5) * impulse * 2.4;
      cp.y += (Math.random() - 0.5) * impulse * 1.7;
      cp.z += (Math.random() - 0.5) * impulse * 1.6;
    }

    // responsive: dolly back on narrow / portrait viewports so the whole
    // scene stays framed on laptops, tablets and phones.
    const aspect = size.width / Math.max(1, size.height);
    const fit = THREE.MathUtils.clamp(1.6 / aspect, 1, 2.4);
    cp.sub(cl).multiplyScalar(fit).add(cl);

    const k = 1 - Math.exp(-4 * dt);
    camPos.current.lerp(cp, k);
    camLook.current.lerp(cl, k);
    camera.position.copy(camPos.current);
    camera.lookAt(camLook.current);
  });

  return (
    <>
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
      <pointLight ref={flashLight} position={[IMPACT.x, IMPACT.y, IMPACT.z]} intensity={0} color="#ffb866" distance={26} />

      <Environment resolution={256} environmentIntensity={0.6}>
        <Lightformer intensity={2} position={[0, 7, 0]} scale={[14, 7, 1]} rotation={[Math.PI / 2, 0, 0]} />
        <Lightformer intensity={1.4} position={[7, 3, 5]} scale={[7, 7, 1]} color="#ffd6c2" />
        <Lightformer intensity={1.2} position={[-7, 3, -5]} scale={[7, 7, 1]} color="#9fc0ff" />
        <Lightformer intensity={1} position={[0, 1, 9]} scale={[12, 4, 1]} />
      </Environment>

      {/* arriving agent */}
      <group ref={walker}>
        <Agent actionRef={walkerAct} color="#ff7a45" />
      </group>

      {/* hero car + seated agent */}
      <group ref={hero}>
        <Ferrari color="#c81e2a" rollRef={heroRoll} explodeRef={heroExplode} />
        <group ref={driver} position={[-0.32, 0.24, -0.15]} rotation={[0, Math.PI, 0]} scale={0.28}>
          <Agent actionRef={driverAct} color="#ff7a45" />
        </group>
      </group>

      {/* oncoming car */}
      <group ref={enemy}>
        <Ferrari color="#aeb6c2" rollRef={enemyRoll} fadeRef={enemyFade} />
      </group>

      {/* dev crew (coloured per discipline) */}
      {DEVS.map((d, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) devRefs.current[i] = el;
          }}
          visible={false}
        >
          <Agent actionRef={devActs.current[i]} color={d.color} />
        </group>
      ))}

      {/* the returning host agent (end "let's connect") */}
      <group ref={host} visible={false}>
        <Agent actionRef={hostAct} color="#ff7a45" />
      </group>

      {/* services that burst from the crash and reassemble into the car */}
      <ServiceChips />

      {/* impact flash */}
      <mesh ref={flash} position={IMPACT} scale={0}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial ref={flashMat} color="#ffd9a8" transparent opacity={0} toneMapped={false} />
      </mesh>

      {/* ground shockwave */}
      <mesh ref={ring} position={[IMPACT.x, 0.15, IMPACT.z]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.85, 1, 48]} />
        <meshBasicMaterial ref={ringMat} color="#ffb066" transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* rising smoke plumes */}
      <group ref={smokeGroup} visible={false}>
        {smoke.map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshBasicMaterial color="#171a24" transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}
      </group>

      {/* electric arcs at the impact */}
      <group ref={arcsGroup} position={IMPACT} visible={false}>
        {arcs.map((a, i) => (
          <mesh key={i} position={a.pos} rotation={a.rot} scale={[0.03, a.len, 0.03]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#a8e0ff" toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* debris */}
      <group ref={debrisGroup} visible={false}>
        {debris.map((d, i) => (
          <mesh key={i} castShadow={!d.spark}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={d.color}
              emissive={d.spark ? "#ff8a3a" : "#000000"}
              emissiveIntensity={d.spark ? 3 : 0}
              metalness={d.spark ? 0 : 0.7}
              roughness={0.4}
              toneMapped={!d.spark}
            />
          </mesh>
        ))}
      </group>

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

const _v = new THREE.Vector3();
function V(x: number, y: number, z: number) {
  return _v.set(x, y, z);
}
// dedicated temps for the orbit camera (must not alias the shared _v)
const _orbA = new THREE.Vector3();
const _orbB = new THREE.Vector3();

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
        <Bloom intensity={1.0} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}
