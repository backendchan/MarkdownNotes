import type { ReactNode } from 'react';
import './styles.module.css';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return <div className="layout">{children}</div>;
};
