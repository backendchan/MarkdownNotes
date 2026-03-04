import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './styles.module.css';

interface ResizablePanelProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidth: number;
  onLeftWidthChange: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
}

export const ResizablePanel = ({
  left,
  right,
  leftWidth,
  onLeftWidthChange,
  minWidth = 200,
  maxWidth = 600,
  className,
}: ResizablePanelProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

      onLeftWidthChange(clampedWidth);
    },
    [isDragging, minWidth, maxWidth, onLeftWidthChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className={`${styles.container} ${className || ''}`}>
      <div className={styles.left} style={{ width: leftWidth }}>
        {left}
      </div>
      <div
        className={`${styles.resizer} ${isDragging ? styles.dragging : ''}`}
        onMouseDown={handleMouseDown}
      />
      <div className={styles.right}>{right}</div>
    </div>
  );
};
