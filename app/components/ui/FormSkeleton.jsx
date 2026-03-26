export default function FormSkeleton() {
  return (
    <div className="max-w-md w-full bg-white p-6 mx-2 rounded-lg shadow-lg animate-pulse">
      <div className="mx-auto h-8 bg-gray-300 rounded w-1/2 mb-6"></div>

      <div className="w-full flex items-center h-10 bg-gray-200 rounded mb-4"></div>
      <div className="flex items-center h-10 bg-gray-200 rounded mb-4"></div>

      <div className="h-10 bg-gray-300 rounded mb-4"></div>

      <div className="flex items-center my-3 w-full">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-4 text-gray-400">or</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <div className="h-10 bg-gray-200 rounded mb-4"></div>

      <div className="mt-6 h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
    </div>
  );
}