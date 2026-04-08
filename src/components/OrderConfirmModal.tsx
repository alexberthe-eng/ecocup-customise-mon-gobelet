import { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Design, getUnitPrice } from '@/store/useStore';
import { getGraduationMarks } from '@/components/GraduationMarks';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import ecocupLogo from '@/assets/ecocup-logo.png';
import { applyClipToCtx } from '@/lib/clipPaths';

const CANVAS_W = 600;
const CANVAS_H = 400;

function PreviewCupMesh({ design }: { design: Design }) {
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const offscreenCanvas = useRef<HTMLCanvasElement | null>(null);

  if (!offscreenCanvas.current) {
    offscreenCanvas.current = document.createElement('canvas');
    offscreenCanvas.current.width = CANVAS_W;
    offscreenCanvas.current.height = CANVAS_H;
  }

  useEffect(() => {
    const canvas = offscreenCanvas.current!;
    const ctx = canvas.getContext('2d')!;
    const sorted = [...design.elements].sort((a, b) => a.zIndex - b.zIndex);

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
      ctx.fillStyle = design.cupColor;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      sorted.forEach((el) => {
        ctx.save();
        ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
        ctx.rotate((el.rotation * Math.PI) / 180);
        ctx.globalAlpha = el.opacity / 100;

        if (el.type === 'text' && el.text) {
          ctx.fillStyle = el.color;
          ctx.font = `600 ${el.fontSize || 16}px ${el.fontFamily || 'system-ui'}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(el.text, 0, 0);
        } else if ((el.type === 'image' || el.type === 'svg') && imgMap.has(el.id)) {
          const img = imgMap.get(el.id)!;
          if (el.maskType && el.maskType !== 'rectangle') {
            ctx.save();
            ctx.translate(-el.width / 2, -el.height / 2);
            applyClipToCtx(ctx, el.maskType, el.width, el.height);
            ctx.drawImage(img, 0, 0, el.width, el.height);
            ctx.restore();
          } else {
            ctx.drawImage(img, -el.width / 2, -el.height / 2, el.width, el.height);
          }
        }
        ctx.restore();
      });

      // Graduation
      const marks = getGraduationMarks(design.graduation);
      const off = design.graduationOffset;
      ctx.save();
      marks.forEach((mark) => {
        const cx = mark.defaultX * CANVAS_W + off.dx;
        const y = mark.defaultY * CANVAS_H + off.dy;
        const lineW = CANVAS_W * 0.06;
        ctx.strokeStyle = 'rgba(0,0,0,0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - lineW / 2, y);
        ctx.lineTo(cx + lineW / 2, y);
        ctx.stroke();
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.font = '600 11px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(mark.label, cx, y + 3);
      });
      if (marks.length > 0) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = ecocupLogo;
        const logoH = 24;
        const drawLogo = () => {
          const ratio = logoImg.naturalWidth && logoImg.naturalHeight ? logoImg.naturalWidth / logoImg.naturalHeight : 99 / 88;
          const logoW = logoH * ratio;
          const logoX = (marks[0]?.defaultX ?? 0.5) * CANVAS_W + off.dx;
          const logoY = CANVAS_H - logoH;
          ctx.drawImage(logoImg, logoX - logoW / 2, logoY, logoW, logoH);
        };
        if (logoImg.complete && logoImg.naturalWidth > 0) {
          drawLogo();
        } else {
          logoImg.onload = () => {
            drawLogo();
            if (textureRef.current) textureRef.current.needsUpdate = true;
          };
        }
      }
      ctx.restore();

      if (textureRef.current) textureRef.current.needsUpdate = true;
    });
  }, [design]);

  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(offscreenCanvas.current!);
    textureRef.current = tex;
    return tex;
  }, []);

  const topR = 1.1;
  const botR = 0.85;
  const h = 2.2;
  const rimThickness = 0.04;
  const rimHeight = 0.08;
  const matColor = design.cupColor;

  return (
    <group>
      <mesh geometry={new THREE.CylinderGeometry(topR, botR, h, 64, 1, true)}>
        <meshPhysicalMaterial map={texture} side={THREE.DoubleSide} transparent opacity={0.92} roughness={0.3} metalness={0.05} clearcoat={0.4} clearcoatRoughness={0.2} />
      </mesh>
      <mesh position={[0, -h / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[botR, 64]} />
        <meshPhysicalMaterial color={matColor} side={THREE.DoubleSide} transparent opacity={0.92} roughness={0.3} metalness={0.05} clearcoat={0.4} clearcoatRoughness={0.2} />
      </mesh>
      <mesh position={[0, h / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[topR, rimThickness, 16, 64]} />
        <meshPhysicalMaterial color={matColor} roughness={0.2} metalness={0.05} clearcoat={0.6} clearcoatRoughness={0.15} transparent opacity={0.92} />
      </mesh>
      <mesh geometry={new THREE.CylinderGeometry(topR - rimThickness * 2, topR, rimHeight, 64, 1, true)} position={[0, h / 2 - rimHeight / 2, 0]}>
        <meshPhysicalMaterial color={matColor} side={THREE.DoubleSide} transparent opacity={0.92} roughness={0.3} metalness={0.05} clearcoat={0.4} clearcoatRoughness={0.2} />
      </mesh>
    </group>
  );
}

interface OrderConfirmModalProps {
  cart: Design[];
  cartTotal: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const OrderConfirmModal = ({ cart, cartTotal, onConfirm, onCancel }: OrderConfirmModalProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const design = cart[activeIndex];

  if (!design) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full mx-4 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">Vérifiez votre commande</h3>
          <button onClick={onCancel} className="p-1 hover:bg-secondary rounded">
            <X size={16} />
          </button>
        </div>

        {/* 3D Preview */}
        <div className="relative h-[300px] bg-muted/30">
          <Canvas camera={{ position: [0, 0.5, 4], fov: 35 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <PreviewCupMesh design={design} />
            <OrbitControls enableZoom enablePan={false} minDistance={2} maxDistance={8} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.5} zoomSpeed={0.6} />
          </Canvas>

          {/* Nav arrows */}
          {cart.length > 1 && (
            <>
              <button
                onClick={() => setActiveIndex((i) => (i - 1 + cart.length) % cart.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/90 rounded-full flex items-center justify-center border border-border shadow-sm hover:bg-background"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setActiveIndex((i) => (i + 1) % cart.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/90 rounded-full flex items-center justify-center border border-border shadow-sm hover:bg-background"
              >
                <ChevronRight size={16} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {cart.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === activeIndex ? 'bg-primary' : 'bg-foreground/20'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Design info */}
        <div className="px-5 py-3 border-t border-border">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium truncate">{design.name}</span>
            <span className="text-xs text-muted-foreground">{design.quantity} pcs × {getUnitPrice(design.quantity).toFixed(2)} €</span>
          </div>
          {cart.length > 1 && (
            <p className="text-[10px] text-muted-foreground">Design {activeIndex + 1} sur {cart.length}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground">Total HT</p>
            <p className="text-sm font-semibold">{cartTotal.toFixed(2)} €</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 text-xs border border-border rounded-lg hover:bg-secondary transition-colors">
              Retour
            </button>
            <button onClick={onConfirm} className="px-4 py-2 text-xs bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium">
              Confirmer la commande
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmModal;
