export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-gray-100 rounded-2xl mb-4" />
      <div className="px-0.5 space-y-2">
        <div className="h-2.5 w-16 bg-gray-100 rounded-full" />
        <div className="h-3.5 w-3/4 bg-gray-100 rounded-full" />
        <div className="h-3 w-12 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-7">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12 animate-pulse">
      <div className="h-4 w-24 bg-gray-100 rounded-full mb-3" />
      <div className="h-8 w-64 bg-gray-100 rounded-full mb-10" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-7">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-[3/4] bg-gray-100 rounded-2xl" />
        <div className="space-y-5">
          <div className="h-3 w-20 bg-gray-100 rounded-full" />
          <div className="h-8 w-3/4 bg-gray-100 rounded-full" />
          <div className="h-6 w-24 bg-gray-100 rounded-full" />
          <div className="space-y-2">
            <div className="h-3.5 w-full bg-gray-100 rounded-full" />
            <div className="h-3.5 w-5/6 bg-gray-100 rounded-full" />
            <div className="h-3.5 w-4/6 bg-gray-100 rounded-full" />
          </div>
          <div className="flex gap-2 mt-6">
            {[1,2,3,4].map(i => <div key={i} className="w-12 h-10 bg-gray-100 rounded-lg" />)}
          </div>
          <div className="h-12 w-full bg-gray-100 rounded-full mt-8" />
        </div>
      </div>
    </div>
  );
}
