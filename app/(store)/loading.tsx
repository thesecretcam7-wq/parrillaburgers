export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-[#0F1117] flex flex-col items-center px-6 pt-8 pb-24">

      {/* Logo skeleton */}
      <div className="w-56 h-48 bg-[#1A1B21] rounded-2xl animate-pulse mb-4" />

      {/* Banner skeleton */}
      <div className="w-full max-w-xs h-44 bg-[#1A1B21] rounded-2xl animate-pulse mb-4" />

      {/* Barra libre skeleton */}
      <div className="w-full max-w-xs h-14 bg-[#1A1B21] rounded-2xl animate-pulse mb-6" />

      {/* Badges skeleton */}
      <div className="flex gap-2 mb-8">
        {[80, 72, 96].map((w, i) => (
          <div
            key={i}
            className="h-7 bg-[#1A1B21] rounded-full animate-pulse"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Botón skeleton */}
      <div className="w-full max-w-xs h-14 bg-[#1A1B21] rounded-2xl animate-pulse" />
    </main>
  );
}
