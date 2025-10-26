import { useDispatch, useSelector } from 'react-redux';

// Dùng trong toàn bộ ứng dụng thay cho useDispatch và useSelector gốc
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
