import { useState } from 'react';
import { Shield } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { ShipSelectionPage } from './pages/ShipSelectionPage';
import { ArenaPage } from './pages/ArenaPage';
import { AdminDashboard } from './pages/AdminDashboard';

type GameScreen = 'login' | 'ship-selection' | 'arena';

function AppContent() {
  const { user, loading, isAdmin } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('ship-selection');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedShipId, setSelectedShipId] = useState('');
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-800 to-blue-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleEnterArena = (userId: string, shipId: string) => {
    setSelectedUserId(userId);
    setSelectedShipId(shipId);
    setCurrentScreen('arena');
  };

  const handleBackToShipSelection = () => {
    setCurrentScreen('ship-selection');
    setSelectedUserId('');
    setSelectedShipId('');
  };

  return (
    <div className="relative">
      {isAdmin && currentScreen === 'ship-selection' && (
        <button
          onClick={() => setShowAdminDashboard(true)}
          className="fixed top-4 right-4 z-40 bg-yellow-500 hover:bg-yellow-600 text-gray-900 p-3 rounded-full shadow-lg transition-all"
          title="Admin Dashboard"
        >
          <Shield className="w-6 h-6" />
        </button>
      )}

      {currentScreen === 'ship-selection' && (
        <ShipSelectionPage onEnterArena={handleEnterArena} />
      )}

      {currentScreen === 'arena' && (
        <ArenaPage
          userId={selectedUserId}
          shipId={selectedShipId}
          onBackToShipSelection={handleBackToShipSelection}
        />
      )}

      {showAdminDashboard && (
        <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
