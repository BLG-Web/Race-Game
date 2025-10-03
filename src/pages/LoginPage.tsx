import { Anchor, Waves } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { signInWithGoogle, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-800 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <Waves className="absolute top-20 left-10 w-32 h-32 text-white animate-pulse" />
        <Waves className="absolute bottom-20 right-10 w-40 h-40 text-white animate-pulse" />
        <Anchor className="absolute top-40 right-20 w-24 h-24 text-cyan-300 animate-bounce" />
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-3xl p-12 max-w-md w-full shadow-2xl border-2 border-white/20">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Anchor className="w-20 h-20 text-yellow-400" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">
            One Piece
          </h1>
          <h2 className="text-3xl font-bold text-cyan-300 mb-2">
            Typing Race
          </h2>
          <p className="text-white/80 text-lg">
            Berlayar dan balapan mengetik di lautan!
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Login dengan Google</span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            Masuk untuk memulai petualangan balapan!
          </p>
        </div>
      </div>
    </div>
  );
}
