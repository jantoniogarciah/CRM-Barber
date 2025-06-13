import 'react-router-dom';
import { RouteProps as DefaultRouteProps } from 'react-router-dom';

declare module 'react-router-dom' {
  export interface RouteProps extends Omit<DefaultRouteProps, 'element'> {
    caseSensitive?: boolean;
    children?: React.ReactNode;
    element?: React.ReactNode | null;
    index?: boolean;
    path?: string;
  }

  export interface StaticRouterProps {
    basename?: string;
    children?: React.ReactNode;
    location?: Partial<Location> | string;
  }

  export interface SwitchProps {
    children?: React.ReactNode;
    location?: Location;
  }

  export interface match<Params extends { [K in keyof Params]?: string } = {}> {
    params: Params;
    isExact: boolean;
    path: string;
    url: string;
  }
} 