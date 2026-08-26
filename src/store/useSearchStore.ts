import { create } from "zustand";

interface SearchState {
  isOpen: boolean;
  query: string;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  setQuery: (query: string) => void;
  clearQuery: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  query: "",
  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false }),
  toggleSearch: () => set((state) => ({ isOpen: !state.isOpen })),
  setQuery: (query: string) => set({ query }),
  clearQuery: () => set({ query: "" }),
}));
