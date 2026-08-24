import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useInView, useReducedMotion } from 'motion/react';
import * as THREE from 'three';
import type { MascotReaction } from '../services/mascotGuide';

export type { MascotReaction } from '../services/mascotGuide';

export interface MascotProps {
  modelPath?: string;
  mood?: MascotReaction;
  className?: string;
  closeUp?: boolean;
  health?: number;
  energy?: number;
  hunger?: number;
  strength?: number;
  isEating?: boolean;
  isMeditating?: boolean;
  isPetted?: boolean;
  onPet?: (event: React.MouseEvent) => void;
}

type Point3 = [number, number, number];
type ModelMotion = {
  y: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  eyeScale: number;
  browLeft: number;
  browRight: number;
};

const DEFAULT_MODEL = '/mascot/t1ger-head-v1.glb';
const MODEL_ASPECT_X = 0.94;

function getModelMotion(mood: MascotReaction, elapsed: number): ModelMotion {
  const breath = Math.sin(elapsed * 1.35);
  const blink = Math.sin(elapsed * 1.48) > 0.986 ? 0.08 : 1;
  const idle: ModelMotion = {
    y: breath * 0.014,
    rotationX: Math.sin(elapsed * 0.62) * 0.008,
    rotationY: Math.sin(elapsed * 0.52) * 0.035,
    rotationZ: Math.sin(elapsed * 0.76) * 0.01,
    scale: 1 + breath * 0.004,
    eyeScale: blink,
    browLeft: 0,
    browRight: 0,
  };

  if (mood === 'happy' || mood === 'celebrate') {
    const celebration = mood === 'celebrate';
    return {
      ...idle,
      y: Math.abs(Math.sin(elapsed * (celebration ? 4.5 : 3.2))) * (celebration ? 0.085 : 0.045),
      rotationY: Math.sin(elapsed * 2.1) * (celebration ? 0.065 : 0.045),
      rotationZ: Math.sin(elapsed * 3.2) * (celebration ? 0.035 : 0.018),
      scale: celebration ? 1.025 : 1.012,
      eyeScale: Math.min(blink, celebration ? 0.78 : 0.82),
      browLeft: 0.1,
      browRight: -0.1,
    };
  }

  if (mood === 'thinking') {
    return { ...idle, rotationX: -0.018, rotationY: -0.075, rotationZ: 0.055, browLeft: 0.12, browRight: -0.02 };
  }

  if (mood === 'mistake' || mood === 'warning') {
    const warning = mood === 'warning';
    return {
      ...idle,
      y: warning ? -0.018 : -0.03,
      rotationX: 0.02,
      rotationY: warning ? Math.sin(elapsed * 8) * 0.035 : -0.025,
      rotationZ: warning ? Math.sin(elapsed * 8) * 0.008 : -0.035,
      scale: warning ? 0.992 : 0.986,
      eyeScale: Math.min(blink, warning ? 0.78 : 0.72),
      browLeft: -0.16,
      browRight: 0.16,
    };
  }

  if (mood === 'beast') {
    return {
      ...idle,
      y: Math.sin(elapsed * 2.2) * 0.015,
      rotationX: -0.018,
      rotationY: Math.sin(elapsed * 1.2) * 0.022,
      scale: 1.032,
      eyeScale: Math.min(blink, 0.86),
      browLeft: -0.2,
      browRight: 0.2,
    };
  }

  return idle;
}

