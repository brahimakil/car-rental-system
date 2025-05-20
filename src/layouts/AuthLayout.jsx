import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthLayout = ({ children }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard');
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
