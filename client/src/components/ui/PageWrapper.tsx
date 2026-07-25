import { useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

export default function PageWrapper({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
