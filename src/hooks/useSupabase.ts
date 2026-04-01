import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useSupabaseStorage<T>(
  table: string,
  localStorageKey: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [data, setDataState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(localStorageKey);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const skipNextSync = useRef(false);

  // Fetch from Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let cancelled = false;

    async function fetchData() {
      try {
        const { data: rows, error } = await supabase
          .from(table)
          .select('id, data');

        if (error) throw error;

        if (!cancelled && rows && rows.length > 0) {
          // If T is an array, rebuild it from rows
          if (Array.isArray(initialValue)) {
            const items = rows.map((row: { id: string; data: unknown }) => row.data) as T;
            skipNextSync.current = true;
            setDataState(items);
            window.localStorage.setItem(localStorageKey, JSON.stringify(items));
          } else {
            // Single object stored as one row
            const item = rows[0].data as T;
            skipNextSync.current = true;
            setDataState(item);
            window.localStorage.setItem(localStorageKey, JSON.stringify(item));
          }
        }
      } catch (err) {
        console.warn(`[useSupabase] Failed to fetch from "${table}", using localStorage fallback:`, err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [table]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync to Supabase whenever data changes
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    if (loading) return;

    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }

    async function syncData() {
      try {
        if (Array.isArray(data)) {
          // Each item is a row; expects items to have an `id` field
          const rows = (data as Array<Record<string, unknown>>).map((item) => ({
            id: item.id || String(item),
            data: item,
            updated_at: new Date().toISOString(),
          }));

          if (rows.length > 0) {
            const { error } = await supabase
              .from(table)
              .upsert(rows, { onConflict: 'id' });
            if (error) throw error;
          }

          // Remove rows that no longer exist locally
          const currentIds = rows.map((r) => r.id);
          const { data: existing } = await supabase.from(table).select('id');
          if (existing) {
            const toDelete = existing
              .map((r: { id: string }) => r.id)
              .filter((id: string) => !currentIds.includes(id));
            if (toDelete.length > 0) {
              await supabase.from(table).delete().in('id', toDelete);
            }
          }
        } else {
          // Single object — store as one row with a fixed id
          const { error } = await supabase
            .from(table)
            .upsert(
              { id: '_singleton', data, updated_at: new Date().toISOString() },
              { onConflict: 'id' }
            );
          if (error) throw error;
        }
      } catch (err) {
        console.warn(`[useSupabase] Failed to sync to "${table}":`, err);
      }
    }

    syncData();
  }, [data, table, loading]);

  // Always keep localStorage in sync as fallback
  useEffect(() => {
    try {
      window.localStorage.setItem(localStorageKey, JSON.stringify(data));
    } catch {
      // silently fail
    }
  }, [localStorageKey, data]);

  const setData = useCallback(
    (value: T | ((prev: T) => T)) => {
      setDataState((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        return next;
      });
    },
    []
  );

  return [data, setData, loading];
}
