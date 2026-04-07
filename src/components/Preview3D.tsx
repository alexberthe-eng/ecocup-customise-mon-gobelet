import { useRef, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { ZoomIn, ZoomOut, Move, RotateCcw } from 'lucide-react';

const CANVAS_W = 600;
const CANVAS_H = 400;

function CupMesh() {
  const cupColor = useStore((s) => s.currentDesign.cupColor);
  const elements = useStore((s) => s.currentDesign.elements);
  const meshRef = useRef<THREE.Mesh>(null);

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = cupColor;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

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

  const geometry = useMemo(() => {
    return new THREE.CylinderGeometry(1.1, 0.85, 2.2, 64, 1, true);
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry}>
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
  const controlsRef = useRef<any>(null);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const controls = controlsRef.current;
    if (!controls) return;
    const camera = controls.object;
    const factor = direction === 'in' ? 0.8 : 1.25;
    const newPos = camera.position.clone().multiplyScalar(factor);
    const dist = newPos.length();
    // Clamp between min/max distance
    if (dist >= 2 && dist <= 8) {
      camera.position.copy(newPos);
      controls.update();
    }
  }, []);

  const handleReset = useCallback(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.object.position.set(0, 0.5, 4);
    controls.target.set(0, 0, 0);
    controls.update();
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative" style={{ backgroundColor: '#d8d8d8' }}>
      <Canvas camera={{ position: [0, 0.5, 4], fov: 35 }} className="flex-1 w-full">
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <CupMesh />
        <OrbitControls
          ref={controlsRef}
          enableZoom={true}
          enablePan={false}
          minDistance={2}
          maxDistance={8}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          zoomSpeed={0.6}
        />
      </Canvas>

      {/* Zoom buttons */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        <button
          onClick={() => handleZoom('in')}
          className="w-8 h-8 bg-background/90 rounded-lg border-thin flex items-center justify-center hover:bg-background transition-colors shadow-sm"
          title="Zoom avant"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="w-8 h-8 bg-background/90 rounded-lg border-thin flex items-center justify-center hover:bg-background transition-colors shadow-sm"
          title="Zoom arrière"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={handleReset}
          className="w-8 h-8 bg-background/90 rounded-lg border-thin flex items-center justify-center hover:bg-background transition-colors shadow-sm"
          title="Réinitialiser la vue"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Help hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[11px] text-foreground/60 bg-background/85 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">
        <span className="flex items-center gap-1">
          <Move size={12} />
          Glissez pour tourner
        </span>
        <span className="w-px h-3 bg-foreground/20" />
        <span>Scrollez pour zoomer</span>
      </div>
    </div>
  );
};

export default Preview3D;
