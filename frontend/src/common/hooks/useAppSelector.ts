import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../storage";

// dùng thay cho useDispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();

// dùng thay cho useSelector
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
