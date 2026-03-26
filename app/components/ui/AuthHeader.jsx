import BrandMark from "@/app/components/ui/BrandMark";

const AuthHeader = ({ title, text, email }) => {
  return (
    <div className="w-full flex flex-row justify-start gap-4 md:gap-8 pt-2 items-start">
      <div className="flex-shrink-0 pt-1">
        <BrandMark size="md" showTitle={false} />
      </div>
      <div className="pt-4 min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary">
          {title}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base mt-1">
          {text} {email && <span className="font-medium text-stone-800">{email}</span>}
        </p>
      </div>
    </div>
  );
};
export default AuthHeader;
