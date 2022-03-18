import create from 'zustand';
import { isletStateStore } from '@/client/lib/isletStateStore';

/**
 * @name useIsletStateStore
 * @description React hook for the islet state store. Use to share a state between Islet components.
 */
export const useIsletStateStore = create(isletStateStore);
