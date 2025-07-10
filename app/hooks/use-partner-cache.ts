import create from 'zustand'

interface PartnerCardCacheState {
  cards: any[]
  lastFetched: number | null
  setCards: (cards: any[]) => void
  clearCache: () => void
}

export const usePartnerCardCache = create<PartnerCardCacheState>((set) => ({
  cards: [],
  lastFetched: null,
  setCards: (cards) => set({ cards, lastFetched: Date.now() }),
  clearCache: () => set({ cards: [], lastFetched: null }),
})) 