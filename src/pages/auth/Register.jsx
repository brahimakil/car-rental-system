import React from 'react';
import AuthLayout from '@/layouts/AuthLayout';
import RegisterForm from '@/components/auth/RegisterForm';

const Register = () => {
  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Car Rental System</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Admin Dashboard</p>
      </div>
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
