import { create } from 'zustand';

export type ElementType = 'image' | 'text' | 'svg';
export type MaskType = 'rectangle' | 'circle' | 'polaroid' | 'star' | 'badge' | 'drop' | null;

export interface DesignElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  color: string;
  zIndex: number;
  src?: string;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  maskType?: MaskType;
}

export interface Design {
  id: string;
  name: string;
  elements: DesignElement[];
  cupColor: string;
  graduation: string;
  quantity: number;
  comment: string;
  /** Single offset for the entire graduation block (pixels) */
  graduationOffset: { dx: number; dy: number };
  /** Base64 thumbnail captured when adding to cart */
  thumbnail?: string;
  productType: string;
  capacity: string;
}

export type ActiveTab = '2d' | '3d' | 'bat';
export type ActiveTool = 'color' | 'image' | 'text' | 'motif' | 'collection' | 'aide' | null;
export type OpenDrawer = 'image' | 'motif' | 'collection' | null;

/** Capacity options per product type */
export const PRODUCT_CAPACITIES: Record<string, { label: string; capacities: string[] }> = {
  'gobelet-eco': { label: 'Gobelet Eco', capacities: ['25cl', '30cl', '33cl', '50cl'] },
  'verre-champagne': { label: 'Verre à champagne', capacities: ['15cl', '20cl'] },
  'mug': { label: 'Mug', capacities: ['25cl', '35cl'] },
  'gobelet-carton': { label: 'Gobelet carton', capacities: ['20cl', '25cl', '33cl'] },
};

/** Default graduation for a given capacity */
const capacityToGraduation = (cap: string): string => {
  if (cap === '50cl') return 'pinte-50cl';
  if (cap === '25cl') return 'standard-25cl';
  return 'standard-33cl';
};

interface AppState {
  currentDesign: Design;
  cart: Design[];
  globalComment: string;
  isDirty: boolean;

  activeTab: ActiveTab;
  activeTool: ActiveTool;
  openDrawer: OpenDrawer;
  showColorPopover: boolean;
  showRightPanel: boolean;
  showCartPanel: boolean;
  gridVisible: boolean;
  tourCompleted: boolean;
  showTour: boolean;
  tourStep: number;
  selectedElementId: string | null;
  showGraduation: boolean;
  showGraduationMask: boolean;

  history: Design[];
  historyIndex: number;

  setActiveTab: (tab: ActiveTab) => void;
  setActiveTool: (tool: ActiveTool) => void;
  setOpenDrawer: (d: OpenDrawer) => void;
  setShowColorPopover: (v: boolean) => void;
  setShowRightPanel: (v: boolean) => void;
  setShowCartPanel: (v: boolean) => void;
  setGridVisible: (v: boolean) => void;
  setSelectedElementId: (id: string | null) => void;
  setCupColor: (color: string) => void;
  setGraduation: (g: string) => void;
  setQuantity: (q: number) => void;
  setComment: (c: string) => void;
  setDesignName: (name: string) => void;
  setShowGraduation: (v: boolean) => void;
  setShowGraduationMask: (v: boolean) => void;
  setProductType: (t: string) => void;
  setCapacity: (c: string) => void;
  setGlobalComment: (c: string) => void;
  setIsDirty: (v: boolean) => void;

  addElement: (el: DesignElement) => void;
  updateElement: (id: string, updates: Partial<DesignElement>, saveHistory?: boolean) => void;
  removeElement: (id: string) => void;
  moveElementLayer: (id: string, direction: 'top' | 'up' | 'down' | 'bottom') => void;

  addToCart: (thumbnail?: string) => void;
  removeFromCart: (id: string) => void;
  editCartDesign: (id: string) => void;
  updateCartDesignName: (id: string, name: string) => void;
  updateCartDesignQuantity: (id: string, quantity: number) => void;

  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  endTour: () => void;

  /** Handles sidebar tool click with new behavior rules */
  handleToolClick: (tool: ActiveTool) => void;
}

const defaultDesign: Design = {
  id: crypto.randomUUID(),
  name: 'Gobelet personnalisé par vos soins – ECO 30 Digital',
  elements: [],
  cupColor: '#f2f2f2',
  graduation: 'standard-33cl',
  quantity: 250,
  comment: '',
  graduationOffset: { dx: 0, dy: 0 },
  productType: 'gobelet-eco',
  capacity: '33cl',
};

const PRICE_TIERS: Record<number, number> = {
  125: 2.80,
  250: 2.40,
  500: 1.95,
  1000: 1.60,
  2500: 1.25,
  5000: 0.98,
  10000: 0.82,
};

