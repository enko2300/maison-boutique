import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  icon?: 'cart' | 'heart' | 'check' | 'error';
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, icon?: Toast['icon']) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (message, icon = 'check') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    set({ toasts: [...get().toasts, { id, message, icon }] });
    setTimeout(() => {
      set({ toasts: get().toasts.filter(t => t.id !== id) });
    }, 2500);
  },
  remove: (id) => set({ toasts: get().toasts.filter(t => t.id !== id) }),
}));

const icons: Record<string, React.JSX.Element> = {
  cart: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  heart: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

export function ToastContainer() {
  const { toasts, remove } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((toast, i) => (
        <div
          key={toast.id}
          onClick={() => remove(toast.id)}
          className="flex items-center gap-3 bg-charcoal text-white pl-4 pr-5 py-3 rounded-xl shadow-2xl cursor-pointer"
          style={{
            animation: 'toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            animationDelay: `${i * 50}ms`,
            opacity: 0,
          }}
        >
          <span className="text-champagne">{icons[toast.icon || 'check']}</span>
          <span className="text-[13px] font-light">{toast.message}</span>
        </div>
      ))}

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
