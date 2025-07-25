import { create } from 'zustand';

const useFugaStore = create((set, get) => ({
  fugaActiva: false,
  
  activarFuga: () => {
    set({ fugaActiva: true });
    window.fugaGlobal = { activa: true };
    console.log('🔴 Fuga activada:', window.fugaGlobal);
  },
  
  desactivarFuga: () => {
    set({ fugaActiva: false });
    window.fugaGlobal = { activa: false };
    console.log('🟢 Fuga desactivada:', window.fugaGlobal);
  },
  
  toggleFuga: () => {
    const { fugaActiva, activarFuga, desactivarFuga } = get();
    if (fugaActiva) {
      desactivarFuga();
    } else {
      activarFuga();
    }
  }
}));

// Inicializar estado global
window.fugaGlobal = { activa: false };

export default useFugaStore;