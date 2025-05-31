import React from 'react';
import { Container, ContainerProps } from '@mui/material';

interface PageContainerProps extends ContainerProps {
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, ...props }) => {
  return (
    <Container
      {...props}
      sx={{
        maxWidth: 'xl',
        pl: 0, // Sin padding izquierdo
        pr: 1, // Mantener padding derecho
        py: 0.5, // Padding vertical reducido
        ...props.sx,
      }}
    >
      {children}
    </Container>
  );
};
