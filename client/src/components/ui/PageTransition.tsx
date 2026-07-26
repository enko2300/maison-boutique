import type { ReactNode } from 'react';

export default function PageTransition({ children, pathname }: { children: ReactNode; pathname: string }) {
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
