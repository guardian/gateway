import create from 'zustand/vanilla';

/**
 * @name IsletState
 * @description Add properties to this interface to share between Islet components.
 */
interface IsletState {
  setIsletState: (state: Partial<IsletState>) => void;
}

/**
 * @name isletStateStore
 * @description Zustand store for the islet state. Use to share a state between Islet components.
 *
 * Use this in vanilla/pure js Islets to share state.
 *
 * Zustand recommends using one store, and then splitting store into various functions to be manageable: https://github.com/pmndrs/zustand/wiki/Splitting-the-store-into-separate-slices
 *
 * You probably want to use the hook [`useIsletStateStore`](./hooks/useIsletStateStore.ts) for React Islet components.
 */
export const isletStateStore = create<IsletState>((set) => ({
  setIsletState: (isletState) => set((state) => ({ ...state, ...isletState })),
}));
