import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';
import { User } from '../types';

interface UseAuth {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAdminBarber: boolean;
  isBarber: boolean;
}

export const useAuth = (): UseAuth => {
  const user = useAppSelector(selectUser);
  const userRole = user?.role?.toUpperCase();

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: userRole === 'ADMIN',
    isAdminBarber: userRole === 'ADMINBARBER',
    isBarber: userRole === 'BARBER',
  };
};
