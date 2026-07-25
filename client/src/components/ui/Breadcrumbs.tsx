import { Link, useLocation } from 'react-router-dom';

interface Crumb {
  label: string;
  path?: string;
}

export default function Breadcrumbs({ items = [] }: { items?: Crumb[] }) {
  const location = useLocation();

  // Auto-generate from path if no items provided
  const crumbs = items.length > 0 ? items : location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment, i, arr) => {
      const path = '/' + arr.slice(0, i + 1).join('/');
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      return { label, path: i < arr.length - 1 ? path : undefined };
    });

  if (crumbs.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-[12px] font-light text-gray-400 mb-6">
      <Link to="/" className="hover:text-charcoal transition-colors">Accueil</Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-2">
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {crumb.path ? (
            <Link to={crumb.path} className="hover:text-charcoal transition-colors">{crumb.label}</Link>
          ) : (
            <span className="text-charcoal font-normal">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
