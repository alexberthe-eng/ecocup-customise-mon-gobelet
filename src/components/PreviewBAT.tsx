import { useMemo, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Printer, Download } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { getClipPath } from '@/lib/clipPaths';

const CANVAS_W = 600;
const CANVAS_H = 400;
const BLEED = 4;
const SAFE = 12;

const PreviewBAT = () => {
  const { currentDesign } = useStore();
  const batRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const isMobile = useIsMobile();

  const canvasW = isMobile ? 340 : CANVAS_W;
  const canvasH = isMobile ? 227 : CANVAS_H;
  const scale = isMobile ? 340 / 600 : 1;

  const warnings = useMemo(() => {
    const result: { type: 'success' | 'warning' | 'error'; text: string }[] = [];
    let allInSafe = true;
    let anyNearEdge = false;
    let anyOutside = false;

    currentDesign.elements.forEach((el) => {
      if (el.x < BLEED || el.y < BLEED || el.x + el.width > CANVAS_W - BLEED || el.y + el.height > CANVAS_H - BLEED) {
        anyOutside = true;
      } else if (el.x < SAFE || el.y < SAFE || el.x + el.width > CANVAS_W - SAFE || el.y + el.height > CANVAS_H - SAFE) {
        anyNearEdge = true;
        allInSafe = false;
      }
    });

    result.push({ type: 'success', text: '✓ Résolution correcte' });
    if (currentDesign.elements.length === 0 || allInSafe) {
      result.push({ type: 'success', text: '✓ Dans la zone sécurité' });
    }
    if (anyNearEdge) {
      result.push({ type: 'warning', text: '⚠ Élément proche du bord' });
    }
    if (anyOutside) {
      result.push({ type: 'error', text: '✗ Élément hors zone' });
    }

    return result;
  }, [currentDesign.elements]);

  const sortedElements = useMemo(
    () => [...currentDesign.elements].sort((a, b) => a.zIndex - b.zIndex),
    [currentDesign.elements]
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!batRef.current || generating) return;
    setGenerating(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(batRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      // Header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ECOCUP® — Bon à Tirer', 15, 15);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Design : ${currentDesign.name}`, 15, 22);
      pdf.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 15, 27);
      pdf.text(`Quantité : ${currentDesign.quantity}`, 15, 32);

      // BAT image
      const imgData = canvas.toDataURL('image/png');
      const imgW = pageW - 30;
      const imgH = (canvas.height / canvas.width) * imgW;
      const imgY = 38;
      pdf.addImage(imgData, 'PNG', 15, imgY, imgW, Math.min(imgH, pageH - imgY - 20));

      // Footer
      pdf.setFontSize(7);
      pdf.setTextColor(120);
      pdf.text(
        'Ce document est un aperçu non contractuel. Vérifiez les zones de sécurité avant validation.',
        15,
        pageH - 8
      );

      const dateSuffix = new Date().toISOString().slice(0, 10);
      const safeName = currentDesign.name.replace(/\s+/g, '');
      pdf.save(`BAT_ecocup_${safeName}_${dateSuffix}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-secondary/30 gap-4 p-4 md:p-6 overflow-auto">
      {/* Action bar — hidden in print */}
      <div className="flex gap-2 bat-actions">
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border-thin rounded-md hover:bg-secondary transition-colors"
        >
          <Printer size={14} />
          <span className="hidden sm:inline">Imprimer</span>
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={generating}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border-thin rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
        >
          <Download size={14} />
          <span className="hidden sm:inline">
            {generating ? 'Génération en cours…' : 'Télécharger en PDF'}
          </span>
        </button>
      </div>

      {/* BAT canvas */}
      <div
        ref={batRef}
        id="bat-content"
        className="relative rounded-xl border-thin overflow-hidden shrink-0"
        style={{
          width: canvasW,
          height: canvasH,
          backgroundColor: currentDesign.cupColor,
        }}
      >
        {/* Bleed zone */}
        <div
          className="absolute border-2 border-dashed pointer-events-none"
          style={{
            borderColor: '#378ADD',
            top: BLEED * scale,
            left: BLEED * scale,
            right: BLEED * scale,
            bottom: BLEED * scale,
          }}
        />
        {/* Safe zone */}
        <div
          className="absolute border-2 border-dashed pointer-events-none"
          style={{
            borderColor: '#1D9E75',
            top: SAFE * scale,
            left: SAFE * scale,
            right: SAFE * scale,
            bottom: SAFE * scale,
          }}
        />

        {/* Elements */}
        {sortedElements.map((el) => (
          <div
            key={el.id}
            className="absolute"
            style={{
              left: el.x * scale,
              top: el.y * scale,
              width: el.width * scale,
              height: el.height * scale,
              transform: `rotate(${el.rotation}deg)`,
              opacity: el.opacity / 100,
              zIndex: el.zIndex,
            }}
          >
            {el.type === 'text' && (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  color: el.color,
                  fontFamily: el.fontFamily || 'system-ui',
                  fontSize: (el.fontSize || 16) * scale,
                  fontWeight: 600,
                }}
              >
                {el.text}
              </div>
            )}
            {(el.type === 'image' || el.type === 'svg') && el.src && (
              <img
                src={el.src}
                alt=""
                className="w-full h-full object-contain"
                draggable={false}
                style={el.maskType ? { clipPath: getClipPath(el.maskType) } : undefined}
              />
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground bat-legend">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-5 border-t-2 border-dashed" style={{ borderColor: '#378ADD' }} />
          <span>Zone fond perdu (impression étendue)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-5 border-t-2 border-dashed" style={{ borderColor: '#1D9E75' }} />
          <span>Zone de sécurité (contenu important à garder dans cette zone)</span>
        </div>
      </div>

      {/* Validation pills — hidden in print */}
      <div className="flex flex-wrap gap-2 bat-pills">
        {warnings.map((w, i) => (
          <span
            key={i}
            className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
              w.type === 'success'
                ? 'bg-success/10 text-success'
                : w.type === 'warning'
                ? 'bg-warning/10 text-warning'
                : 'bg-destructive/10 text-destructive'
            }`}
          >
            {w.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PreviewBAT;
