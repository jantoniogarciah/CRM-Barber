import { useState, useEffect } from 'react';

type Orientation = 'portrait' | 'landscape';

const getOrientation = (): Orientation => {
  if (window.screen.orientation) {
    return window.screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape';
  }
  
  // Fallback for older browsers and PWA
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
};

export const useOrientation = () => {
  const [orientation, setOrientation] = useState<Orientation>(getOrientation());

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(getOrientation());
    };

    // Add multiple event listeners for better compatibility
    if (window.screen.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    }
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    // Initial check
    handleOrientationChange();

    // Cleanup
    return () => {
      if (window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      }
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return orientation;
}; 