function ReactiveTigerModel({ url, mood, reducedMotion }: { url: string; mood: MascotReaction; reducedMotion: boolean }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => scene.clone(true), [scene]);
  const rootRef = useRef<THREE.Group>(null);
  const expressionNodes = useMemo(() => ({
    leftEye: model.getObjectByName('leftEye'),
    rightEye: model.getObjectByName('rightEye'),
    leftBrow: model.getObjectByName('leftBrow'),
    rightBrow: model.getObjectByName('rightBrow'),
    leftEar: model.getObjectByName('leftEar'),
    rightEar: model.getObjectByName('rightEar'),
  }), [model]);
  const baseRotations = useMemo(() => ({
    leftBrow: expressionNodes.leftBrow?.rotation.z ?? 0,
    rightBrow: expressionNodes.rightBrow?.rotation.z ?? 0,
    leftEar: expressionNodes.leftEar?.rotation.z ?? 0,
    rightEar: expressionNodes.rightEar?.rotation.z ?? 0,
  }), [expressionNodes]);

  useFrame((state, delta) => {
    const root = rootRef.current;
    if (!root) return;
    const elapsed = state.clock.getElapsedTime();
    const target = getModelMotion(mood, elapsed);
    const smooth = (current: number, next: number, speed: number) =>
      reducedMotion ? next : THREE.MathUtils.damp(current, next, speed, delta);

    root.position.y = smooth(root.position.y, target.y, 7);
    root.rotation.x = smooth(root.rotation.x, target.rotationX, 7);
    root.rotation.y = smooth(root.rotation.y, target.rotationY, 7);
    root.rotation.z = smooth(root.rotation.z, target.rotationZ, 8);
    const nextScale = smooth(root.scale.y, target.scale, 8);
    root.scale.set(nextScale * MODEL_ASPECT_X, nextScale, nextScale);

    const { leftEye, rightEye, leftBrow, rightBrow, leftEar, rightEar } = expressionNodes;
    if (leftEye) leftEye.scale.y = smooth(leftEye.scale.y, target.eyeScale, 22);
    if (rightEye) rightEye.scale.y = smooth(rightEye.scale.y, target.eyeScale, 22);
    if (leftBrow) leftBrow.rotation.z = smooth(leftBrow.rotation.z, baseRotations.leftBrow + target.browLeft, 9);
    if (rightBrow) rightBrow.rotation.z = smooth(rightBrow.rotation.z, baseRotations.rightBrow + target.browRight, 9);

    const earPulse = Math.sin(elapsed * 1.12) * 0.014;
    if (leftEar) leftEar.rotation.z = smooth(leftEar.rotation.z, baseRotations.leftEar + earPulse, 9);
    if (rightEar) rightEar.rotation.z = smooth(rightEar.rotation.z, baseRotations.rightEar - earPulse, 9);
  });

  return <group ref={rootRef} position={[0, -0.02, 0]} scale={[MODEL_ASPECT_X, 1, 1]}><primitive object={model} /></group>;
}

function DemandFrameDriver({ paused }: { paused: boolean }) {
  const invalidate = useThree(state => state.invalidate);

  useEffect(() => {
    invalidate();
    if (paused) return;
    const interval = window.setInterval(() => {
      if (!document.hidden) invalidate();
    }, 1000 / 30);
    const refresh = () => invalidate();
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [invalidate, paused]);

  return null;
}

export const T1gerMascot3D: React.FC<MascotProps> = ({
  modelPath = DEFAULT_MODEL,
  mood = 'idle',
  className = 'h-44 w-44',
  closeUp = false,
  health = 100,
  energy = 85,
  hunger = 80,
  isEating = false,
  isMeditating = false,
  isPetted = false,
  onPet,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.1 });
  const prefersReducedMotion = Boolean(useReducedMotion());
  const cameraPosition: Point3 = closeUp ? [0, 0.04, 3.58] : [0, 0.03, 3.34];
  const reactiveMood: MascotReaction = isEating || isPetted
    ? 'happy'
    : isMeditating
      ? 'thinking'
      : health < 35 || hunger < 25
        ? 'warning'
        : energy < 25
          ? 'mistake'
          : mood;

  return (
    <div
      ref={containerRef}
      className={`relative flex select-none items-center justify-center ${onPet ? 'cursor-pointer' : 'pointer-events-none'} ${className}`}
      onClick={onPet}
      role={onPet ? 'button' : undefined}
      tabIndex={onPet ? 0 : undefined}
      aria-label={onPet ? 'Interactuar con T1GER' : undefined}
      aria-hidden={onPet ? undefined : true}
    >
      <Canvas
        frameloop="demand"
        camera={{ position: cameraPosition, fov: closeUp ? 35 : 36, near: 0.1, far: 20 }}
        dpr={[1, 1.3]}
        performance={{ min: 0.65 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 1 }}
        onCreated={({ camera, gl }) => {
          camera.lookAt(0, -0.02, 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <DemandFrameDriver paused={!isInView || prefersReducedMotion} />
        <ambientLight intensity={0.58} color="#FFF6EC" />
        <hemisphereLight args={['#FFF2DF', '#30241E', 0.9]} />
        <directionalLight position={[3.2, 4.8, 5.5]} intensity={1.72} color="#FFF1DE" />
        <directionalLight position={[-3.8, 1.4, 4]} intensity={0.46} color="#DBEEE9" />
        <pointLight position={[1.8, -2.2, 3.2]} intensity={0.22} color="#F3A169" />
        <Suspense fallback={null}>
          <ReactiveTigerModel url={modelPath} mood={reactiveMood} reducedMotion={prefersReducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
};

useGLTF.preload(DEFAULT_MODEL);
