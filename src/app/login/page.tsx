'use client';

import { signIn, getProviders, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Rocket, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<Record<string, { id: string; name: string; }>>({});
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  // If already authenticated, redirect to app
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/?view=app');
    }
  }, [status, session, router]);

  useEffect(() => {
    getProviders().then(setProviders);

    // Check for OAuth errors in URL
    const errorParam = searchParams.get('error');
    if (errorParam === 'OAuthAccountNotLinked') {
      setError('This email is already linked to another account.');
    } else if (errorParam === 'AccessDenied') {
      setError('Access was denied. Your email may not be authorized as a test user in Google Console.');
    } else if (errorParam === 'Configuration') {
      setError('Sign-in configuration error. Please try again later.');
    } else if (errorParam === 'Callback') {
      setError('Redirect error. Please try again.');
    } else if (errorParam) {
      setError(`Sign-in error: ${errorParam}`);
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      await signIn('google', {
        redirect: true,
      });
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }

    // Fallback: if signIn doesn't redirect after 10s, show error
    setTimeout(() => {
      setLoading(false);
    }, 10000);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 mb-4 shadow-lg shadow-orange-500/25"
          >
            <Rocket className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to <span className="gradient-text bg-gradient-to-r from-orange-400 via-amber-400 to-red-400 bg-clip-text text-transparent">PostPilot</span>
          </h1>
          <p className="text-zinc-400 text-sm">AI-Powered Social Media Content Engine</p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl"
        >
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white">Sign in to continue</h2>
              <p className="text-zinc-400 text-sm mt-1">Get 20 free AI generations to start</p>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
              >
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading || !providers.google}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white hover:bg-zinc-100 disabled:bg-zinc-700 text-zinc-900 font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-white/5 group cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
              {!loading && <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800" /></div>
              <div className="relative flex justify-center text-xs"><span className="px-3 bg-zinc-900 text-zinc-500">Free forever plan</span></div>
            </div>

            {/* Features list */}
            <div className="space-y-3">
              {[
                '20 free AI generations',
                '6 platforms & 6 tones',
                'Brand voice training',
                'Content repurposing',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-zinc-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-xs mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
