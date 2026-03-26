'use client';
import '@/app/globals.css'; 
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaIdCard, FaEnvelope, FaLock } from "react-icons/fa";
import { http } from '@/lib/http';

const SignupForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [dots, setDots]           = useState('Sign Up');

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if(!firstName || !lastName || !email || !password) {
      setError("All failds are required");
      return;
    }
    try {
      setDots("Sign Up...");      
      const res = await http.post(`api/auth/register`, { firstName, lastName, email, password });
      if (res.ok) {
        router.push(`/verify-email?email=${email}`)
      } else {
        const data = await res.json();
        setError(data.message || data.massage || "Registration failed. Retry again.");
      }
    } catch (err) {
      setError("Server error");
    }
    setDots("Sign Up");
  };


  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white p-6 sm:p-7 rounded-xl shadow-sm border border-stone-200/70"
    >
      <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center text-gray-700">
        Sign Up
      </h2>

      <div className="inpDiv">
        <FaUser className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full text-gray-800 focus:outline-none"
        />
      </div>

      <div className="inpDiv">
        <FaIdCard className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full text-gray-800 focus:outline-none"
        />
      </div>

      <div className="inpDiv">
        <FaEnvelope className="text-gray-400 mr-2" />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full text-gray-800 focus:outline-none"
        />
      </div>

      <div className="inpDiv">
        <FaLock className="text-gray-400 mr-2" />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full text-gray-800 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="btn">
        {dots}
      </button>

      {error && (
        <div className="errMessage">
          <span className="sm:inline">{error}</span>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href={"/signin"} prefetch className="text-primary font-medium hover:underline">
          Sign in here
        </Link>
      </div>
    </form>
  );
};

export default SignupForm;
