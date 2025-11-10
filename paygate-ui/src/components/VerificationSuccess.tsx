import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const VerificationSuccess: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-indigo-600 text-white font-bold text-2xl w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
              PG
            </div>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">PayGate</h1>
          <h2 className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Account Verification
          </h2>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10 dark:bg-gray-800">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Verification Email Sent!</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              We've sent a verification link to <span className="font-semibold">{user?.email}</span>. Please check your email and click the link to verify your account.
            </p>
          </div>

          <div className="mt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Didn't receive the email? Check your spam folder or{' '}
              <button 
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                onClick={() => {
                  // Resend verification email logic would go here
                  alert('Verification email resent!');
                }}
              >
                resend
              </button>
            </p>
          </div>

          <div className="mt-6">
            <Link
              to="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationSuccess;