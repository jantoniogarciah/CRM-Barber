declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    REACT_APP_API_URL?: string;
    REACT_APP_SOCKET_URL?: string;
  }
}

// Declare global variables
declare const process: {
  env: {
    NODE_ENV: 'development' | 'production' | 'test';
    REACT_APP_API_URL?: string;
    REACT_APP_SOCKET_URL?: string;
  }
}; 