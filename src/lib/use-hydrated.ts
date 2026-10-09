"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` no servidor e na hidratação, `true` depois. Evita mismatch com o carrinho
 * persistido em localStorage sem usar setState dentro de useEffect.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
