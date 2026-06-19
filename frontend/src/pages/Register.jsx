import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register, token } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
      isValid = false;
    }

    if (!email.trim()) {
      errors.email = 'Email address is required';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(fullName.trim(), email.trim(), password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      // Handle array validation responses or standard backend errors (e.g. 400, 409 conflicts)
      if (Array.isArray(err)) {
        const mappedErrors = {};
        err.forEach(errorObj => {
          mappedErrors[errorObj.field] = errorObj.message;
        });
        setFieldErrors(mappedErrors);
      } else {
        setError(typeof err === 'string' ? err : 'Registration failed. Please check details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-100 via-slate-50 to-blue-50/50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 shadow-md shadow-blue-500/20 p-2">
            <img src="/favicon.svg" alt="ProjectFlow Logo" className="w-8 h-8" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">ProjectFlow Workspace</h2>
          <p className="mt-1 text-slate-500 text-sm">Create a secure profile for your company dashboard</p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-150/40">
          {success ? (
            <div className="flex flex-col items-center py-6 text-center space-y-4">
              <CheckCircle2 size={56} className="text-emerald-500 animate-bounce" />
              <h3 className="text-xl font-bold text-slate-900">Workspace Registered!</h3>
              <p className="text-slate-500 text-sm">Your credentials have been successfully updated. Redirecting you to sign in...</p>
              <div className="w-12 h-1.5 bg-blue-500 rounded-full animate-pulse mt-2"></div>
            </div>
          ) : (
            <>
              {/* Backend Error Banner */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-2.5 animate-fadeIn">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name Input */}
                <div>
                  <label className="block text-slate-700 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="fullName">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User size={18} />
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (fieldErrors.fullName) {
                          setFieldErrors(prev => ({ ...prev, fullName: null }));
                        }
                      }}
                      className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                        fieldErrors.fullName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-150 text-sm`}
                      placeholder="Jane Doe"
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <p className="mt-1.5 text-red-650 text-xs font-medium flex items-center space-x-1">
                      <span className="w-1 h-1 rounded-full bg-red-500 inline-block mr-1"></span>
                      <span>{fieldErrors.fullName}</span>
                    </p>
                  )}
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-slate-700 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) {
                          setFieldErrors(prev => ({ ...prev, email: null }));
                        }
                      }}
                      className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                        fieldErrors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-150 text-sm`}
                      placeholder="jane@company.com"
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1.5 text-red-650 text-xs font-medium flex items-center space-x-1">
                      <span className="w-1 h-1 rounded-full bg-red-500 inline-block mr-1"></span>
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-slate-700 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) {
                          setFieldErrors(prev => ({ ...prev, password: null }));
                        }
                      }}
                      className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                        fieldErrors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-150 text-sm`}
                      placeholder="Min. 6 characters"
                    />
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1.5 text-red-650 text-xs font-medium flex items-center space-x-1">
                      <span className="w-1 h-1 rounded-full bg-red-500 inline-block mr-1"></span>
                      <span>{fieldErrors.password}</span>
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-150 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed shadow-md shadow-blue-500/10 mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Creating workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Register Workspace</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Login Redirect */}
              <div className="mt-8 text-center border-t border-slate-100 pt-6">
                <p className="text-slate-500 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-500 font-semibold transition duration-150">
                    Sign in here
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
