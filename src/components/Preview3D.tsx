import { useRef, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { ElementPanel } from '@/components/ElementPanel';
import { useIsMobile } from '@/hooks/use-mobile';

const CANVAS_W = 600;
const CANVAS_H = 400;

const CUP_COLORS: Record<string, { color: string; opacity: number }> = {
  '#f2f2f2': { color: '#f2f2f2', opacity: 1 },
  '#e8f0f5': { color: '#e8f0f5', opacity: 0.75 },
};

function getCupProps(cupColor: string) {
  return CUP_COLORS[cupColor] ?? { color: cupColor, opacity: 0.92 };
}

function CupMesh() {
  const cupColor = useStore((s) => s.currentDesign.cupColor);
  const elements = useStore((s) => s.currentDesign.elements);
  const setSelectedElementId = useStore((s) => s.setSelectedElementId);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const offscreenCanvas = useRef<HTMLCanvasElement | null>(null);
  const bodyMeshRef = useRef<THREE.Mesh>(null);

  // Create offscreen canvas once
  if (!offscreenCanvas.current) {
    offscreenCanvas.current = document.createElement('canvas');
    offscreenCanvas.current.width = CANVAS_W;
    offscreenCanvas.current.height = CANVAS_H;
  }

  // Rebuild texture whenever design changes
  useEffect(() => {
    const canvas = offscreenCanvas.current!;
    const ctx = canvas.getContext('2d')!;

    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

    const imageEls = sorted.filter((el) => (el.type === 'image' || el.type === 'svg') && el.src);
    const imagePromises = imageEls.map(
      (el) =>
        new Promise<{ el: typeof el; img: HTMLImageElement }>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve({ el, img });
          img.onerror = () => resolve({ el, img });
          img.src = el.src!;
        })
    );

    Promise.all(imagePromises).then((loaded) => {
      const imgMap = new Map<string, HTMLImageElement>();
      loaded.forEach(({ el, img }) => {
        if (img.complete && img.naturalWidth > 0) imgMap.set(el.id, img);
      });

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = cupColor;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

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
        } else if ((el.type === 'image' || el.type === 'svg') && imgMap.has(el.id)) {
          const img = imgMap.get(el.id)!;
          ctx.drawImage(img, -el.width / 2, -el.height / 2, el.width, el.height);
        }

        ctx.restore();
      });

      if (textureRef.current) {
        textureRef.current.needsUpdate = true;
      }
    });
  }, [cupColor, elements]);

  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(offscreenCanvas.current!);
    textureRef.current = tex;
    return tex;
  }, []);

  // Click handler: map UV to canvas coords and find element
  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      const uv = e.uv as THREE.Vector2 | undefined;
      if (!uv) {
        setSelectedElementId(null);
        return;
      }

      const canvasX = uv.x * CANVAS_W;
      const canvasY = (1 - uv.y) * CANVAS_H;

      // Check elements from top (highest zIndex) to bottom
      const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);
      for (const el of sorted) {
        if (
          canvasX >= el.x &&
          canvasX <= el.x + el.width &&
          canvasY >= el.y &&
          canvasY <= el.y + el.height
        ) {
          setSelectedElementId(el.id);
          return;
        }
      }
      setSelectedElementId(null);
    },
    [elements, setSelectedElementId]
  );

  const { color: matColor, opacity: matOpacity } = getCupProps(cupColor);

  const topR = 1.1;
  const botR = 0.85;
  const h = 2.2;
  const rimThickness = 0.04;
  const rimHeight = 0.08;

  return (
    <group>
      {/* Cup body — textured, clickable */}
      <mesh
        ref={bodyMeshRef}
        geometry={new THREE.CylinderGeometry(topR, botR, h, 64, 1, true)}
        onClick={handleClick}
      >
        <meshPhysicalMaterial
          map={texture}
          side={THREE.DoubleSide}
          transparent
          opacity={matOpacity}
          roughness={0.3}
          metalness={0.05}
          clearcoat={0.4}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Bottom disc */}
      <mesh position={[0, -h / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[botR, 64]} />
        <meshPhysicalMaterial
          color={matColor}
          side={THREE.DoubleSide}
          transparent
          opacity={matOpacity}
          roughness={0.3}
          metalness={0.05}
          clearcoat={0.4}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Top rim */}
      <mesh position={[0, h / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[topR, rimThickness, 16, 64]} />
        <meshPhysicalMaterial
          color={matColor}
          roughness={0.2}
          metalness={0.05}
          clearcoat={0.6}
          clearcoatRoughness={0.15}
          transparent
          opacity={matOpacity}
        />
      </mesh>

      {/* Inner rim lip */}
      <mesh
        geometry={new THREE.CylinderGeometry(topR - rimThickness * 2, topR, rimHeight, 64, 1, true)}
        position={[0, h / 2 - rimHeight / 2, 0]}
      >
        <meshPhysicalMaterial
          color={matColor}
          side={THREE.DoubleSide}
          transparent
          opacity={matOpacity}
          roughness={0.3}
          metalness={0.05}
          clearcoat={0.4}
          clearcoatRoughness={0.2}
        />
      </mesh>
    </group>
  );
}

const Preview3D = () => {
  const controlsRef = useRef<any>(null);
  const { currentDesign, selectedElementId, setSelectedElementId } = useStore();
  const isMobile = useIsMobile();

  const selectedElement = useMemo(
    () => currentDesign.elements.find((el) => el.id === selectedElementId),
    [currentDesign.elements, selectedElementId]
  );

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const controls = controlsRef.current;
    if (!controls) return;
    const camera = controls.object;
    const factor = direction === 'in' ? 0.8 : 1.25;
    const newPos = camera.position.clone().multiplyScalar(factor);
    const dist = newPos.length();
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

      {/* Element list for selecting/editing */}
      {currentDesign.elements.length > 0 && (
        <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-sm border-thin rounded-xl shadow-lg p-2 z-10 max-w-[180px]">
          <p className="text-[9px] font-semibold text-muted-foreground mb-1.5 px-1">Éléments</p>
          <div className="flex flex-col gap-0.5">
            {currentDesign.elements
              .slice()
              .sort((a, b) => b.zIndex - a.zIndex)
              .map((el) => {
                const label =
                  el.type === 'text'
                    ? `Texte : "${(el.text || '').slice(0, 12)}"`
                    : el.type === 'image'
                    ? 'Image'
                    : 'SVG';
                return (
                  <button
                    key={el.id}
                    onClick={() => setSelectedElementId(selectedElementId === el.id ? null : el.id)}
                    className={`text-left text-[10px] px-2 py-1.5 rounded-lg transition-colors truncate ${
                      selectedElementId === el.id
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-secondary text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Property panel for selected element */}
      {selectedElement && (
        <ElementPanel
          element={selectedElement}
          isMobile={isMobile}
          anchor={!isMobile ? { left: 200, top: 10 } : undefined}
        />
      )}

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

      {/* Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] text-foreground/60 bg-background/85 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">
        ‹&nbsp; Glissez pour tourner &nbsp;›&nbsp; | &nbsp;Scrollez pour zoomer
      </div>
    </div>
  );
};

export default Preview3D;
