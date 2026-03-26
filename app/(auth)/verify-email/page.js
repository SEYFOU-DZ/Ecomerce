import AuthHeader from "@/app/components/ui/AuthHeader";
import VerifyEmail from "@/app/components/ui/VerifyEmail";
export default function VerifyEmailPage({ searchParams }) {
  const title = "Verify Your Email";
  const text = "We sent a 6-digit code to ";    
  const email = searchParams.email || "";
  
  
  return (
    <div className="flex flex-col items-center gap-6"> 
      {/* Header */}
      
        <AuthHeader title={title} text={text} email={email}/>
      

      {/* Form */}
      <div> 
        <VerifyEmail email={email} />
      </div>
    </div>
  );
}