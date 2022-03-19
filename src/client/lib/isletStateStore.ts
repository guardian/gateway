import create from 'zustand/vanilla';

/**
 * @name IsletState
 * @description Add properties to this interface to share between Islet components.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IsletState {}

/**
 * @name IsletStateStore
 * @description Generic store state used to set state, use IsletState for properties
 */
interface IsletStateStore {
  isletState: IsletState;
  setIsletState: (isletState: IsletState) => void;
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
export const isletStateStore = create<IsletStateStore>((set) => ({
  isletState: {},
  setIsletState: (newIsletState) =>
    set((state) => ({ isletState: { ...state.isletState, ...newIsletState } })),
}));
