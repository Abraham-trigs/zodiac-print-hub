import { useEffect, RefObject } from "react";

export function useZodiacEntrance(
  ref: RefObject<HTMLInputElement | HTMLTextAreaElement | null>,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const id = requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange?.(el.value.length, el.value.length);
    });

    return () => cancelAnimationFrame(id);
  }, [ref]);
}
