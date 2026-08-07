import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';

export type MascotReaction = 'idle' | 'happy' | 'celebrate' | 'mistake' | 'thinking' | 'beast' | 'warning';

interface MascotProps {
  modelPath?: string;
  mood?: MascotReaction;
  className?: string;
  allowOrbitControls?: boolean;
  closeUp?: boolean;
}

// 3D Procedural Tiger with Duolingo-style Reactive Skeletal Animations
function ReactiveTiger3D({ mood = 'idle' }: { mood: MascotReaction }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftEarRef = useRef<THREE.Group>(null);
  const rightEarRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current || !headRef.current) return;
    const t = state.clock.getElapsedTime();

    // 1. NATURAL BREATHING & SECONDARY BODY PHYSICS
    const breath = Math.sin(t * 2.5);
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + breath * 0.025;
      bodyRef.current.scale.x = 1 - breath * 0.015;
    }

    // 2. INDEPENDENT EAR TWITCH PHYSICS
    const earTwitchL = Math.sin(t * 6.5) > 0.95 ? 0.25 : 0;
    const earTwitchR = Math.cos(t * 5.2) > 0.95 ? -0.25 : 0;
    if (leftEarRef.current) leftEarRef.current.rotation.z = Math.sin(t * 1.5) * 0.05 + earTwitchL;
    if (rightEarRef.current) rightEarRef.current.rotation.z = -Math.sin(t * 1.5) * 0.05 + earTwitchR;

    // 3. TAIL SWAYING
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 3.5) * 0.25;
      tailRef.current.rotation.y = Math.cos(t * 2.5) * 0.15;
    }

    // 4. EYES BLINK CYCLE
    const blinkCycle = Math.sin(t * 1.8);
    const isBlinking = blinkCycle > 0.96;
    const eyeScaleY = isBlinking ? 0.08 : 1;
    if (leftEyeRef.current) leftEyeRef.current.scale.y = eyeScaleY;
    if (rightEyeRef.current) rightEyeRef.current.scale.y = eyeScaleY;

    // 5. MOOD REACTION STATE MACHINE
    switch (mood) {
      case 'happy':
      case 'celebrate':
        // DUOLINGO VICTORY BOUNCE & CHEERFUL WIGGLE
        const jumpY = Math.abs(Math.sin(t * 7)) * 0.28;
        groupRef.current.position.y = -0.45 + jumpY;
        headRef.current.rotation.z = Math.sin(t * 10) * 0.18;
        headRef.current.rotation.y = Math.sin(t * 5) * 0.12;
        headRef.current.rotation.x = -Math.abs(Math.sin(t * 7)) * 0.1;
        if (leftArmRef.current) leftArmRef.current.rotation.z = 1.1 + Math.sin(t * 9) * 0.4;
        if (rightArmRef.current) rightArmRef.current.rotation.z = -1.1 - Math.sin(t * 9) * 0.4;
        break;

      case 'mistake':
      case 'warning':
        // DUOLINGO SAD DROOP & HEAD SHAKE NO
        groupRef.current.position.y = -0.48 + Math.sin(t * 1.5) * 0.015;
        headRef.current.rotation.y = Math.sin(t * 9) * 0.28; // Shaking head NO
        headRef.current.rotation.x = 0.25; // Drooping head forward
        headRef.current.rotation.z = -0.08;
        if (leftArmRef.current) leftArmRef.current.rotation.z = 0.15;
        if (rightArmRef.current) rightArmRef.current.rotation.z = -0.15;
        break;

      case 'thinking':
        // PONDER & CHIN TAP
        groupRef.current.position.y = -0.45 + Math.sin(t * 1.8) * 0.02;
        headRef.current.rotation.z = 0.28; // Tilt head
        headRef.current.rotation.x = -0.12;
        headRef.current.rotation.y = 0.15;
        if (leftArmRef.current) leftArmRef.current.rotation.z = 0.25;
        if (rightArmRef.current) rightArmRef.current.rotation.z = -1.45 + Math.sin(t * 4) * 0.08; // Tap chin
        break;

      case 'beast':
        // HIGH ENERGY POWER STANCE
        groupRef.current.position.y = -0.45 + Math.sin(t * 4) * 0.05;
        groupRef.current.rotation.y = Math.sin(t * 2) * 0.1;
        headRef.current.rotation.x = -0.15;
        if (leftArmRef.current) leftArmRef.current.rotation.z = 1.3;
        if (rightArmRef.current) rightArmRef.current.rotation.z = -1.3;
        break;

      case 'idle':
      default:
        // NATURAL LIFELIKE IDLE
        groupRef.current.position.y = -0.45 + Math.sin(t * 2) * 0.03;
        headRef.current.rotation.y = Math.sin(t * 1.2) * 0.09;
        headRef.current.rotation.z = Math.sin(t * 0.9) * 0.04;
        headRef.current.rotation.x = Math.sin(t * 1.5) * 0.03;
        if (leftArmRef.current) leftArmRef.current.rotation.z = 0.35 + Math.sin(t * 2) * 0.04;
        if (rightArmRef.current) rightArmRef.current.rotation.z = -0.35 - Math.sin(t * 2) * 0.04;
        break;
    }
  });

  const getTigerBodyColor = () => {
    if (mood === 'beast') return '#FF7300';
    if (mood === 'warning' || mood === 'mistake') return '#EF4444';
    if (mood === 'happy' || mood === 'celebrate') return '#10B981';
    return '#FF7300';
  };

  return (
    <group ref={groupRef} position={[0, -0.45, 0]}>
      {/* 🐯 HEAD GROUP */}
      <group ref={headRef} position={[0, 0.65, 0]}>
        {/* Main Tiger Head Sphere */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial color={getTigerBodyColor()} roughness={0.3} metalness={0.05} />
        </mesh>

        {/* 3D TIGER STRIPES (Forehead & Cheeks) */}
        <mesh position={[0, 0.4, 0.3]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.08, 0.2, 0.04]} />
          <meshStandardMaterial color="#1C1917" roughness={0.2} />
        </mesh>
        <mesh position={[-0.18, 0.36, 0.28]} rotation={[0.3, 0, -0.3]}>
          <boxGeometry args={[0.06, 0.16, 0.04]} />
          <meshStandardMaterial color="#1C1917" roughness={0.2} />
        </mesh>
        <mesh position={[0.18, 0.36, 0.28]} rotation={[0.3, 0, 0.3]}>
          <boxGeometry args={[0.06, 0.16, 0.04]} />
          <meshStandardMaterial color="#1C1917" roughness={0.2} />
        </mesh>

        <mesh position={[-0.42, 0.05, 0.2]} rotation={[0, -0.4, 0.2]}>
          <boxGeometry args={[0.16, 0.05, 0.04]} />
          <meshStandardMaterial color="#1C1917" />
        </mesh>
        <mesh position={[0.42, 0.05, 0.2]} rotation={[0, 0.4, -0.2]}>
          <boxGeometry args={[0.16, 0.05, 0.04]} />
          <meshStandardMaterial color="#1C1917" />
        </mesh>

        {/* Cream Snout */}
        <mesh position={[0, -0.1, 0.4]}>
          <sphereGeometry args={[0.26, 32, 32]} />
          <meshStandardMaterial color="#FEF3C7" roughness={0.4} />
        </mesh>

        {/* Dark Nose */}
        <mesh position={[0, 0.02, 0.62]}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial color="#1C1917" roughness={0.1} />
        </mesh>

        {/* Whiskers */}
        <mesh position={[-0.3, -0.06, 0.5]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.2, 0.015, 0.015]} />
          <meshStandardMaterial color="#1C1917" />
        </mesh>
        <mesh position={[0.3, -0.06, 0.5]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.2, 0.015, 0.015]} />
          <meshStandardMaterial color="#1C1917" />
        </mesh>

        {/* Eyes */}
        <mesh ref={leftEyeRef} position={[-0.2, 0.12, 0.45]}>
          <sphereGeometry args={[0.085, 16, 16]} />
          <meshStandardMaterial color="#09090B" roughness={0.05} />
        </mesh>
        <mesh ref={rightEyeRef} position={[0.2, 0.12, 0.45]}>
          <sphereGeometry args={[0.085, 16, 16]} />
          <meshStandardMaterial color="#09090B" roughness={0.05} />
        </mesh>

        {/* Eye Shine */}
        <mesh position={[-0.23, 0.15, 0.52]}>
          <sphereGeometry args={[0.026, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0} />
        </mesh>
        <mesh position={[0.17, 0.15, 0.52]}>
          <sphereGeometry args={[0.026, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0} />
        </mesh>

        {/* Outer & Inner Left Ear with Twitch Ref */}
        <group ref={leftEarRef} position={[-0.42, 0.45, 0]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color="#1C1917" />
          </mesh>
          <mesh position={[0.02, 0, 0.07]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#FEF3C7" />
          </mesh>
        </group>

        {/* Outer & Inner Right Ear with Twitch Ref */}
        <group ref={rightEarRef} position={[0.42, 0.45, 0]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color="#1C1917" />
          </mesh>
          <mesh position={[-0.02, 0, 0.07]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#FEF3C7" />
          </mesh>
        </group>
      </group>

      {/* 🧥 BODY GROUP */}
      <mesh ref={bodyRef} position={[0, -0.15, 0]}>
        <capsuleGeometry args={[0.35, 0.45, 16, 32]} />
        <meshStandardMaterial color={getTigerBodyColor()} roughness={0.3} />
      </mesh>

      {/* Cream Belly */}
      <mesh position={[0, -0.15, 0.2]}>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshStandardMaterial color="#FEF3C7" roughness={0.4} />
      </mesh>

      {/* Gold T1GER Badge */}
      <mesh position={[0, -0.05, 0.35]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.075, 0.075, 0.04]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 🐾 ARMS */}
      <mesh ref={leftArmRef} position={[-0.4, -0.05, 0]}>
        <capsuleGeometry args={[0.1, 0.3, 8, 16]} />
        <meshStandardMaterial color={getTigerBodyColor()} />
      </mesh>
      <mesh ref={rightArmRef} position={[0.4, -0.05, 0]}>
        <capsuleGeometry args={[0.1, 0.3, 8, 16]} />
        <meshStandardMaterial color={getTigerBodyColor()} />
      </mesh>

      {/* 🐾 TAIL WITH WAG PHYSICS */}
      <group ref={tailRef} position={[0, -0.38, -0.25]}>
        <mesh position={[0, -0.12, -0.15]} rotation={[-0.5, 0, 0]}>
          <capsuleGeometry args={[0.06, 0.35, 8, 16]} />
          <meshStandardMaterial color={getTigerBodyColor()} />
        </mesh>
      </group>

      {/* Feet */}
      <mesh position={[-0.18, -0.5, 0.08]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#1C1917" />
      </mesh>
      <mesh position={[0.18, -0.5, 0.08]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#1C1917" />
      </mesh>
    </group>
  );
}

// GLTF Loader Component for real TRELLIS.2 GLB Models
function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.8} position={[0, -0.8, 0]} />;
}

export const T1gerMascot3D: React.FC<MascotProps> = ({
  modelPath,
  mood = 'idle',
  className = 'w-44 h-44',
  closeUp = false,
}) => {
  // ANTI-CLIPPING CAMERA FRAMING WITH 25% SAFETY PADDING
  const cameraPos: [number, number, number] = closeUp ? [0, 0.55, 1.65] : [0, 0.2, 3.2];

  return (
    <div className={`relative ${className} select-none flex items-center justify-center pointer-events-none`}>
      <Canvas
        camera={{ position: cameraPos, fov: closeUp ? 40 : 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 8, 6]} intensity={1.6} color="#FFF7ED" />
        <pointLight position={[-4, -2, -2]} intensity={0.6} color="#FF7300" />
        <pointLight position={[0, 2, 2]} intensity={0.5} color="#FFD700" />

        <Suspense fallback={<ReactiveTiger3D mood={mood} />}>
          <Float speed={closeUp ? 0.8 : 1.5} rotationIntensity={closeUp ? 0.02 : 0.08} floatIntensity={closeUp ? 0.02 : 0.12}>
            {modelPath ? <GLBModel url={modelPath} /> : <ReactiveTiger3D mood={mood} />}
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
};
