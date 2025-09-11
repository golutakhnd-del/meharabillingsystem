import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingCubeProps {
  position?: [number, number, number];
  color?: string;
  size?: number;
}

export default function FloatingCube({ 
  position = [0, 0, 0], 
  color = "#06b6d4", 
  size = 1 
}: FloatingCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <RoundedBox
        ref={meshRef}
        args={[size, size, size]}
        position={position}
        radius={0.1}
        smoothness={4}
      >
        <meshStandardMaterial 
          color={color} 
          metalness={0.6} 
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </RoundedBox>
    </Float>
  );
}