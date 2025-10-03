import { useState, useEffect } from 'react';
import { Anchor, Ship as ShipIcon, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Ship } from '../lib/supabase';
import { validateTokenFromSheet } from '../lib/googleSheets';

interface ShipSelectionPageProps {
  onEnterArena: (userId: string, shipId: string) => void;
}

export function ShipSelectionPage({ onEnterArena }: ShipSelectionPageProps) {
  const { user, signOut } = useAuth();
  const [ships, setShips] = useState<Ship[]>([]);
  const [selectedShip, setSelectedShip] = useState<string>('');
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed, forcing refresh:', error);
      window.location.reload();
    } finally {
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    loadShips();
  }, []);

  const loadShips = async () => {
    const { data } = await supabase
      .from('ships')
      .select('*')
      .order('name');

    if (data) {
      setShips(data);
    }
  };

  const validateToken = async () => {
    if (!userId.trim() || !token.trim()) {
      setError('User ID dan Token harus diisi!');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      // Validate token directly from Google Sheets
      const isValid = await validateTokenFromSheet(userId.trim(), token.trim());

      if (isValid) {
        setIsValid(true);
        setError('');
        console.log('Token validation successful!');
      } else {
        setError('User ID atau Token tidak valid! Pastikan data sesuai dengan Google Sheet.');
        setIsValid(false);
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError('Terjadi kesalahan saat validasi. Coba lagi dalam beberapa saat.');
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleEnterArena = () => {
    if (!selectedShip) {
      setError('Pilih kapal terlebih dahulu!');
      return;
    }

    if (isValid) {
      onEnterArena(userId, selectedShip);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-800 to-blue-900 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Anchor className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Pilih Kapal</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-white text-right">
              <p className="text-sm opacity-75">Logged in as</p>
              <p className="font-semibold">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-all"
              title={isSigningOut ? 'Signing out...' : 'Logout'}
            >
              {isSigningOut ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 border-2 border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <ShipIcon className="w-6 h-6" />
            Data Pemain
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-white mb-2 font-semibold">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setIsValid(false);
                }}
                placeholder="Contoh: kotok123"
                className="w-full bg-white/20 text-white placeholder-white/50 px-4 py-3 rounded-lg border-2 border-white/30 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white mb-2 font-semibold">Token</label>
              <input
                type="text"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setIsValid(false);
                }}
                placeholder="Masukkan token"
                className="w-full bg-white/20 text-white placeholder-white/50 px-4 py-3 rounded-lg border-2 border-white/30 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={validateToken}
            disabled={isValidating || !userId.trim() || !token.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all"
          >
            {isValidating ? 'Memvalidasi...' : 'Validasi Token'}
          </button>

          {error && (
            <div className="mt-4 bg-red-500/20 border-2 border-red-500 text-white px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {isValid && (
            <div className="mt-4 bg-green-500/20 border-2 border-green-500 text-white px-4 py-3 rounded-lg">
              Token valid! Silahkan pilih kapal dan masuk arena.
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 border-2 border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Pilih Kapal</h2>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {ships.map((ship) => (
              <button
                key={ship.id}
                onClick={() => setSelectedShip(ship.id)}
                className={`p-4 rounded-xl transition-all transform hover:scale-105 ${
                  selectedShip === ship.id
                    ? 'bg-cyan-500 border-4 border-yellow-400 shadow-xl'
                    : 'bg-white/20 border-2 border-white/30 hover:bg-white/30'
                }`}
              >
                <img
                  src={ship.image_url}
                  alt={ship.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h3 className="text-white font-bold text-center">{ship.name}</h3>
                <p className="text-white/70 text-sm text-center mt-1">{ship.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleEnterArena}
            disabled={!isValid || !selectedShip}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-12 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-xl"
          >
            GO ARENA
          </button>
        </div>
      </div>
    </div>
  );
}
