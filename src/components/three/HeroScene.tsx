"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { RING_A, RING_B, type Tech } from "./techs";

export type ScenePalette = {
  dots: string; // points du globe et arcs
  core: string; // cœur du globe
  glow: string; // halo
  ring: string; // trajectoires des logos
};

type Props = { palette: ScenePalette; lite: boolean; active: boolean };

/* ---------- Utilitaires géométriques ---------- */

// Répartition régulière de points sur une sphère (spirale de Fibonacci)
function fibonacciSphere(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = golden * i;
    positions[i * 3] = Math.cos(theta) * ring * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * ring * radius;
  }
  return positions;
}

function toVec(lat: number, lon: number, radius = 1) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

// Arc qui s'élève au-dessus de la surface entre deux points
function arcPoints(a: THREE.Vector3, b: THREE.Vector3) {
  const control = a.clone().add(b).normalize().multiplyScalar(1.5);
  return new THREE.QuadraticBezierCurve3(a, control, b).getPoints(48);
}

const ARC_PAIRS: [[number, number], [number, number]][] = [
  [[48, -100], [10, 20]],
  [[35, 120], [-20, 140]],
  [[55, 15], [-10, -55]],
  [[5, 100], [40, -30]],
];

/* ---------- Textures dessinées à la volée ---------- */

function makeDotTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  ctx.beginPath();
  ctx.arc(16, 16, 14, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

// Pastille blanche + logo aux couleurs de la marque
function makeLogoTexture(tech: Tech) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.shadowColor = "rgba(0, 0, 0, 0.28)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, 108, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
  ctx.stroke();

  // Les icônes Simple Icons sont dessinées dans une grille de 24 × 24
  const scale = (size * 0.5) / 24;
  ctx.save();
  ctx.translate(size / 2 - 12 * scale, size / 2 - 12 * scale);
  ctx.scale(scale, scale);
  ctx.fillStyle = `#${tech.hex}`;
  ctx.fill(new Path2D(tech.path));
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/* ---------- Le globe ---------- */

function Globe({ palette, lite }: { palette: ScenePalette; lite: boolean }) {
  const count = lite ? 1100 : 2400;
  const positions = useMemo(() => fibonacciSphere(count, 1), [count]);
  const dotTexture = useMemo(() => makeDotTexture(), []);
  const arcs = useMemo(
    () =>
      lite
        ? []
        : ARC_PAIRS.map(([a, b]) => arcPoints(toVec(...a), toVec(...b))),
    [lite],
  );

  // Halo : plus lumineux près du bord du globe, qui s'estompe vers l'extérieur
  const atmosphere = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(palette.glow) } },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          varying vec3 vNormal;
          void main() {
            float facing = abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
            float intensity = pow(facing, 2.0) * 1.4;
            gl_FragColor = vec4(uColor, clamp(intensity, 0.0, 1.0));
            #include <colorspace_fragment>
          }
        `,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      }),
    [palette.glow],
  );

  useEffect(() => () => dotTexture.dispose(), [dotTexture]);
  useEffect(() => () => atmosphere.dispose(), [atmosphere]);

  return (
    <group>
      {/* Cœur plein : masque les points situés à l'arrière du globe */}
      <mesh>
        <sphereGeometry args={[0.985, lite ? 32 : 64, lite ? 32 : 64]} />
        <meshBasicMaterial color={palette.core} />
      </mesh>

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={palette.dots}
          size={lite ? 0.045 : 0.034}
          map={dotTexture}
          alphaTest={0.5}
          sizeAttenuation
        />
      </points>

      {arcs.map((points, i) => (
        <Line
          key={i}
          points={points}
          color={palette.dots}
          lineWidth={1.2}
          transparent
          opacity={0.55}
        />
      ))}

      <mesh scale={1.22} material={atmosphere}>
        <sphereGeometry args={[1, 48, 48]} />
      </mesh>
    </group>
  );
}

/* ---------- Les logos en orbite ---------- */

function Logo({
  texture,
  position,
}: {
  texture: THREE.Texture;
  position: [number, number, number];
}) {
  const ref = useRef<THREE.Sprite>(null);
  const world = useMemo(() => new THREE.Vector3(), []);

  // Profondeur : les logos éloignés sont plus petits et plus transparents
  useFrame(() => {
    const sprite = ref.current;
    if (!sprite) return;
    sprite.getWorldPosition(world);
    const depth = THREE.MathUtils.clamp((world.z + 2.2) / 4.4, 0, 1);
    sprite.material.opacity = 0.5 + 0.5 * depth;
    const size = 0.5 + 0.2 * depth;
    sprite.scale.set(size, size, 1);
  });

  return (
    <sprite ref={ref} position={position} scale={[0.55, 0.55, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
}

function Orbit({
  techs,
  textures,
  radius,
  tilt,
  speed,
  phase,
  ringColor,
}: {
  techs: Tech[];
  textures: Record<string, THREE.Texture>;
  radius: number;
  tilt: [number, number, number];
  speed: number;
  phase: number;
  ringColor: string;
}) {
  const spin = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.y += delta * speed;
  });

  return (
    <group rotation={tilt}>
      {/* Trajectoire */}
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[radius, 0.006, 8, 160]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0.28} />
      </mesh>

      <group ref={spin}>
        {techs.map((tech, i) => {
          const angle = phase + (i / techs.length) * Math.PI * 2;
          return (
            <Logo
              key={tech.title}
              texture={textures[tech.title]}
              position={[
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius,
              ]}
            />
          );
        })}
      </group>
    </group>
  );
}

/* ---------- Assemblage ---------- */

function Scene({ palette, lite }: { palette: ScenePalette; lite: boolean }) {
  const root = useRef<THREE.Group>(null);
  const globe = useRef<THREE.Group>(null);

  const textures = useMemo(() => {
    const map: Record<string, THREE.CanvasTexture> = {};
    for (const tech of [...RING_A, ...RING_B]) map[tech.title] = makeLogoTexture(tech);
    return map;
  }, []);

  useEffect(
    () => () => Object.values(textures).forEach((t) => t.dispose()),
    [textures],
  );

  useFrame((state, delta) => {
    if (globe.current) globe.current.rotation.y += delta * 0.12;
    if (root.current) {
      // Léger suivi du pointeur (souris ou doigt)
      const { x, y } = state.pointer;
      root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, x * 0.25, 0.04);
      root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, -y * 0.15, 0.04);
    }
  });

  return (
    <group ref={root} rotation={[0, 0, 0.15]}>
      <group ref={globe}>
        <Globe palette={palette} lite={lite} />
      </group>

      <Orbit
        techs={RING_A}
        textures={textures}
        radius={1.75}
        tilt={[0.45, 0, 0.2]}
        speed={0.28}
        phase={0}
        ringColor={palette.ring}
      />
      <Orbit
        techs={RING_B}
        textures={textures}
        radius={2.1}
        tilt={[-0.6, 0, -0.3]}
        speed={-0.2}
        phase={0.6}
        ringColor={palette.ring}
      />
    </group>
  );
}

export default function HeroScene({ palette, lite, active }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.5], fov: 40 }}
      dpr={lite ? 1 : [1, 2]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: !lite, alpha: true, powerPreference: "high-performance" }}
    >
      <Scene palette={palette} lite={lite} />
    </Canvas>
  );
}