export const getUnitPrice = (quantity: number): number => {
  return PRICE_TIERS[quantity] ?? 1.60;
};

export const useStore = create<AppState>((set, get) => ({
  currentDesign: { ...defaultDesign },
  cart: [],
  globalComment: '',
  activeTab: '2d',
  activeTool: null,
  openDrawer: null,
  showColorPopover: false,
  showRightPanel: false,
  showCartPanel: false,
  gridVisible: true,
  tourCompleted: localStorage.getItem('tourCompleted') === 'true',
  showTour: false,
  tourStep: 0,
  selectedElementId: null,
  showGraduation: true,
  showGraduationMask: false,
  history: [{ ...defaultDesign }],
  historyIndex: 0,

  setActiveTab: (tab) => set({ activeTab: tab, selectedElementId: null }),
  setActiveTool: (tool) => set((s) => ({ activeTool: s.activeTool === tool ? null : tool })),
  setOpenDrawer: (d) => set({ openDrawer: d }),
  setShowColorPopover: (v) => set({ showColorPopover: v }),
  setShowRightPanel: (v) => set({ showRightPanel: v }),
  setShowCartPanel: (v) => set({ showCartPanel: v }),
  setGridVisible: (v) => set({ gridVisible: v }),
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  setCupColor: (color) => {
    set((s) => ({ currentDesign: { ...s.currentDesign, cupColor: color } }));
    get().pushHistory();
  },
  setGraduation: (g) => set((s) => ({ currentDesign: { ...s.currentDesign, graduation: g } })),
  setQuantity: (q) => set((s) => ({ currentDesign: { ...s.currentDesign, quantity: q } })),
  setComment: (c) => set((s) => ({ currentDesign: { ...s.currentDesign, comment: c } })),
  setDesignName: (name) => set((s) => ({ currentDesign: { ...s.currentDesign, name } })),
  setShowGraduation: (v) => set({ showGraduation: v }),
  setShowGraduationMask: (v) => set({ showGraduationMask: v }),
  setGlobalComment: (c) => set({ globalComment: c }),

  setProductType: (t) => {
    const caps = PRODUCT_CAPACITIES[t]?.capacities ?? ['33cl'];
    const newCap = caps[0];
    const newGrad = capacityToGraduation(newCap);
    set((s) => ({
      currentDesign: { ...s.currentDesign, productType: t, capacity: newCap, graduation: newGrad },
    }));
  },

  setCapacity: (c) => {
    const newGrad = capacityToGraduation(c);
    set((s) => ({
      currentDesign: { ...s.currentDesign, capacity: c, graduation: newGrad },
    }));
  },

  handleToolClick: (tool) => {
    const s = get();
    set({ showColorPopover: false, openDrawer: null });

    if (tool === 'color') {
      set({ showColorPopover: !s.showColorPopover, activeTool: 'color' });
    } else if (tool === 'text') {
      const newId = crypto.randomUUID();
      const count = s.currentDesign.elements.length;
      const offset = count * 30;
      const el: DesignElement = {
        id: newId,
        type: 'text',
        x: 100 + (offset % 300),
        y: 80 + (offset % 200),
        width: 200,
        height: 60,
        rotation: 0,
        opacity: 100,
        color: '#111111',
        zIndex: s.currentDesign.elements.length,
        text: 'Votre texte',
        fontFamily: 'system-ui',
        fontSize: 24,
      };
      set({
        activeTool: 'text',
        activeTab: '2d',
        currentDesign: {
          ...s.currentDesign,
          elements: [...s.currentDesign.elements, el],
        },
        selectedElementId: newId,
      });
      setTimeout(() => get().pushHistory(), 0);
    } else if (tool === 'image') {
      set({ openDrawer: 'image', activeTool: 'image' });
    } else if (tool === 'motif') {
      set({ openDrawer: 'motif', activeTool: 'motif' });
    } else if (tool === 'collection') {
      set({ openDrawer: 'collection', activeTool: 'collection' });
    } else if (tool === 'aide') {
      get().startTour();
    }
  },

  addElement: (el) => {
    set((s) => ({
      currentDesign: {
        ...s.currentDesign,
        elements: [...s.currentDesign.elements, el],
      },
    }));
    get().pushHistory();
  },

  updateElement: (id, updates, saveHistory) => {
    set((s) => ({
      currentDesign: {
        ...s.currentDesign,
        elements: s.currentDesign.elements.map((el) =>
          el.id === id ? { ...el, ...updates } : el
        ),
      },
    }));
    if (saveHistory) {
      get().pushHistory();
    }
  },

  removeElement: (id) => {
    set((s) => ({
      currentDesign: {
        ...s.currentDesign,
        elements: s.currentDesign.elements.filter((el) => el.id !== id),
      },
      selectedElementId: s.selectedElementId === id ? null : s.selectedElementId,
    }));
    get().pushHistory();
  },

  moveElementLayer: (id, direction) => {
    set((s) => {
      const elements = [...s.currentDesign.elements];
      const idx = elements.findIndex((el) => el.id === id);
      if (idx === -1) return s;

      const sorted = elements.sort((a, b) => a.zIndex - b.zIndex);
      const sortedIdx = sorted.findIndex((el) => el.id === id);

      if (direction === 'top') {
        const maxZ = Math.max(...elements.map((e) => e.zIndex));
        sorted[sortedIdx].zIndex = maxZ + 1;
      } else if (direction === 'bottom') {
        const minZ = Math.min(...elements.map((e) => e.zIndex));
        sorted[sortedIdx].zIndex = minZ - 1;
      } else if (direction === 'up' && sortedIdx < sorted.length - 1) {
        const tmp = sorted[sortedIdx].zIndex;
        sorted[sortedIdx].zIndex = sorted[sortedIdx + 1].zIndex;
        sorted[sortedIdx + 1].zIndex = tmp;
      } else if (direction === 'down' && sortedIdx > 0) {
        const tmp = sorted[sortedIdx].zIndex;
        sorted[sortedIdx].zIndex = sorted[sortedIdx - 1].zIndex;
        sorted[sortedIdx - 1].zIndex = tmp;
      }

      return { currentDesign: { ...s.currentDesign, elements: sorted } };
    });
    get().pushHistory();
  },

  addToCart: (thumbnail?: string) => {
    set((s) => {
      const snapshot = JSON.parse(JSON.stringify(s.currentDesign));
      snapshot.thumbnail = thumbnail || undefined;
      const newDesign: Design = {
        ...defaultDesign,
        id: crypto.randomUUID(),
        name: `Design ${s.cart.length + 2}`,
      };
      return {
        cart: [...s.cart, snapshot],
        currentDesign: newDesign,
        selectedElementId: null,
      };
    });
  },

  removeFromCart: (id) => {
    set((s) => ({ cart: s.cart.filter((d) => d.id !== id) }));
  },

  editCartDesign: (id) => {
    set((s) => {
      const design = s.cart.find((d) => d.id === id);
      if (!design) return s;
      const currentSnapshot = JSON.parse(JSON.stringify(s.currentDesign));
      return {
        currentDesign: JSON.parse(JSON.stringify(design)),
        cart: s.cart.map((d) => (d.id === id ? currentSnapshot : d)),
      };
    });
  },

  updateCartDesignName: (id, name) => {
    set((s) => ({
      cart: s.cart.map((d) => (d.id === id ? { ...d, name } : d)),
    }));
  },

  updateCartDesignQuantity: (id, quantity) => {
    set((s) => ({
      cart: s.cart.map((d) => (d.id === id ? { ...d, quantity } : d)),
    }));
  },

  pushHistory: () => {
    set((s) => {
      const newHistory = s.history.slice(0, s.historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(s.currentDesign)));
      return { history: newHistory, historyIndex: newHistory.length - 1 };
    });
  },

  undo: () => {
    set((s) => {
      if (s.historyIndex <= 0) return s;
      const newIndex = s.historyIndex - 1;
      return {
        historyIndex: newIndex,
        currentDesign: JSON.parse(JSON.stringify(s.history[newIndex])),
      };
    });
  },

  redo: () => {
    set((s) => {
      if (s.historyIndex >= s.history.length - 1) return s;
      const newIndex = s.historyIndex + 1;
      return {
        historyIndex: newIndex,
        currentDesign: JSON.parse(JSON.stringify(s.history[newIndex])),
      };
    });
  },

  startTour: () => set({ showTour: true, tourStep: 0 }),
  nextTourStep: () =>
    set((s) => {
      if (s.tourStep >= 4) {
        localStorage.setItem('tourCompleted', 'true');
        return { showTour: false, tourCompleted: true };
      }
      return { tourStep: s.tourStep + 1 };
    }),
  prevTourStep: () => set((s) => ({ tourStep: Math.max(0, s.tourStep - 1) })),
  endTour: () => {
    localStorage.setItem('tourCompleted', 'true');
    set({ showTour: false, tourCompleted: true });
  },
}));
