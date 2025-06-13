declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PUBLIC_URL: string;
    REACT_APP_API_URL?: string;
    REACT_APP_SOCKET_URL?: string;
    [key: string]: string | undefined;
  }
}

// Declare global variables
declare const process: {
  env: {
    NODE_ENV: 'development' | 'production' | 'test';
    PUBLIC_URL: string;
    REACT_APP_API_URL?: string;
    REACT_APP_SOCKET_URL?: string;
    [key: string]: string | undefined;
  }
}; 