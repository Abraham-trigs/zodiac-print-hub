import { useAppBootStore } from "@store/useAppBootStore";

export function useHydratedGuard() {
  return useAppBootStore((s) => s.isHydrated);
}
