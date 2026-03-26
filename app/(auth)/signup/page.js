import SignupForm from "@/app/components/ui/SignupForm";
import AuthHeader from "@/app/components/ui/AuthHeader";

export default function Signup() {
  
const title = "Create an Account";
const text = "Join us today! Please fill in your details to sign up.";  
  return (
    <div className="flex flex-col items-center gap-6"> 
      {/* Header */}
      
        <AuthHeader title={title} text={text} />

      {/* Form */}
      <div className="w-full flex justify-center">
        <SignupForm />
      </div>

      {/* Footer text */}
      <div className="text-center max-w-md">
        <p className="text-gray-500 text-sm md:text-base">
          By signing up, you agree to our{" "}
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