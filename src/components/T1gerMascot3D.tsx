import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useInView, useReducedMotion } from 'motion/react';
import * as THREE from 'three';
import type { MascotReaction } from '../services/mascotGuide';

export type { MascotReaction } from '../services/mascotGuide';

interface MascotProps {
  modelPath?: string;
  mood?: MascotReaction;
  className?: string;
  closeUp?: boolean;
}

type Point3 = [number, number, number];

const DEFAULT_MODEL = '/mascot/t1ger-head-v1.glb';
const MODEL_ASPECT_X = 0.94;

interface ModelMotion {
  y: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  eyeScale: number;
  browLeft: number;
  browRight: number;
}

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

  switch (mood) {
    case 'happy':
      return {
        ...idle,
        y: Math.abs(Math.sin(elapsed * 3.2)) * 0.045,
        rotationY: Math.sin(elapsed * 1.7) * 0.045,
        rotationZ: Math.sin(elapsed * 2.6) * 0.018,
        scale: 1.012,
        eyeScale: Math.min(blink, 0.82),
        browLeft: 0.08,
        browRight: -0.08,
      };
    case 'celebrate':
      return {
        ...idle,
        y: Math.abs(Math.sin(elapsed * 4.5)) * 0.085,
        rotationY: Math.sin(elapsed * 2.4) * 0.065,
        rotationZ: Math.sin(elapsed * 4.5) * 0.035,
        scale: 1.025,
        eyeScale: Math.min(blink, 0.78),
        browLeft: 0.1,
        browRight: -0.1,
      };
    case 'thinking':
      return {
        ...idle,
        rotationX: -0.018,
        rotationY: -0.075,
        rotationZ: 0.055,
        browLeft: 0.12,
        browRight: -0.02,
      };
    case 'mistake':
      return {
        ...idle,
        y: -0.03,
        rotationX: 0.025,
        rotationY: -0.025,
        rotationZ: -0.035,
        scale: 0.986,
        eyeScale: Math.min(blink, 0.72),
        browLeft: -0.14,
        browRight: 0.14,
      };
    case 'warning':
      return {
        ...idle,
        y: -0.018,
        rotationX: 0.018,
        rotationY: Math.sin(elapsed * 8) * 0.035,
        rotationZ: Math.sin(elapsed * 8) * 0.008,
        scale: 0.992,
        eyeScale: Math.min(blink, 0.78),
        browLeft: -0.16,
        browRight: 0.16,
      };
    case 'beast':
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
    default:
      return idle;
  }
}

interface ReactiveModelProps {
  url: string;
  mood: MascotReaction;
  closeUp: boolean;
  reducedMotion: boolean;
}

function ReactiveTigerModel({ url, mood, closeUp, reducedMotion }: ReactiveModelProps) {
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
    const smooth = (current: number, next: number, speed: number) => reducedMotion ? next : THREE.MathUtils.damp(current, next, speed, delta);
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
    const leftTwitch = Math.sin(elapsed * 5.6) > 0.985 ? 0.06 : 0;
    const rightTwitch = Math.cos(elapsed * 5.2) > 0.985 ? -0.06 : 0;
    if (leftEar) leftEar.rotation.z = smooth(leftEar.rotation.z, baseRotations.leftEar + earPulse + leftTwitch, 9);
    if (rightEar) rightEar.rotation.z = smooth(rightEar.rotation.z, baseRotations.rightEar - earPulse + rightTwitch, 9);
  });

  return (
    <group ref={rootRef} position={[0, closeUp ? -0.015 : -0.03, 0]} scale={[MODEL_ASPECT_X, 1, 1]}>
      <primitive object={model} />
    </group>
  );
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
}) => {
  const cameraPosition: Point3 = closeUp ? [0, 0.04, 3.58] : [0, 0.03, 3.34];
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: .1 });
  const prefersReducedMotion = Boolean(useReducedMotion());

  return (
    <div
      ref={containerRef}
      className={`relative flex select-none items-center justify-center pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <Canvas
        frameloop="demand"
        camera={{ position: cameraPosition, fov: closeUp ? 35 : 36, near: 0.1, far: 20 }}
        dpr={[1, 1.35]}
        performance={{ min: .65 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.NeutralToneMapping,
          toneMappingExposure: 1,
        }}
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
          <ReactiveTigerModel url={modelPath} mood={mood} closeUp={closeUp} reducedMotion={prefersReducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
};

useGLTF.preload(DEFAULT_MODEL);
