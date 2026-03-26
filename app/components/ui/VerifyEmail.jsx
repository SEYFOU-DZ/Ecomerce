'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OtpInput from './OtpInput'; 
import { useAuth } from '@/app/providers/AuthProvider';
import { http } from '@/lib/http';
import { BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';

export default function VerifyEmail({ email }) {
  
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [count, setCount] = useState(30);
  const [dots, setDots] = useState('Verify');
  const router = useRouter();
  const {refreshUser} = useAuth();


useEffect(()=>{
  let timer;
  if(resendDisabled){
    timer = setInterval(()=>{
      if(count > 0){
        setCount(count - 1)
      }else{
        setResendDisabled(false);
        clearInterval(timer)
      }
    },1000)      
  }
  return ()=> clearInterval(timer)
},[count,resendDisabled])


  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    try {
      setDots("Verify...")
      const res = await http.post(`api/auth/verifyEmail`, { email, otp });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        
        if (data?.token) {
          // Set cookie for Next.js middleware to read cross-domain tokens
          document.cookie = `token=${data.token}; path=/; max-age=2592000; SameSite=Lax`;
        }

        const fetchedUser = await refreshUser();
        if (fetchedUser?.isAdmin) {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      } else {
        const data = await res.json();
        setError(data.message || data.massage || "Invalid OTP or expired");
      }
    } catch {
      setError("Server error, please try again");
    }
      setDots("Verify")    
  };

  const resendOtp = async () => {
    setError('');
    setMessage('');
    setResendDisabled(true);
    setCount(30);
    try {
      const res = await http.post(`api/auth/resendOtp`, { email });

      if (res.ok) {
        setMessage("A new OTP has been sent to your email.");
      } else {
        const data = await res.json();
        setError(data.message || data.massage || "Failed to resend OTP");
      }
    } catch {
      setError("Server error, please try again");
    }
  };

  return (
      <form 
        onSubmit={handleVerify} 
        className="w-full max-w-md bg-white py-6 px-4 rounded-lg shadow-lg text-center">
        
        <OtpInput length={6} onChange={setOtp} />

        <button type="submit" className="btn mt-6"> {dots}
        </button>

        <button
          type="button"
          onClick={resendOtp}
          disabled={resendDisabled}
          className={`w-full py-2 mt-4 font-semibold rounded-md shadow-md 
            ${resendDisabled 
              ? "bg-gray-300 text-gray-600 cursor-not-allowed" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"} transition-all`}
        >
          {resendDisabled ? `Wait before retry ${count}` : "Resend Code"}
        </button>

        {/* Error / Success Messages */}
        {error && (
          <div
            className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-rose-200/90 bg-rose-50/90 px-4 py-5 text-center shadow-sm"
            role="alert"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md ring-4 ring-rose-100">
              <BsXCircleFill className="text-2xl text-rose-500" aria-hidden />
            </span>
            <p className="text-sm font-medium text-rose-900 leading-relaxed max-w-xs">
              {error}
            </p>
          </div>
        )}
        {message && (
          <div
            className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-emerald-200/90 bg-emerald-50/90 px-4 py-5 text-center shadow-sm"
            role="status"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md ring-4 ring-emerald-100">
              <BsCheckCircleFill className="text-2xl text-emerald-600" aria-hidden />
            </span>
            <p className="text-sm font-medium text-emerald-900 leading-relaxed max-w-xs">
              {message}
            </p>
          </div>
        )}
      </form>
  );
}