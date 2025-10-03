import { useState, useEffect, useCallback } from 'react';
import { Anchor, Flag, Users, LogOut, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, RaceSession, RaceParticipant, Ship } from '../lib/supabase';
import { OceanLane } from '../components/OceanLane';
import { RaceTypingArea } from '../components/RaceTypingArea';
import { RaceResults } from '../components/RaceResults';
import { getRandomText } from '../data/texts';

interface ArenaPageProps {
  userId: string;
  shipId: string;
  onBackToShipSelection: () => void;
}

export function ArenaPage({ userId, shipId, onBackToShipSelection }: ArenaPageProps) {
  const { user, signOut, isAdmin } = useAuth();
  const [currentSession, setCurrentSession] = useState<RaceSession | null>(null);
  const [participants, setParticipants] = useState<(RaceParticipant & { ships: Ship })[]>([]);
  const [myParticipant, setMyParticipant] = useState<RaceParticipant | null>(null);
  const [raceText, setRaceText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    
    const setup = async () => {
      let session = await getOrCreateWaitingSession();

      if (!session) {
        session = await createNewSession();
      }

      if (session) {
        console.log('🎮 Initializing arena with session:', session.id);
        setCurrentSession(session);
        await joinSession(session.id);
        await loadParticipants(session.id);
        
        // Setup real-time subscription AFTER we have session ID
        cleanup = subscribeToUpdates(session.id);
      }
    };
    
    setup();
    
    return () => {
      // Cleanup subscription on unmount
      if (cleanup) {
        console.log('🛑 Component unmounting, cleaning up...');
        cleanup();
      }
    };
  }, []);



  const getOrCreateWaitingSession = async () => {
    const { data } = await supabase
      .from('race_sessions')
      .select('*')
      .eq('status', 'waiting')
      .maybeSingle();

    return data;
  };

  const createNewSession = async () => {
    const { data } = await supabase
      .from('race_sessions')
      .insert({
        status: 'waiting',
        race_text: getRandomText(),
      })
      .select()
      .single();

    return data;
  };

  const joinSession = async (sessionId: string) => {
    // Check if user already joined this session
    const { data: existingParticipant } = await supabase
      .from('race_participants')
      .select('*')
      .eq('race_session_id', sessionId)
      .eq('user_email', user?.email)
      .maybeSingle();

    if (existingParticipant) {
      console.log('User already in session, using existing participant');
      setMyParticipant(existingParticipant);
      return;
    }

    const existingParticipants = await supabase
      .from('race_participants')
      .select('lane_number')
      .eq('race_session_id', sessionId)
      .order('lane_number');

    const usedLanes = existingParticipants.data?.map((p: any) => p.lane_number) || [];
    const availableLane = [1, 2, 3, 4, 5].find((lane) => !usedLanes.includes(lane));

    if (!availableLane) {
      console.log('No available lanes');
      return;
    }

    const { data } = await supabase
      .from('race_participants')
      .insert({
        race_session_id: sessionId,
        user_email: user?.email || '',
        user_id: userId,
        ship_id: shipId,
        lane_number: availableLane,
      })
      .select()
      .single();

    if (data) {
      setMyParticipant(data);
    }
  };

  const loadParticipants = async (sessionId: string) => {
    try {
      console.log('🔄 Loading participants for session:', sessionId);
      const { data, error } = await supabase
        .from('race_participants')
        .select('*, ships(*)')
        .eq('race_session_id', sessionId)
        .order('lane_number');

      if (error) {
        console.error('❌ Error loading participants:', error);
        return;
      }

      if (data) {
        console.log('👥 Loaded participants:', data.length, 'players');
        setParticipants(data as any);
      }
    } catch (error) {
      console.error('💥 Failed to load participants:', error);
    }
  };

  const subscribeToUpdates = (sessionId: string) => {
    console.log('Setting up realtime subscription for session:', sessionId);
    
    const channel = supabase
      .channel(`arena_updates_${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'race_sessions' },
        (payload) => {
          console.log('🏁 Race session updated:', payload);
          if (payload.new && (payload.new as any).id === sessionId) {
            setCurrentSession(payload.new as RaceSession);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'race_participants' },
        (payload) => {
          console.log('🏃‍♂️ Race participants updated:', payload);
          // Always reload participants for this session
          loadParticipants(sessionId);
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time updates!');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('❌ Subscription failed:', status);
        }
      });

    return () => {
      console.log('🧹 Cleaning up subscription for session:', sessionId);
      channel.unsubscribe();
    };
  };

  useEffect(() => {
    if (currentSession?.race_text) {
      setRaceText(currentSession.race_text);
    }
  }, [currentSession]);

  useEffect(() => {
    if (currentSession?.status === 'in_progress' && !startTime) {
      setStartTime(Date.now());
    }
  }, [currentSession?.status]);

  const handleStartRace = async () => {
    if (!isAdmin || !currentSession) return;

    await supabase
      .from('race_sessions')
      .update({
        status: 'in_progress',
        started_by: user?.email,
        started_at: new Date().toISOString(),
      })
      .eq('id', currentSession.id);
  };

  const handleKeyPress = useCallback(
    async (key: string) => {
      if (currentSession?.status !== 'in_progress' || !myParticipant) return;

      if (key === raceText[currentIndex]) {
        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);

        const progress = Math.round((newIndex / raceText.length) * 100);
        const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
        const wordsTyped = newIndex / 5;
        const wpm = elapsed > 0 ? Math.round((wordsTyped / elapsed) * 60) : 0;

        await supabase
          .from('race_participants')
          .update({
            progress,
            wpm,
          })
          .eq('id', myParticipant.id);

        if (newIndex === raceText.length) {
          await supabase
            .from('race_participants')
            .update({
              finished_at: new Date().toISOString(),
            })
            .eq('id', myParticipant.id);
        }
      }
    },
    [currentSession, myParticipant, raceText, currentIndex, startTime]
  );

  const canStartRace = isAdmin && participants.length === 5 && currentSession?.status === 'waiting';

  const isRaceComplete = currentSession?.status === 'completed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-700 to-blue-900 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Anchor className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Arena Lautan</h1>
            {isAdmin && <Crown className="w-8 h-8 text-yellow-400" />}
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-lg px-4 py-2 rounded-lg border border-white/30">
              <div className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5" />
                <span className="font-bold">{participants.length}/5</span>
              </div>
            </div>
            <button
              onClick={onBackToShipSelection}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              Ganti Kapal
            </button>
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-b from-cyan-400 to-blue-600 rounded-2xl p-8 mb-6 border-4 border-blue-800 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
          </div>

          <div className="space-y-2 relative z-10">
            {[1, 2, 3, 4, 5].map((lane) => {
              const participant = participants.find((p) => p.lane_number === lane);
              return (
                <OceanLane
                  key={lane}
                  laneNumber={lane}
                  participant={participant}
                  isCurrentUser={participant?.user_email === user?.email}
                />
              );
            })}
          </div>
        </div>

        {currentSession?.status === 'waiting' && (
          <div className="bg-yellow-500/20 border-2 border-yellow-500 text-white px-6 py-4 rounded-xl mb-6 text-center">
            <p className="text-xl font-bold">
              Menunggu pemain... ({participants.length}/5)
            </p>
            {participants.length < 5 && (
              <p className="text-sm mt-2">Butuh {5 - participants.length} pemain lagi untuk mulai race</p>
            )}
            <p className="text-xs mt-2 opacity-75">
              ✨ Updates real-time - tidak perlu refresh!
            </p>
            <p className="text-xs mt-1 opacity-50">
              Debug: Session ID {currentSession?.id?.slice(-8)}
            </p>
          </div>
        )}

        {canStartRace && (
          <div className="text-center mb-6">
            <button
              onClick={handleStartRace}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-12 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-xl flex items-center gap-3 mx-auto"
            >
              <Flag className="w-6 h-6" />
              START RACE (ADMIN)
            </button>
          </div>
        )}

        {currentSession?.status === 'in_progress' && (
          <RaceTypingArea
            text={raceText}
            currentIndex={currentIndex}
            onKeyPress={handleKeyPress}
            progress={Math.round((currentIndex / raceText.length) * 100)}
          />
        )}

        {isRaceComplete && (
          <RaceResults
            participants={participants}
            onNewRace={() => window.location.reload()}
          />
        )}
      </div>
    </div>
  );
}
