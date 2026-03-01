// ============================================
// CUSTOM HOOKS - Typed versions of useDispatch & useSelector
// ============================================
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { AppDispatch, AppState } from "@/store";

// Use these instead of plain `useDispatch` and `useSelector` for type safety
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
