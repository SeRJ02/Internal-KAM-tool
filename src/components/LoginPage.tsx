import React, { useState } from 'react';
import { Eye, EyeOff, Shield, Users, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LoginPageProps {
  onLogin: (userData: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { signIn, signUp } = useAuth();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  
  // Sign In Form State
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  
  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    name: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await signIn(credentials.email, credentials.password);
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        onLogin(data.user);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🎯 Sign-up form submitted');
    setIsLoading(true);
    setError('');

    // Client-side validation
    if (signUpData.password !== signUpData.confirmPassword) {
      console.warn('⚠️ Password mismatch validation failed');
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (signUpData.password.length < 6) {
      console.warn('⚠️ Password length validation failed');
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    console.log('✅ Client-side validation passed');

    try {
      console.log('🔄 Calling signUp hook...');
      const { data, error } = await signUp(
        signUpData.email,
        signUpData.password,
        {
          username: signUpData.username,
          name: signUpData.name,
          role: 'employee',
          poc: signUpData.name
        }
      );
      
      if (error) {
        console.error('❌ Sign-up failed with error:', error);
        setError(error.message);
      } else if (data.user) {
        console.log('✅ Sign-up successful, calling onLogin');
        onLogin(data.user);
      }
    } catch (err) {
      console.error('❌ Unexpected error during sign-up:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      console.log('🏁 Sign-up process finished, setting loading to false');
      setIsLoading(false);
    }
  };
  const handleSignInInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSignUpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setError('');
    setCredentials({ email: '', password: '' });
    setSignUpData({ email: '', password: '', confirmPassword: '', username: '', name: '' });
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full overflow-hidden flex items-center justify-center shadow-lg bg-white border border-gray-200">
            <img 
              src="/channels4_profile.jpg" 
              alt="Company Logo" 
              className="h-full w-full object-cover"
            />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Key Account Management
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUpMode ? 'Create your account' : 'Sign in to access the dashboard'}
          </p>
        </div>

        {/* Forms */}
        <form className="mt-8 space-y-6" onSubmit={isSignUpMode ? handleSignUp : handleSignIn}>
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            {/* Mode Toggle */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {isSignUpMode ? 'Create Account' : 'Sign In'}
              </h3>
              {isSignUpMode && (
                <button
                  type="button"
                  onClick={toggleMode}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Sign In
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {isSignUpMode ? 'Sign Up Failed' : 'Authentication Failed'}
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isSignUpMode ? (
              /* Sign Up Form */
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882] focus:z-10 transition-all duration-200"
                      placeholder="Enter your full name"
                      value={signUpData.name}
                      onChange={handleSignUpInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Username *
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882] focus:z-10 transition-all duration-200"
                      placeholder="Choose a username"
                      value={signUpData.username}
                      onChange={handleSignUpInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882] focus:z-10 transition-all duration-200"
                    placeholder="Enter your email address"
                    value={signUpData.email}
                    onChange={handleSignUpInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882] focus:z-10 transition-all duration-200"
                        placeholder="Create password"
                        value={signUpData.password}
                        onChange={handleSignUpInputChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882] focus:z-10 transition-all duration-200"
                        placeholder="Confirm password"
                        value={signUpData.confirmPassword}
                        onChange={handleSignUpInputChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Sign In Form */
              <>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882] focus:z-10 transition-all duration-200"
                placeholder="Enter your email address"
                value={credentials.email}
                onChange={handleSignInInputChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882] focus:z-10 transition-all duration-200"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleSignInInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#9CE882] to-[#82E89C] hover:from-[#8BD871] hover:to-[#71D78B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9CE882] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isSignUpMode ? 'Creating account...' : 'Signing in...'}
                </div>
              ) : (
                <div className="flex items-center">
                  {isSignUpMode ? (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Account
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Sign in
                    </>
                  )}
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Toggle and Instructions */}
        <div className="text-center">
          {!isSignUpMode && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={toggleMode}
                  className="font-medium text-[#9CE882] hover:text-[#8BD871] transition-colors duration-200"
                >
                  Sign up here
                </button>
              </p>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-blue-800 mb-3">
              {isSignUpMode ? 'Account Information' : 'Demo Accounts'}
            </h4>
            
            {isSignUpMode ? (
              <div className="bg-white rounded p-3 border border-blue-100">
                <p className="text-xs text-blue-700">
                  New accounts are created as POC (Point of Contact) users with employee role. 
                  Your name will be used as your POC identifier for managing assigned accounts.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded p-3 border border-blue-100">
                  <p className="text-xs font-medium text-blue-800 mb-1">Admin Account (Full Access)</p>
                </div>
                <div className="bg-white rounded p-3 border border-blue-100">
                  <p className="text-xs text-blue-700">
                    Sign in with your account credentials or create a new POC account above.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;