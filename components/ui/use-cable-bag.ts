"use client";

import { useCallback, useMemo, useState } from "react";
import { catalogById, type CatalogCable } from "@/game/content/cable-catalog";

/**
 * Cable-prep bag state, kept apart from the lobby's presentation.
 * Quantities are whole numbers ≥ 1; an entry that drops to 0 is removed, so `bag` never holds stale zero rows.
 */
export function useCableBag() {
  const [bag, setBag] = useState<Record<string, number>>({});

  const add = useCallback((c: CatalogCable, n = 1) => {
    const k = Math.max(1, Math.floor(n));
    setBag((prev) => ({ ...prev, [c.id]: (prev[c.id] ?? 0) + k }));
  }, []);

  const remove = useCallback((c: CatalogCable) => {
    setBag((prev) => {
      const n = prev[c.id] ?? 0;
      if (n <= 0) return prev;
      const next = { ...prev };
      if (n === 1) delete next[c.id];
      else next[c.id] = n - 1;
      return next;
    });
  }, []);

  const clear = useCallback(() => setBag({}), []);

  const entries = useMemo(
    () => Object.entries(bag).flatMap(([id, n]) => {
      const c = catalogById(id);
      return c && n > 0 ? [{ c, n }] : [];
    }),
    [bag],
  );
  const total = useMemo(() => entries.reduce((a, e) => a + e.n, 0), [entries]);

  return { bag, entries, total, kinds: entries.length, add, remove, clear, count: (id: string) => bag[id] ?? 0 };
}
