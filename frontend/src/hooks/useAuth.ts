import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';
import { User } from '../types';

interface UseAuth {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const useAuth = (): UseAuth => {
  const user = useAppSelector(selectUser);

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };
};
