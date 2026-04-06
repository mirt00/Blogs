import { useEffect, useRef } from 'react';

export default function ReadingProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      if (barRef.current) {
        barRef.current.style.width = `${Math.min(progress, 100)}%`;
      }
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-bg-border z-50">
      <div
        ref={barRef}
        className="h-full bg-accent transition-all duration-100 ease-out"
        style={{ width: '0%' }}
      />
    </div>
  );
}
