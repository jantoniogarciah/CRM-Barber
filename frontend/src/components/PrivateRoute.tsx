import React, { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';

export const PrivateRoute = ({ children }: PropsWithChildren<{}>): JSX.Element => {
  const user = useAppSelector(selectUser);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};
