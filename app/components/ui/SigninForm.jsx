'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useAuth } from '@/app/providers/AuthProvider';
import { http } from '@/lib/http';

const SigninForm = () =>{
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [dots, setDots] = useState('Sign In')
  
  const {refreshUser} = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if(!email || !password) {
      setError("All failds are required");
      return;
    }   
    try {
      setDots("Sign In...");
      const res = await http.post(`api/auth/login`, { email, password });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        
        if (data?.token) {
          // Set cookie for Next.js middleware to read cross-domain tokens
          document.cookie = `token=${data.token}; path=/; max-age=2592000; SameSite=Lax`;
        }

        const fetchedUser = await refreshUser();
        const isAdmin = Boolean(fetchedUser?.isAdmin ?? data?.user?.isAdmin);
        if (isAdmin) {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      } else if (res.status === 403) {
        router.push(`/verify-email?email=${email}`);
      } else {
        const data = await res.json();
        setError(data.message || data.massage || "Wrong email or password");  
      }
    } catch (err) {
      console.log(err)
      setError("Server error");
    }
    setDots("Sign In");
  };  
return (
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 sm:p-7 rounded-xl shadow-sm border border-stone-200/70"
      >
        <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center text-gray-700">
          Sign In
        </h2>

         <div className="inpDiv">
          <FaEnvelope className="text-gray-400 mr-2" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-gray-800 focus:outline-none" />
          </div>

          <div className="inpDiv">
           <FaLock className="text-gray-400 mr-2" />
           <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-gray-800 focus:outline-none" />
          </div>

          <button
            type="submit"
            className="btn" >
            {dots}
          </button>

          {error && (
            <div className="errMessage">
              <span className="sm:inline">{error}</span>
            </div>
          )}

        <div className="mt-8 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href={"/signup"} prefetch className="text-primary font-medium hover:underline">
            Sign up here
          </Link>
        </div>
        </form>
  );
}

export default SigninForm;
