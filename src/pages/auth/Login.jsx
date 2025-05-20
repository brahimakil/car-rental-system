import React from 'react';
import AuthLayout from '@/layouts/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

const Login = () => {
  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Car Rental System</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Admin Dashboard</p>
      </div>
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
