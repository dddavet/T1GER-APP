import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { generateMissions, generateMissionType } from '../services/gemini';
import { Target, Loader2, CheckCircle2, Circle, X, Flame } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { T1gerMission } from '../components/T1gerMission';
import { VoiceCoach } from '../components/VoiceCoach';
import { motion, AnimatePresence } from 'motion/react';
import { CountdownTimer } from '../components/CountdownTimer';

export const Missions = () => {
  const { appUser } = useAuth();
  const [activeMissions, setActiveMissions] = useState<any[]>([]);
  const [completedMissions, setCompletedMissions] = useState<any[]>([]);
  const [missionTypes, setMissionTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedMission, setSelectedMission] = useState<any | null>(null);
  const [newMissionType, setNewMissionType] = useState({ name: '', description: '', iconUrl: '' });
  const [addingType, setAddingType] = useState(false);
  const [generatingType, setGeneratingType] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [missionKeyword, setMissionKeyword] = useState('');
  const [difficulties, setDifficulties] = useState<('Easy' | 'Medium' | 'Hard')[]>(() => {
    const saved = localStorage.getItem('missionDifficulties');
    return saved ? JSON.parse(saved) : ['Easy', 'Medium', 'Hard'];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [generationDifficulty, setGenerationDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(() => {
    return (localStorage.getItem('generationDifficulty') as 'Easy' | 'Medium' | 'Hard') || 'Medium';
  });
  const [suggestedMissions, setSuggestedMissions] = useState<any[]>([]);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

  useEffect(() => {
    localStorage.setItem('missionDifficulties', JSON.stringify(difficulties));
    localStorage.setItem('generationDifficulty', generationDifficulty);
  }, [difficulties, generationDifficulty]);

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== message));
    }, 5000);
  };

  const handleGenerateSuggestions = async () => {
    if (!appUser) return;
    setGeneratingSuggestions(true);
    try {
      const typesSnapshot = await getDocs(collection(db, 'missionTypes'));
      const missionTypes = typesSnapshot.docs.map(doc => doc.data());
      const suggestions = await generateMissions(appUser.niche, appUser.level, missionTypes, difficulties);
      setSuggestedMissions(suggestions);
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const handleSaveSuggestion = async (mission: any, index: number) => {
    if (!appUser) return;
    try {
      await addDoc(collection(db, 'missions'), {
        userId: appUser.uid,
        ...mission,
        status: 'pending',
        createdAt: serverTimestamp(),
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      setSuggestedMissions(prev => prev.filter((_, i) => i !== index));
      addNotification('Mission saved!');
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!appUser) return;

    // Fetch mission types once
    const fetchTypes = async () => {
      try {
        const typesSnapshot = await getDocs(collection(db, 'missionTypes'));
        setMissionTypes(typesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching mission types:", error);
      }
    };
    fetchTypes();

    // Set up real-time listener for missions
    const missionsQuery = query(
      collection(db, 'missions'),
      where('userId', '==', appUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(missionsQuery, (snapshot) => {
      const fetchedMissions: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActiveMissions(fetchedMissions.filter(m => m.status !== 'completed'));
      setCompletedMissions(fetchedMissions.filter(m => m.status === 'completed'));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'missions', { currentUser: appUser });
    });

    return () => unsubscribe();
  }, [appUser]);

  const handleGenerateMissions = async () => {
    if (!appUser) return;
    setGenerating(true);
    try {
      const typesSnapshot = await getDocs(collection(db, 'missionTypes'));
      const missionTypes = typesSnapshot.docs.map(doc => doc.data());
      
      const newMissions = await generateMissions(appUser.niche, appUser.level, missionTypes, [generationDifficulty]);
      
      for (const mission of newMissions) {
        await addDoc(collection(db, 'missions'), {
          userId: appUser.uid,
          title: mission.title,
          description: mission.description,
          type: mission.type,
          xpReward: mission.xpReward,
          status: 'pending',
          createdAt: serverTimestamp(),
          difficulty: mission.difficulty,
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleAddMissionType = async () => {
    if (!newMissionType.name || !newMissionType.description) return;
    setAddingType(true);
    try {
      await addDoc(collection(db, 'missionTypes'), {
        ...newMissionType,
        createdAt: serverTimestamp()
      });
      setNewMissionType({ name: '', description: '', iconUrl: '' });
    } catch (error) {
      console.error(error);
    } finally {
      setAddingType(false);
    }
  };

  const handleGenerateMissionType = async () => {
    if (!missionKeyword) return;
    setGeneratingType(true);
    try {
      const generatedType = await generateMissionType(missionKeyword);
      await addDoc(collection(db, 'missionTypes'), {
        ...generatedType,
        createdAt: serverTimestamp()
      });
      setMissionKeyword('');
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingType(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'Hard': return 'text-red-500';
      default: return 'text-zinc-500';
    }
  };

  return (
    <div className="space-y-8 max-w-[430px] mx-auto">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((n, i) => (
          <div key={i} className="bg-orange-500 text-white p-4 rounded-lg shadow-lg font-bold">
            {n}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black flex items-center gap-3 font-sans uppercase tracking-tight">
          <Target className="w-8 h-8 text-[#FF6B00]" />
          Missions
        </h1>
        <div className="flex items-center gap-4">
          <VoiceCoach />
          <div className="flex items-center gap-1 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
            <Flame className={`w-5 h-5 ${appUser?.streak > 0 ? 'text-orange-500' : 'text-zinc-600'}`} />
            <span className="font-bold text-white text-sm font-mono">{appUser?.streak || 0}</span>
          </div>
          <div className="flex gap-2">
            {(['Easy', 'Medium', 'Hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDifficulties(prev => prev.includes(d) ? prev.filter(p => p !== d) : [...prev, d])}
                className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${difficulties.includes(d) ? 'bg-[#FF6B00] text-white' : 'bg-zinc-900 text-zinc-500'}`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase text-zinc-500">Generation Difficulty:</label>
            <select 
              value={generationDifficulty}
              onChange={e => setGenerationDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
              className="bg-zinc-900 text-white text-xs font-bold uppercase rounded-lg p-2 border border-zinc-800"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <button
            onClick={handleGenerateMissions}
            disabled={generating}
            className="bg-[#050505] hover:bg-zinc-900 text-white px-4 py-2 rounded-xl font-bold border border-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-2 font-sans uppercase text-sm"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {generating ? 'Generating...' : 'New Missions'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search missions..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white"
      />

      {/* Custom Mission Type Form */}
      <div className="bg-[#050505] border border-zinc-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-sans font-black uppercase text-lg">Define Custom Mission</h3>
        <input 
          type="text" 
          placeholder="Mission Name" 
          value={newMissionType.name}
          onChange={e => setNewMissionType({...newMissionType, name: e.target.value})}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white"
        />
        <textarea 
          placeholder="Description" 
          value={newMissionType.description}
          onChange={e => setNewMissionType({...newMissionType, description: e.target.value})}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white"
        />
        <input 
          type="text" 
          placeholder="Icon URL (optional)" 
          value={newMissionType.iconUrl}
          onChange={e => setNewMissionType({...newMissionType, iconUrl: e.target.value})}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white"
        />
        <button
          onClick={handleAddMissionType}
          disabled={addingType}
          className="w-full bg-[#FF6B00] text-white p-3 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {addingType ? 'Saving...' : 'Save Mission Type'}
        </button>
        
        <div className="pt-4 border-t border-zinc-800">
          <input 
            type="text" 
            placeholder="Keyword/Goal for AI generation" 
            value={missionKeyword}
            onChange={e => setMissionKeyword(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white mb-2"
          />
          <button
            onClick={handleGenerateMissionType}
            disabled={generatingType || !missionKeyword}
            className="w-full bg-zinc-800 text-white p-3 rounded-xl font-bold hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            {generatingType ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
      </div>

      {/* Mission Suggestions */}
      <div className="bg-[#050505] border border-zinc-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-sans font-black uppercase text-lg">Mission Suggestions</h3>
          <button
            onClick={handleGenerateSuggestions}
            disabled={generatingSuggestions}
            className="text-sm text-[#FF6B00] hover:text-orange-400 font-bold uppercase tracking-wider"
          >
            {generatingSuggestions ? 'Generating...' : 'Generate New'}
          </button>
        </div>
        {suggestedMissions.map((mission, index) => (
          <div key={index} className="bg-zinc-900 p-4 rounded-xl space-y-2 border border-zinc-800">
            <input 
              value={mission.title}
              onChange={e => setSuggestedMissions(prev => prev.map((m, i) => i === index ? {...m, title: e.target.value} : m))}
              className="w-full bg-transparent text-white font-bold"
            />
            <textarea 
              value={mission.description}
              onChange={e => setSuggestedMissions(prev => prev.map((m, i) => i === index ? {...m, description: e.target.value} : m))}
              className="w-full bg-transparent text-zinc-400 text-sm"
            />
            <button
              onClick={() => handleSaveSuggestion(mission, index)}
              className="w-full bg-zinc-800 text-white p-2 rounded-lg text-sm font-bold hover:bg-zinc-700"
            >
              Save Mission
            </button>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
        </div>
      ) : activeMissions.length === 0 && completedMissions.length === 0 ? (
        <div className="bg-[#050505] border border-zinc-800 rounded-3xl p-12 text-center">
          <Target className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-black mb-2 font-sans uppercase">No active missions</h3>
          <p className="text-zinc-400 mb-6 font-mono text-sm">Generate your daily missions to start earning XP.</p>
          <button
            onClick={handleGenerateMissions}
            disabled={generating}
            className="bg-[#FF6B00] text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors font-sans uppercase tracking-wider w-full"
          >
            Generate Daily Missions
          </button>
        </div>
      ) : (
        <>
          {/* Active Missions */}
          <div className="space-y-4">
            <h2 className="font-sans font-black uppercase text-lg text-zinc-400">Active Missions</h2>
            {activeMissions.filter(m => difficulties.includes(m.difficulty) && (m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase()))).length === 0 ? (
              <p className="text-zinc-600 font-mono text-sm">No active missions for selected filters.</p>
            ) : (
              <div className="grid gap-4">
                <AnimatePresence>
                  {activeMissions.filter(m => difficulties.includes(m.difficulty) && (m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase()))).map(mission => (
                    <motion.div 
                      key={mission.id} 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.4, ease: "backOut" } }}
                      whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(255, 107, 0, 0.2)" }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-[#050505] border border-zinc-800 rounded-2xl p-6 transition-all cursor-pointer hover:border-[#FF6B00]/50"
                      onClick={() => setSelectedMission(mission)}
                    >
                      <div className="flex items-start gap-4">
                        <Circle className="w-8 h-8 text-zinc-600 shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                              {missionTypes.find(t => t.name === mission.type)?.iconUrl && (
                                <img src={missionTypes.find(t => t.name === mission.type).iconUrl} alt={mission.type} className="w-4 h-4" />
                              )}
                              {mission.type}
                            </span>
                            <span className={`${getDifficultyColor(mission.difficulty)} font-bold text-xs font-mono uppercase`}>{mission.difficulty}</span>
                            <span className="text-[#FF6B00] font-bold text-sm font-mono">+{mission.xpReward} XP</span>
                            {mission.deadline && (
                              <CountdownTimer 
                                deadline={new Date(mission.deadline)} 
                                onExpire={() => addNotification(`Mission "${mission.title}" has expired!`)} 
                                onApproaching={() => addNotification(`Mission "${mission.title}" is expiring soon!`)}
                              />
                            )}
                          </div>
                          <h3 className="text-xl font-black mb-2 font-sans uppercase">{mission.title}</h3>
                          <p className="text-zinc-400 font-mono text-sm line-clamp-2">{mission.description}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMission(mission);
                            }}
                            className="mt-4 w-full bg-orange-500 text-white p-2 rounded-lg font-bold text-sm hover:bg-orange-600 transition-colors"
                          >
                            Verify Mission
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Completed Missions History */}
          <div className="space-y-4 mt-8">
            <h2 className="font-sans font-black uppercase text-lg text-zinc-400">Mission History</h2>
            {completedMissions.filter(m => difficulties.includes(m.difficulty) && (m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase()))).length === 0 ? (
              <p className="text-zinc-600 font-mono text-sm">No completed missions match your search.</p>
            ) : (
              <div className="grid gap-4">
                <AnimatePresence>
                  {completedMissions.filter(m => difficulties.includes(m.difficulty) && (m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase()))).map(mission => (
                    <motion.div 
                      key={mission.id} 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#050505] border border-green-500/30 rounded-2xl p-6 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {missionTypes.find(t => t.name === mission.type)?.iconUrl ? (
                            <img src={missionTypes.find(t => t.name === mission.type).iconUrl} alt={mission.type} className="w-8 h-8" />
                          ) : (
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                          )}
                          <div>
                            <h3 className="text-lg font-black font-sans uppercase">
                              {mission.title}
                              <span className={`${getDifficultyColor(mission.difficulty)} text-xs font-mono ml-2`}>({mission.difficulty})</span>
                            </h3>
                            <p className="text-zinc-500 font-mono text-xs">
                              {mission.completedAt?.toDate().toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className="text-green-500 font-bold font-mono">+{mission.xpReward} XP</span>
                      </div>
                      {mission.proof && (
                        <div className="bg-zinc-900 p-3 rounded-xl text-sm text-zinc-400 font-mono">
                          <p>{mission.proof.message}</p>
                          <p className="text-xs mt-1 text-zinc-600">Confidence: {mission.proof.confidenceScore}%</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </>
      )}

      {/* Verification Modal */}
      {selectedMission && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-[430px] my-auto">
            <button 
              onClick={() => setSelectedMission(null)}
              className="absolute -top-12 right-0 text-zinc-400 hover:text-white bg-zinc-900 p-2 rounded-full z-50"
            >
              <X className="w-6 h-6" />
            </button>
            <T1gerMission 
              mission={selectedMission} 
              onComplete={() => {
                setSelectedMission(null);
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
