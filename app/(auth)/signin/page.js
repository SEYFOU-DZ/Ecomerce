import SigninForm from "@/app/components/ui/SigninForm";
import AuthHeader from "@/app/components/ui/AuthHeader";

export default function Signin() {
  const title = "Welcome Back !";
  const text = "Please sign in to continue and access your account.";
  return (

    <div className="flex flex-col items-center gap-6"> 
      {/* Header */}
      
        <AuthHeader title={title} text={text} />
      

      {/* Form */}
      <div className="w-full flex justify-center">
        <SigninForm />
      </div>
      
      {/* Footer text */}
      <div className="text-center max-w-md">
        <p className="text-gray-500 text-sm md:text-base">
          By signing in, you agree to our{" "}
          <span className="text-primary font-medium cursor-pointer hover:underline">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-primary font-medium cursor-pointer hover:underline">
            Privacy Policy
          </span>.
        </p>
      </div>
    </div>
  );
}