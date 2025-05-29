import React, { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';

export const AdminRoute = ({ children }: PropsWithChildren<{}>): JSX.Element => {
  const user = useAppSelector(selectUser);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};
