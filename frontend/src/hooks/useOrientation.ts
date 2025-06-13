import { useState, useEffect } from 'react';

type Orientation = 'portrait' | 'landscape';

export const useOrientation = () => {
  const [orientation, setOrientation] = useState<Orientation>(
    window.screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape'
      );
    };

    // Add event listeners
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    // Initial check
    handleOrientationChange();

    // Cleanup
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return orientation;
}; 