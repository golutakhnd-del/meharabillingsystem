import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import FloatingCube from './FloatingCube';

interface Scene3DProps {
  className?: string;
  enableControls?: boolean;
}

export default function Scene3D({ className = "", enableControls = false }: Scene3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#06b6d4" />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          
          <FloatingCube position={[-2, 1, 0]} color="#06b6d4" size={0.8} />
          <FloatingCube position={[2, -1, 0]} color="#3b82f6" size={0.6} />
          <FloatingCube position={[0, 0, -1]} color="#8b5cf6" size={0.4} />
          
          {enableControls && (
            <OrbitControls 
              enableZoom={false} 
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.5}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}