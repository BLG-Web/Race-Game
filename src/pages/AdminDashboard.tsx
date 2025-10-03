import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Key, UserPlus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Admin, Token } from '../lib/supabase';

interface AdminDashboardProps {
  onClose: () => void;
}

export function AdminDashboard({ onClose }: AdminDashboardProps) {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newTokenUserId, setNewTokenUserId] = useState('');
  const [newTokenValue, setNewTokenValue] = useState('');

  useEffect(() => {
    loadAdmins();
    loadTokens();
  }, []);

  const loadAdmins = async () => {
    const { data } = await supabase.from('admins').select('*').order('created_at');
    if (data) setAdmins(data);
  };

  const loadTokens = async () => {
    const { data } = await supabase.from('tokens').select('*').order('created_at');
    if (data) setTokens(data);
  };

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) return;

    await supabase.from('admins').insert({
      email: newAdminEmail.trim(),
      created_by: user?.email || 'unknown',
    });

    setNewAdminEmail('');
    loadAdmins();
  };

  const removeAdmin = async (id: string) => {
    await supabase.from('admins').delete().eq('id', id);
    loadAdmins();
  };

  const addToken = async () => {
    if (!newTokenUserId.trim() || !newTokenValue.trim()) return;

    await supabase.from('tokens').insert({
      user_id: newTokenUserId.trim(),
      token: newTokenValue.trim(),
      is_active: true,
    });

    setNewTokenUserId('');
    setNewTokenValue('');
    loadTokens();
  };

  const toggleToken = async (id: string, currentStatus: boolean) => {
    await supabase.from('tokens').update({ is_active: !currentStatus }).eq('id', id);
    loadTokens();
  };

  const removeToken = async (id: string) => {
    await supabase.from('tokens').delete().eq('id', id);
    loadTokens();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl p-8 max-w-4xl w-full shadow-2xl border-2 border-cyan-500 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-yellow-400" />
            <h2 className="text-3xl font-bold text-white">Admin Dashboard</h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-red-400 transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-6 h-6" />
              Admins
            </h3>

            <div className="flex gap-2 mb-4">
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="Email admin baru"
                className="flex-1 bg-white/20 text-white placeholder-white/50 px-4 py-2 rounded-lg border border-white/30 focus:border-cyan-400 focus:outline-none"
              />
              <button
                onClick={addAdmin}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="bg-white/10 rounded-lg p-3 flex justify-between items-center"
                >
                  <span className="text-white">{admin.email}</span>
                  {admin.email !== 'hokiantogautama.blg88@gmail.com' && (
                    <button
                      onClick={() => removeAdmin(admin.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Key className="w-6 h-6" />
              Tokens
            </h3>

            <div className="space-y-2 mb-4">
              <input
                type="text"
                value={newTokenUserId}
                onChange={(e) => setNewTokenUserId(e.target.value)}
                placeholder="User ID"
                className="w-full bg-white/20 text-white placeholder-white/50 px-4 py-2 rounded-lg border border-white/30 focus:border-cyan-400 focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTokenValue}
                  onChange={(e) => setNewTokenValue(e.target.value)}
                  placeholder="Token"
                  className="flex-1 bg-white/20 text-white placeholder-white/50 px-4 py-2 rounded-lg border border-white/30 focus:border-cyan-400 focus:outline-none"
                />
                <button
                  onClick={addToken}
                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="bg-white/10 rounded-lg p-3"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-white font-bold">{token.user_id}</div>
                      <div className="text-cyan-300 text-sm font-mono">{token.token}</div>
                    </div>
                    <button
                      onClick={() => removeToken(token.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => toggleToken(token.id, token.is_active)}
                    className={`text-xs px-3 py-1 rounded-full ${
                      token.is_active
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {token.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
