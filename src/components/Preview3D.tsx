import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

const CANVAS_W = 600;
const CANVAS_H = 400;

function CupMesh() {
  const cupColor = useStore((s) => s.currentDesign.cupColor);
  const elements = useStore((s) => s.currentDesign.elements);
  const meshRef = useRef<THREE.Mesh>(null);

  // Create a texture from the 2D canvas design
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d')!;
    
    // Background
    ctx.fillStyle = cupColor;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Draw elements
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    sorted.forEach((el) => {
      ctx.save();
      ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.globalAlpha = el.opacity / 100;

      if (el.type === 'text' && el.text) {
        ctx.fillStyle = el.color;
        ctx.font = `600 ${el.fontSize || 16}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(el.text, 0, 0);
      }
      ctx.restore();
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [cupColor, elements]);

  // Truncated cone geometry (cup shape)
  const geometry = useMemo(() => {
    return new THREE.CylinderGeometry(1.1, 0.85, 2.2, 64, 1, true);
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[0, 0, 0]}>
      <meshPhysicalMaterial
        map={texture}
        side={THREE.DoubleSide}
        transparent
        opacity={0.92}
        roughness={0.3}
        metalness={0.05}
        clearcoat={0.4}
        clearcoatRoughness={0.2}
      />
    </mesh>
  );
}

const Preview3D = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative" style={{ backgroundColor: '#d8d8d8' }}>
      <Canvas camera={{ position: [0, 0.5, 4], fov: 35 }} className="flex-1 w-full">
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <CupMesh />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-foreground/50 bg-background/80 px-3 py-1 rounded-full">
        ‹ › Maintenez pour faire tourner
      </div>
    </div>
  );
};

export default Preview3D;
