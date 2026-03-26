export default function AuthLoading() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 px-4 py-10 animate-pulse">
      <div className="h-16 w-16 rounded-2xl bg-stone-200/80" />
      <div className="h-6 w-48 rounded-md bg-stone-200/70" />
      <div className="h-4 w-full max-w-sm rounded-md bg-stone-200/60" />
      <div className="mt-4 h-40 w-full max-w-md rounded-xl bg-stone-200/50" />
    </div>
  );
}
