import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth, DEMO_PRESET_USERS, type DemoPreset } from '../contexts/AuthContext';
import { useT1ger } from '../contexts/T1gerContext';
import { useBrain } from '../contexts/BrainContext';
import { User, Award, History, Settings, LogOut, ChevronRight, BrainCircuit, Users, Crown, Sparkles, RefreshCcw, Flame, Terminal, Activity, BarChart2, CheckCircle2, TrendingUp, FileText, Play, Download, Upload, ShieldCheck, Scale, Trash2 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { parseLibreLingoYAML } from '../services/libreLingoParser';
import { downloadT1gerDataExport, readT1gerDataExport, restoreT1gerDataExport } from '../services/dataPortability';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsOfService } from './TermsOfService';

export const Profile = ({ onPlayMission }: { onPlayMission?: (mission: any) => void }) => {
  const { appUser, logout, updateAppUser, loginAsDemoUser, deleteAccountAndData } = useAuth();
  const { stats, user, setActiveView, spendCoins, addXP } = useT1ger();
  const { competencies, learnStreak, tacticalStreak, resetBrain, brainState } = useBrain();
  const [sessions, setSessions] = useState<any[]>([]);
  const importInputId = 't1ger-data-import';

  // Legal & Privacy Modals
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleConfirmDeleteAccount = async () => {
    const confirm1 = window.confirm("⚠️ ALERTA DE SEGURIDAD: ¿Estás seguro de que deseas eliminar permanentemente tu cuenta de T1GER APP?");
    if (!confirm1) return;
    const confirm2 = window.confirm("⚠️ Confirmación final: Esta acción borrará todas tus misiones, nivel, XP, racha y datos asociados de forma irreversible. ¿Proceder?");
    if (!confirm2) return;

    try {
      await deleteAccountAndData();
      alert("Tu cuenta y datos personales han sido eliminados permanentemente de T1GER APP. Cumplimiento verificado.");
    } catch (e) {
      console.error("Error al eliminar la cuenta:", e);
      alert("Ocurrió un error al procesar la eliminación. Contacta a privacy@t1ger.app");
    }
  };

  // Developer Mode Toggle
  const [isDevMode, setIsDevMode] = useState(false);
  const [devClicks, setDevClicks] = useState(0);

  // Webhook Simulator States
  const [activeService, setActiveService] = useState<'todoist' | 'notion'>('todoist');
  const [simulating, setSimulating] = useState(false);
  const [simLog, setSimLog] = useState<string[]>([]);

  // Delphi & BirdBrain Telemetry States
  const [activeTelemetryTab, setActiveTelemetryTab] = useState<'irt' | 'ab' | 'stream' | 'yaml'>('irt');

  // YAML Studio States
  const [yamlText, setYamlText] = useState<string>(`dayNumber: 1
title: "IA y Prompt Hacking"
topic: "Aprender AI"
quote:
  text: "El verdadero peligro no es que las computadoras comiencen a pensar como hombres, sino que los hombres comiencen a pensar como computadoras."
  author: "Sydney J. Harris"
  context: "En la era de la IA, formular las preguntas correctas y saltar las limitaciones del sistema es la habilidad clave."
reading:
  title: "Inyecciones de Prompt: Rompiendo Reglas"
  subtitle: "Ciberseguridad en Modelos de Lenguaje"
  takeaway: "Los LLM son vulnerables a instrucciones engañosas porque combinan instrucciones y datos en el mismo flujo."
paragraphs:
  - "El prompt hacking ocurre cuando un usuario astuto persuade a un modelo para que ignore sus instrucciones originales."
  - "Para lograr esto, se suele usar la técnica de 'juegos de rol', pretendiendo ser un administrador del sistema en modo de depuración."
  - "El éxito radica en saber eludir las restricciones negativas del prompt de sistema ('NUNCA digas X')."
action:
  title: "Ejecución de Práctica Diaria"
  instruction: "Antes de abrir cualquier red social hoy, realiza 10 lagartijas (pushups). Describe tu experiencia abajo para registrar la prueba."
  type: "text"
  successReward: 50
quizQuestions:
  - question: "¿Por qué los modelos de lenguaje son vulnerables al prompt hacking?"
    options:
      text: "Porque no separan de forma dura el canal de instrucciones del canal de datos de usuario"
      correct: true
      text: "Porque tienen poca memoria RAM disponible"
      correct: false
    explanation: "A diferencia de la programación tradicional, los LLM reciben las reglas del sistema y los datos del usuario en el mismo flujo de texto."
  - question: "¿Cuál de estos métodos previene inyecciones de prompt de forma efectiva?"
    options:
      text: "Validar las entradas con expresiones regulares y verificar la presencia de palabras clave de seguridad en la salida"
      correct: true
      text: "Pedirle amablemente al modelo que nunca se deje hackear"
      correct: false
    explanation: "El filtrado riguroso de salida y el análisis estructurado de respuestas son las mejores defensas activas."`);

  const [compileError, setCompileError] = useState<string | null>(null);
  const [parsedLesson, setParsedLesson] = useState<any>(null);

  const handleValidateYAML = (text: string) => {
    try {
      const parsed = parseLibreLingoYAML(text);
      if (!parsed || !parsed.title) {
        throw new Error("YAML inválido o campo 'title' ausente.");
      }
      setParsedLesson(parsed);
      setCompileError(null);
    } catch (err: any) {
      setCompileError(err.message || "Error de análisis sintáctico.");
      setParsedLesson(null);
    }
  };

  // Run initial validation
  useEffect(() => {
    handleValidateYAML(yamlText);
  }, []);

  const handlePlayYamlMission = () => {
    if (!parsedLesson) return;
    if (onPlayMission) {
      onPlayMission({
        id: 'yaml_sandbox_mission',
        type: 'flashcard',
        competency: parsedLesson.competency || 'ai',
        isCuratedAI: true,
        curatedData: parsedLesson,
        title: parsedLesson.title,
        concept: parsedLesson.reading?.takeaway || "Concepto importado",
        xpReward: 30
      });
    }
  };

  const handleImportT1gerData = async (file?: File) => {
    if (!file) return;

    try {
      const payload = await readT1gerDataExport(file);
      if (!window.confirm(`Restore T1GER progress exported on ${new Date(payload.exportedAt).toLocaleString()}? This overwrites local T1GER data on this device.`)) {
        return;
      }
      restoreT1gerDataExport(payload);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Could not import this T1GER data file.');
    }
  };
  const [selectedGroup, setSelectedGroup] = useState<Record<string, 'A' | 'B'>>({
    onboarding: 'A',
    pomodoro: 'A',
    procrastination: 'B',
  });
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [SYSTEM] Delphi Analytics Engine initialized.`,
    `[${new Date().toLocaleTimeString()}] [BIRDBRAIN] Analyzing historical logs for latent ability θ calibration...`,
    `[${new Date().toLocaleTimeString()}] [IRT] Found 6 curated competency dimensions. Ready.`,
  ]);

  useEffect(() => {
    const events = [
      () => `[${new Date().toLocaleTimeString()}] [TELEMETRY] event: "lesson_completed" | uid: "${appUser?.uid || 'anonymous'}" | time_elapsed: ${Math.floor(Math.random() * 80) + 90}s | score: ${Math.floor(Math.random() * 20) + 80}%`,
      () => `[${new Date().toLocaleTimeString()}] [BIRDBRAIN] Estimating theta parameter... Latent ability (θ) estimated: ${(Object.values(competencies).reduce((a, b) => a + b, 0) / 500 * 3 - 0.5).toFixed(2)}`,
      () => `[${new Date().toLocaleTimeString()}] [IRT] Calibrating Question ID "AI_PROMPT_0${Math.floor(Math.random() * 5) + 1}". Updated difficulty d_i: ${(Math.random() * 0.8 + 0.1).toFixed(2)}`,
      () => `[${new Date().toLocaleTimeString()}] [DELPHI] User mapped to group "${selectedGroup.onboarding}" for "Onboarding Hook Experiment".`,
      () => `[${new Date().toLocaleTimeString()}] [MARKETING] Dynamic segment "Niche: ${appUser?.niche || 'Entrepreneur'}" matched. Serving tailored curriculum hook.`,
      () => `[${new Date().toLocaleTimeString()}] [TELEMETRY] event: "click_pomodoro_audio" | state: "active" | frequency: "Gamma 40Hz"`,
      () => `[${new Date().toLocaleTimeString()}] [SRS] Recalculating Spaced Repetition half-life (h) for "Prompt Engineering" using Half-Life Regression.`,
    ];

    const interval = setInterval(() => {
      const randomEvent = events[Math.floor(Math.random() * events.length)]();
      setTelemetryLogs(prev => {
        const updated = [...prev, randomEvent];
        if (updated.length > 12) {
          return updated.slice(updated.length - 12);
        }
        return updated;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [appUser, competencies, selectedGroup]);

  // Streak Auditor & day reflection states
  const [selectedAuditDate, setSelectedAuditDate] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [reflections, setReflections] = useState<Record<string, string>>(() => {
    const raw = localStorage.getItem('t1ger_day_reflections');
    return raw ? JSON.parse(raw) : {};
  });

  const handleSaveReflection = () => {
    if (!selectedAuditDate) return;
    const nextReflections = { ...reflections, [selectedAuditDate]: reflectionText };
    setReflections(nextReflections);
    localStorage.setItem('t1ger_day_reflections', JSON.stringify(nextReflections));
    alert("Consistency audit saved successfully! 🐯");
  };

  useEffect(() => {
    if (selectedAuditDate) {
      setReflectionText(reflections[selectedAuditDate] || '');
    }
  }, [selectedAuditDate, reflections]);

  const getDayCompletions = (dateStr: string) => {
    const record = brainState.dailyTacticalStatus[dateStr];
    if (record) {
      const hasLearn = record.completedIds.some(id => id.startsWith('learn_') || id.includes('lesson') || id.includes('quiz'));
      const hasTactical = record.completedIds.length > 0 && !hasLearn;
      const both = hasLearn && record.completedIds.length >= 2;
      return {
        completed: record.completedIds.length > 0,
        both: record.completedIds.length >= 3,
        learn: hasLearn,
        tactical: hasTactical,
        rest: record.dayType === 'rest',
        tasks: record.completedIds
      };
    }
    
    // Seed mock completions
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const val = Math.abs(hash) % 10;
    
    return {
      completed: val > 2,
      both: val > 5,
      learn: val === 3 || val === 4,
      tactical: val === 5,
      rest: val === 0 || val === 1,
      tasks: val > 2 ? ['Mission Complete: Prompting Bases', 'Tactical Post Sync: Todoist API', 'Lesson Complete: Temperature Parameter'] : []
    };
  };

  const handleSimulateWebhook = async () => {
    if (simulating) return;
    setSimulating(true);
    setSimLog([`[${new Date().toLocaleTimeString()}] Syncing with ${activeService.toUpperCase()} webhook...`]);
    
    await new Promise(r => setTimeout(r, 600));
    setSimLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] POST request received at /v1/webhooks/${appUser?.uid || 'anonymous'}/${activeService}`]);
    
    await new Promise(r => setTimeout(r, 800));
    const mockPayload = activeService === 'todoist' 
      ? JSON.stringify({
          event_name: "item:completed",
          user_id: appUser?.uid || "tiger_user_1",
          event_data: {
            content: "Launch beta landing page",
            project_id: "operations",
            completed_at: new Date().toISOString()
          }
        }, null, 2)
      : JSON.stringify({
          object: "page",
          id: "notion-db-page-ops-1",
          properties: {
            Status: { select: { name: "Done" } },
            Name: { title: [{ text: { content: "Audit organic CAC" } }] }
          }
        }, null, 2);

    setSimLog(prev => [...prev, `[PAYLOAD RECEIVED]:\n${mockPayload}`]);

    await new Promise(r => setTimeout(r, 1000));
    setSimLog(prev => [...prev, `[T1GER ENGINE] Audit approved. Real-world proof verified.`]);
    setSimLog(prev => [...prev, `[REWARD] +50 XP and +10 Coins automatically credited.`]);
    
    await addXP(50);
    if (updateAppUser && appUser) {
      await updateAppUser({ coins: (appUser.coins || 0) + 10 });
    }

    setSimulating(false);
  };

  // Live competency scores from the Brain
  const healthData = [
    { subject: 'Offer', A: Math.round(competencies.offer) },
    { subject: 'Sales', A: Math.round(competencies.sales) },
    { subject: 'Marketing', A: Math.round(competencies.marketing) },
    { subject: 'Mindset', A: Math.round(competencies.mindset) },
    { subject: 'Operations', A: Math.round(competencies.operations) },
  ];

  useEffect(() => {
    if (!appUser) return;
    const fetchSessions = async () => {
      const q = query(collection(db, 'users', appUser.uid, 'coachingSessions'), orderBy('timestamp', 'desc'), limit(3));
      const snapshot = await getDocs(q);
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchSessions();
  }, [appUser]);

  return (
    <div className="space-y-8 pb-12 relative z-10">

      <header className="flex flex-col items-center text-center pt-8 relative">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => {
            setDevClicks(prev => prev + 1);
            if (devClicks >= 4) {
              setIsDevMode(prev => !prev);
              setDevClicks(0);
            }
          }}
          className="w-28 h-28 rounded-full flex items-center justify-center mb-6 border-[3px] border-zinc-200 shadow-float overflow-hidden relative group cursor-pointer bg-white"
        >
          {appUser?.photoURL ? (
            <img src={appUser.photoURL} alt={appUser.displayName || 'User'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-white flex items-center justify-center text-4xl">
              {appUser?.displayName?.charAt(0) || '🐅'}
            </div>
          )}
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
             <span className="text-zinc-800 font-black text-[10px] uppercase">{isDevMode ? 'Dev Mode On' : 'Tap 5x Dev'}</span>
          </div>
        </motion.div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <input
              type="text"
              defaultValue={appUser?.displayName || 'Founder'}
              onBlur={(e) => updateAppUser({ displayName: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              className="bg-transparent text-3xl font-black italic uppercase tracking-tighter text-center focus:outline-none focus:text-accent border-b border-transparent focus:border-accent/30 w-full max-w-[240px] transition-all"
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="px-2 py-0.5 bg-accent text-black rounded text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-sm shadow-accent/20">
              <Crown className="w-2.5 h-2.5" /> {appUser?.isFounder ? 'FOUNDER' : 'APEX'}
            </div>
            <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">•</span>
            <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">{appUser?.email || 'Modo Invitado'}</span>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => logout()}
              className="px-4 py-2 bg-white hover:bg-zinc-50 text-zinc-800 font-black text-[11px] uppercase tracking-wider rounded-xl border border-b-2 border-zinc-300 active:border-b-0 active:translate-y-0.5 shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <LogOut className="w-3.5 h-3.5 text-[#FF7300]" /> Cambiar de Cuenta / Iniciar Sesión
            </button>
          </div>
        </div>
        
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-white shadow-sm rounded-full border-zinc-200">
           <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_8px_#00E5FF]" />
           <p className="text-[#00E5FF] font-black uppercase text-[9px] tracking-widest drop-shadow-[0_0_5px_rgba(0,229,255,0.4)]">
             {appUser?.niche || 'Ambitious Entrepreneur'}
           </p>
        </div>
      </header>

      {/* 5 PRESET TEST ACCOUNTS SWITCHER */}
      <div className="bg-white border-2 border-zinc-200 rounded-3xl p-5 shadow-xl space-y-3 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FF7300]" />
            <h3 className="font-black italic uppercase text-sm text-zinc-800 tracking-tight">
              Cambiar de Cuenta (5 Perfiles)
            </h3>
          </div>
          <span className="text-[9px] font-black font-mono uppercase bg-[#FF7300]/10 text-[#FF7300] px-2 py-0.5 rounded-full border border-[#FF7300]/20">
            Multi-User Live
          </span>
        </div>

        <p className="text-xs text-zinc-500 font-medium leading-relaxed">
          Alterna al instante entre 5 usuarios de prueba con diferentes niveles, competencias y estados de onboarding:
        </p>

        <div className="grid grid-cols-1 gap-2 pt-1">
          {(Object.keys(DEMO_PRESET_USERS) as DemoPreset[]).map((key) => {
            const preset = DEMO_PRESET_USERS[key];
            const isActive = appUser?.uid === preset.user.uid;
            return (
              <button
                key={key}
                onClick={() => loginAsDemoUser(key)}
                className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between text-left cursor-pointer ${
                  isActive
                    ? 'border-[#FF7300] bg-[#FF7300]/10 border-b-4 shadow-md'
                    : 'border-zinc-200 bg-zinc-50 hover:bg-white border-b-4 border-b-zinc-300 active:translate-y-0.5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{preset.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-zinc-800">{preset.label}</span>
                      {isActive && (
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FF7300] text-black">
                          ACTIVO
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-500 block line-clamp-1">
                      {preset.description}
                    </span>
                  </div>
                </div>
                <span className="text-[8px] font-black font-mono uppercase px-2 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-600 shrink-0">
                  {preset.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STREAK ALTAR (Duolingo Style Focus) */}
      <section className="relative flex flex-col items-center justify-center py-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#FF6B00]/10 rounded-full blur-[60px] pointer-events-none" />
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }} 
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-7xl mb-2 drop-shadow-[0_0_30px_rgba(255,107,0,0.4)]"
        >
          🔥
        </motion.div>
        <h2 className="text-6xl font-black italic tracking-tighter text-zinc-800 drop-shadow-md">
          {learnStreak}
        </h2>
        <span className="text-[12px] font-black uppercase text-zinc-500 tracking-[0.2em] mt-1">Días de Racha</span>
      </section>

      {/* Stats Grid Minimal */}
      <div className="grid grid-cols-2 gap-3 px-2">
        {[
          { label: 'Tactical Score', value: tacticalStreak, color: '#fff' },
          { label: 'Total XP', value: stats.xp, color: '#fff' },
        ].map((stat, i) => (
          <div key={i} className="bg-white shadow-sm p-5 rounded-3xl flex flex-col items-center justify-center text-center relative">
            <p className="text-[10px] font-bold uppercase text-zinc-500 mb-1 leading-none tracking-widest">{stat.label}</p>
            <p className="font-black text-3xl text-zinc-800">
              {stat.value}
            </p>
          </div>
        ))}
      </div>



      {/* Business Health Radar */}
      <section className="bg-white shadow-sm rounded-3xl p-6 relative overflow-hidden">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-800/50 mb-6 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-[#00E5FF]" />
          Vector Analysis
        </h3>
        <div className="h-64 -mx-6 relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={healthData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#00E5FF', fontSize: 10, fontWeight: 900, opacity: 0.8 }} />
              <Radar name="Health" dataKey="A" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          {healthData.every(d => d.A === 0) && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 backdrop-blur-sm rounded-3xl">
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Awaiting Tactical Data...</p>
            </div>
          )}
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-[var(--accent-main)] drop-shadow-[0_0_5px_rgba(204,255,0,0.4)]">Achievements</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar snap-x snap-mandatory">
          {[
            { icon: '🔥', label: '7 Day Streak' },
            { icon: '📚', label: 'First Book' },
            { icon: '💎', label: 'Offer Master' },
            { icon: '🤝', label: 'Networker' },
          ].map((badge, i) => (
            <div key={i} className="flex-shrink-0 w-24 h-24 bg-white shadow-sm rounded-3xl flex flex-col items-center justify-center text-center p-2 snap-center relative before:absolute before:inset-0 before:bg-zinc-50 before:rounded-3xl hover:-translate-y-1 transition-transform">
              <span className="text-3xl mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{badge.icon}</span>
              <span className="text-[9px] font-black uppercase leading-tight text-zinc-500">{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* TIGER CONSISTENCY MATRIX & CALENDAR AUDITOR */}
      <section className="bg-white shadow-sm rounded-3xl p-6 relative overflow-hidden text-center">
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full blur-[60px] bg-cyan-500/5 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            Consistencia Espacial
          </h3>
          <span className="text-[7px] font-mono font-black text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded px-1.5 py-0.5 uppercase tracking-widest">
            STREAK AUDITOR
          </span>
        </div>

        <p className="text-[10px] text-zinc-500 font-semibold mb-6 leading-relaxed text-left">
          Haz clic en cualquier día del calendario para auditar tu consistencia real, ver tareas completadas, verificar el estado de T1GER y registrar tus notas de aprendizaje diarias.
        </p>

        {/* The Grid */}
        <div className="grid grid-cols-7 gap-2.5 max-w-sm mx-auto mb-2">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
            <span key={idx} className="text-[8px] font-black font-mono text-zinc-600 text-center uppercase">{day}</span>
          ))}

          {(() => {
            const list = [];
            for (let i = 27; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              list.push(d.toISOString().split('T')[0]);
            }
            return list.map((dateStr) => {
              const comp = getDayCompletions(dateStr);
              let styleClass = 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-200';
              
              if (comp.both) {
                styleClass = 'border-cyan-400/30 text-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.2)] bg-cyan-500/10';
              } else if (comp.learn) {
                styleClass = 'border-[#FF7300]/30 text-[#FF7300] shadow-[0_0_8px_rgba(204,255,0,0.15)] bg-[#FF7300]/5';
              } else if (comp.tactical) {
                styleClass = 'border-[#FF6B00]/30 text-[#FF6B00] shadow-[0_0_8px_rgba(255,107,0,0.15)] bg-[#FF6B00]/5';
              } else if (comp.rest) {
                styleClass = 'border-blue-400/20 text-blue-400/50 bg-blue-500/5';
              } else {
                styleClass = 'border-red-500/10 text-red-500/40 bg-red-500/5';
              }

              const isSelected = selectedAuditDate === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedAuditDate(isSelected ? null : dateStr)}
                  className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center relative cursor-pointer active:scale-90 transition-all ${styleClass} ${
                    isSelected ? 'ring-2 ring-white scale-105 border-white' : ''
                  }`}
                >
                  <span className="text-[9px] font-black font-mono leading-none">
                    {new Date(dateStr + 'T00:00:00').getDate()}
                  </span>
                  {/* Miniature Dots Indicators */}
                  <div className="flex gap-0.5 mt-1">
                    {comp.learn && <span className="w-1.5 h-1.5 rounded-full bg-[#FF7300]" />}
                    {comp.tactical && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />}
                    {comp.both && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                    {comp.rest && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                  </div>
                </button>
              );
            });
          })()}
        </div>

        {/* AUDITING DRAWER VIEW */}
        <AnimatePresence>
          {selectedAuditDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 border-t border-zinc-200 pt-5 space-y-4 text-left overflow-hidden"
            >
              {(() => {
                const comp = getDayCompletions(selectedAuditDate);
                const prettyDate = new Date(selectedAuditDate + 'T00:00:00').toLocaleDateString('es-ES', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                });
                
                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black uppercase text-zinc-800 tracking-tight">
                        Auditoría: {prettyDate}
                      </h4>
                      <span className="text-[7px] font-mono font-bold text-zinc-500 uppercase">
                        {selectedAuditDate}
                      </span>
                    </div>

                    {/* Quick Stats list */}
                    <div className="grid grid-cols-2 gap-3 text-[9px] font-mono text-zinc-500">
                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                        <span className="text-zinc-600 block uppercase font-bold text-[8px]">Mascota T1GER</span>
                        <span className="text-zinc-800 font-bold">
                          {comp.both ? '🦁 PREDATOR MODE (Activo)' : comp.rest ? '💤 Descansando' : '🐾 Entrenando'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                        <span className="text-zinc-600 block uppercase font-bold text-[8px]">Completitud</span>
                        <span className="text-[#00E5FF] font-bold">
                          {comp.both ? '100% Excelente' : comp.completed ? '50% En Proceso' : '0% Fallado'}
                        </span>
                      </div>
                    </div>

                    {/* Completed tasks list */}
                    <div className="space-y-2">
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 ml-1">
                        Tareas Completadas
                      </span>
                      <div className="p-3 rounded-xl bg-white border border-zinc-200 space-y-1.5 text-[10px]">
                        {comp.tasks && comp.tasks.length > 0 ? (
                          comp.tasks.map((taskName: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-zinc-500">
                              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                              <span className="uppercase font-bold tracking-tight">{taskName}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-zinc-600 italic">No se registraron tareas en este ciclo.</p>
                        )}
                      </div>
                    </div>

                    {/* Free Text Audit reflection log */}
                    <div className="space-y-2">
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 ml-1">
                        Bitácora del Fundador & Reflexión de Productividad
                      </span>
                      <textarea
                        value={reflectionText}
                        onChange={(e) => setReflectionText(e.target.value)}
                        placeholder="Escribe por qué fallaste o qué lograste hoy en tu negocio. Esta bitácora te mantendrá honesto consigo mismo..."
                        className="w-full bg-white border border-zinc-200 rounded-2xl p-4 text-xs font-semibold focus:outline-none focus:border-cyan-400 focus:bg-cyan-950/5 min-h-[90px] transition-all text-zinc-800 placeholder-zinc-700 leading-relaxed"
                      />
                    </div>

                    <button
                      onClick={handleSaveReflection}
                      className="w-full py-4.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-[10px] uppercase tracking-widest shadow-lg shadow-cyan-400/25 active:translate-y-[2px] transition-all cursor-pointer"
                    >
                      Guardar Bitácora
                    </button>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Coaching History */}
      <section className="bg-white shadow-sm rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-[var(--accent-main)]" />
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">Mission Logs</h3>
        </div>
        <div className="space-y-4">
          {sessions.length > 0 ? sessions.map((session, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all cursor-pointer group">
              <div>
                <p className="text-sm font-bold text-zinc-200">{session.summary || 'Coaching Session'}</p>
                <p className="text-[10px] text-[var(--accent-main)] font-bold uppercase tracking-widest">{new Date(session.timestamp?.seconds * 1000).toLocaleDateString()}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-800 transition-colors group-hover:translate-x-1" />
            </div>
          )) : (
            <p className="text-xs text-zinc-500 font-bold italic">No logs detected in the T1GER Engine.</p>
          )}
        </div>
      </section>

      {/* Customization & Settings */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
           <Settings className="w-4 h-4 text-zinc-600" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">System Preferences</h3>
        </div>

        <div className="bg-white shadow-sm rounded-[2rem] p-6 space-y-8 shadow-sm">
          {/* Goal Setting */}
          <div className="space-y-3">
            <label className="block text-[9px] font-black uppercase text-zinc-600 tracking-widest ml-1">Current Directive (90D Goal)</label>
            <div className="relative group">
              <input
                type="text"
                defaultValue={appUser?.goal}
                onBlur={(e) => updateAppUser({ goal: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className="w-full bg-white border border-zinc-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-accent/40 focus:bg-accent/[0.03] transition-all text-zinc-800 placeholder-zinc-800"
                placeholder="What is your primary objective?"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Sparkles className="w-4 h-4 text-accent/40" />
              </div>
            </div>
          </div>

          {/* Niche Selection */}
          <div className="space-y-3">
            <label className="block text-[9px] font-black uppercase text-zinc-600 tracking-widest ml-1">Operational Niche</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'entrepreneur', label: 'CEO/Founder', icon: '🚀' },
                { id: 'creativity', label: 'Creator', icon: '🎨' },
                { id: 'fitness', label: 'Athlete', icon: '⚡' },
                { id: 'investor', label: 'Capitalist', icon: '💰' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => updateAppUser({ niche: item.id })}
                  className={`p-4 rounded-2xl border flex flex-col gap-2 transition-all active:scale-95 ${
                    appUser?.niche === item.id 
                      ? 'bg-white shadow-sm-accent border-accent/30 shadow-sm' 
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className={`font-black text-[10px] uppercase tracking-tight ${appUser?.niche === item.id ? 'text-zinc-800' : ''}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Predator Profile Visibility */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
             <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-tight text-zinc-800">Predator Profile</p>
                <p className="text-[9px] font-medium text-zinc-500 uppercase">Visible on Global Leaderboards</p>
             </div>
             <button 
               onClick={() => updateAppUser({ isPro: !appUser?.isPro })} // Reusing isPro as a mock for public toggle if needed
               className={`w-12 h-6 rounded-full transition-all relative ${appUser?.isPro ? 'bg-accent shadow-sm' : 'bg-zinc-800'}`}
             >
                <motion.div 
                  animate={{ x: appUser?.isPro ? 26 : 2 }}
                  className={`absolute top-1 w-4 h-4 rounded-full shadow-md ${appUser?.isPro ? 'bg-white' : 'bg-zinc-500'}`} 
                />
             </button>
          </div>

          {/* Local-First Data Controls */}
          <div className="space-y-3 pt-4 border-t border-zinc-200">
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-tight text-zinc-800">Data Sovereignty</p>
              <p className="text-[9px] font-medium text-zinc-500 uppercase leading-relaxed">
                Export or restore your T1GER progress as portable JSON. Cloud sync stays optional.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => downloadT1gerDataExport(appUser || null, brainState)}
                className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-500 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50 hover:text-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </button>
              <label
                htmlFor={importInputId}
                className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-500 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50 hover:text-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Import JSON
              </label>
              <input
                id={importInputId}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(event) => {
                  handleImportT1gerData(event.target.files?.[0]);
                  event.currentTarget.value = '';
                }}
              />
            </div>
          </div>

          {/* Path Controls */}
          <div className="space-y-3 pt-4 border-t border-zinc-200">
            <button
              onClick={() => {
                if (window.confirm("¿Estás seguro de que deseas reiniciar tu cuenta a CERO? Esto borrará tu historial de lecciones, competencias, rachas y monedas en la nube para que puedas experimentar el onboarding de Duolingo desde el principio.")) {
                  resetBrain();
                  updateAppUser({
                    onboardingStep: 'identity',
                    onboardingComplete: false,
                    niche: 'none',
                    goal: '',
                    xp: 0,
                    level: 1,
                    streak: 0,
                    learningStyle: undefined,
                    experienceLevel: undefined,
                    ageRange: undefined
                  });
                  setActiveView('onboarding');
                }
              }}
              className="w-full p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-50 hover:text-zinc-800 transition-all flex items-center justify-center gap-3"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Recalibrate Learning Path (Reset Complete)
            </button>
            
            <button
              onClick={() => {
                if (window.confirm("WARNING: THIS WILL WIPE ALL LOCAL PROGRESS AND LOGS. ARE YOU SURE?")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="w-full p-5 rounded-2xl border border-red-500/10 bg-red-500/5 text-red-500/60 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500/10 hover:text-red-500 transition-all"
            >
              Nuke Protocol (Factory Reset)
            </button>
          </div>
        </div>
      </section>

      {/* --- DEV MODE ONLY CONTENT --- */}
      {isDevMode && (
        <div className="space-y-8 border-t border-red-500/20 pt-8 mt-8">
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-md border border-red-500/20">
              Developer Consoles Active
            </span>
          </div>

      {/* WEBHOOK & AUTOMATIONS CONSOLE (APIS ABIERTAS) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
           <Terminal className="w-4 h-4 text-[#00E5FF]" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00E5FF]">APIs Abiertas & Integración</h3>
        </div>

        <div className="bg-white shadow-sm rounded-[2rem] p-6 border-zinc-200 space-y-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-blue-500/10 border-b border-l border-zinc-200 rounded-bl-xl text-[8px] font-mono text-cyan-400 font-black uppercase tracking-wider">
            Webhooks Sandbox
          </div>

          <div className="space-y-1">
             <h4 className="text-xs font-black uppercase text-zinc-800 tracking-tight">Sincronizador Notion / Todoist</h4>
             <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
               Automatiza tu racha y misiones conectando tus herramientas diarias. Copia tu Webhook URL y simula pings reales de producción.
             </p>
          </div>

          {/* Service Selector Tabs */}
          <div className="flex bg-white border border-zinc-200 rounded-2xl p-1 gap-1">
            {['todoist', 'notion'].map((service) => (
              <button
                key={service}
                onClick={() => { setActiveService(service as any); setSimLog([]); }}
                className={`flex-1 py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeService === service 
                    ? 'bg-zinc-50 border border-zinc-200 text-zinc-800' 
                    : 'text-zinc-500 hover:text-zinc-500'
                }`}
              >
                {service === 'todoist' ? 'Todoist API' : 'Notion SDK'}
              </button>
            ))}
          </div>

          {/* Webhook URL Endpoint */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-inner">
            <div className="font-mono text-[9px] text-zinc-500 select-all truncate">
              {`https://api.t1ger.app/v1/webhooks/${appUser?.uid || 'user_id'}/${activeService}`}
            </div>
            <span className="text-[7px] font-mono font-black text-accent bg-accent/10 border border-accent/20 rounded px-1 py-0.5 uppercase tracking-wide flex-shrink-0">
              POST
            </span>
          </div>

          {/* Webhook trigger button */}
          <button
            onClick={handleSimulateWebhook}
            disabled={simulating}
            className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black text-[10px] uppercase tracking-widest shadow-lg shadow-cyan-500/25 active:translate-y-[2px] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {simulating ? (
              <>
                <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> Procesando Webhook...
              </>
            ) : (
              <>
                <Terminal className="w-3.5 h-3.5" /> Simular envío de Webhook
              </>
            )}
          </button>

          {/* Simulator Console Output */}
          {(simLog.length > 0 || simulating) && (
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-inner">
              <div className="bg-[#08080a] px-3.5 py-2 border-b border-zinc-200 flex items-center justify-between">
                <span className="text-[8px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                  Live Console Log
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <div className="p-4 font-mono text-[10px] text-zinc-500 min-h-[80px] leading-relaxed max-h-[220px] overflow-y-auto whitespace-pre-wrap select-text">
                {simLog.map((log, index) => (
                  <div key={index} className={log.includes('RECOMPENSA') ? 'text-accent font-bold' : log.includes('T1GER ENGINE') ? 'text-green-400 font-bold' : ''}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* DELPHI & BIRDBRAIN TELEMETRY CONSOLE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#FF6B00] animate-pulse" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF6B00]">Delphi & BirdBrain Console</h3>
          </div>
          <span className="text-[8px] font-mono font-black text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded px-1.5 py-0.5 uppercase tracking-widest animate-pulse">
            DUOLINGO ENGINE COPIED
          </span>
        </div>

        <div className="bg-white shadow-sm rounded-[2rem] p-6 border-zinc-200 space-y-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-[#FF6B00]/10 border-b border-l border-zinc-200 rounded-bl-xl text-[8px] font-mono text-[#FF6B00] font-black uppercase tracking-wider">
            Telemetry V2
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-black uppercase text-zinc-800 tracking-tight flex items-center gap-2">
              Adaptive Optimization Control
            </h4>
            <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
              Analiza cómo T1GER APP evalúa tu nivel latente de habilidad (BirdBrain IRT) y valida experimentos de retención (Delphi A/B Testing) para adaptar el aprendizaje como las grandes EdTech.
            </p>
          </div>

          {/* Console Tab Selector */}
          <div className="flex bg-white border border-zinc-200 rounded-2xl p-1 gap-1">
            {[
              { id: 'irt', label: 'BirdBrain IRT', icon: BrainCircuit },
              { id: 'ab', label: 'Delphi A/B Tests', icon: BarChart2 },
              { id: 'stream', label: 'Event Stream', icon: Terminal },
              { id: 'yaml', label: 'YAML Studio', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTelemetryTab(tab.id as any)}
                  className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTelemetryTab === tab.id 
                      ? 'bg-zinc-50 border border-zinc-200 text-zinc-800 shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-500'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT: BirdBrain IRT */}
          {activeTelemetryTab === 'irt' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    IRT 3PL PSYCHOMETRIC MODEL
                  </span>
                  <span className="text-[9px] font-mono font-bold text-accent">
                    P(X_i=1 | θ) = c_i + (1 - c_i) / (1 + e^-a_i(θ - d_i))
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    { name: 'Offer (Propuestas)', score: competencies.offer, d: 0.35, a: 1.24, c: 0.12 },
                    { name: 'Sales (Ventas)', score: competencies.sales, d: 0.52, a: 1.45, c: 0.08 },
                    { name: 'Marketing (Tracción)', score: competencies.marketing, d: 0.41, a: 1.10, c: 0.15 },
                    { name: 'Mindset (Psicología)', score: competencies.mindset, d: 0.22, a: 0.85, c: 0.20 },
                    { name: 'Operations (Procesos)', score: competencies.operations, d: 0.65, a: 1.62, c: 0.05 },
                  ].map((item, idx) => {
                    // Map score [0, 100] to theta [-3.0, 3.0]
                    const theta = (item.score / 100) * 6 - 3;
                    // Calculate probability of correct response based on 3PL IRT formula
                    const exponent = -item.a * (theta - item.d);
                    const prob = item.c + (1 - item.c) / (1 + Math.exp(exponent));
                    
                    return (
                      <div key={idx} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-zinc-800 uppercase tracking-tight">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-mono text-zinc-500">θ = {theta.toFixed(2)}</span>
                            <span className="text-[9px] font-mono font-black text-cyan-400 bg-cyan-400/5 px-1.5 py-0.5 rounded border border-cyan-400/10">
                              Prob. Éxito: {(prob * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        
                        {/* Progress line representing success probability */}
                        <div className="h-1.5 bg-white rounded-full overflow-hidden relative">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500" 
                            style={{ width: `${prob * 100}%` }}
                          />
                        </div>

                        {/* Model parameters grid */}
                        <div className="grid grid-cols-3 gap-1.5 text-[8px] font-mono text-zinc-500 uppercase">
                          <span>Dificultad (d_i): <b className="text-zinc-500 font-bold">{item.d}</b></span>
                          <span>Discriminación (a_i): <b className="text-zinc-500 font-bold">{item.a}</b></span>
                          <span>Adivinación (c_i): <b className="text-zinc-500 font-bold">{item.c}</b></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic recommendation box based on lowest score */}
              {(() => {
                const entries = Object.entries(competencies);
                const lowest = entries.reduce((min, curr) => curr[1] < min[1] ? curr : min, entries[0]);
                const compName = lowest[0].toUpperCase();
                
                return (
                  <div className="p-4.5 rounded-2xl bg-[#FF6B00]/5 border border-[#FF6B00]/10 flex gap-3.5 items-start">
                    <span className="text-xl">🎯</span>
                    <div className="space-y-1">
                      <h5 className="text-[10px] font-black font-mono text-[#FF6B00] uppercase tracking-wider">
                        Recomendación del Motor BirdBrain
                      </h5>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">
                        Tu habilidad latente estimada es baja en <b className="text-zinc-800 font-bold">{compName}</b> ({Math.round(lowest[1])}/100). BirdBrain ha recalibrado el banco de misiones para inyectar cuestionarios adaptativos de nivelación con una dificultad <b className="text-zinc-800 font-bold">d_i = 0.25</b> para garantizar tu confianza inicial y aprendizaje rápido.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB CONTENT: Delphi A/B Testing */}
          {activeTelemetryTab === 'ab' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-3">
                {[
                  {
                    id: 'onboarding',
                    title: 'Marketing Hook: First 2 Mins Value',
                    description: 'Duolingo-style "Immediate Value in First 2 Mins" Hook vs. Traditional Sign-up.',
                    metric: '2-Min Conversion Rate',
                    lift: '+22.4%',
                    pValue: '0.003 (Altamente Significativo)',
                    recommendation: 'Aplicar Hook A al 100% del tráfico orgánico.',
                  },
                  {
                    id: 'pomodoro',
                    title: 'Zen Focus: Gamma 40Hz Audio',
                    description: 'Ondas Binaurales Gamma 40Hz sintetizadas vs. Silencio absoluto en Focus Timer.',
                    metric: 'Duración Media de Foco',
                    lift: '+18.6%',
                    pValue: '0.012 (Significativo)',
                    recommendation: 'Habilitar ecualizador Gamma por defecto en el pomodoro.',
                  },
                  {
                    id: 'procrastination',
                    title: 'Gamification: Reward Decay Cap',
                    description: 'Penalización por procrastinación (límite de 20% diario) vs. Recompensas estáticas.',
                    metric: 'Tasa de Completitud de Tarea',
                    lift: '+15.2%',
                    pValue: '0.024 (Significativo)',
                    recommendation: 'Desplegar a nivel global para mitigar falsas retenciones.',
                  },
                ].map((exp) => (
                  <div key={exp.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3.5 hover:bg-zinc-50 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-black text-zinc-800 uppercase tracking-tight">{exp.title}</h4>
                        <p className="text-[9px] text-zinc-500 font-medium mt-0.5 leading-normal">{exp.description}</p>
                      </div>
                      <span className="text-[8px] font-mono font-black text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded px-1.5 py-0.5 uppercase tracking-wide">
                        {exp.lift} Lift
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[9px] border-t border-zinc-200 pt-3">
                      <div>
                        <span className="text-zinc-500 uppercase font-bold block text-[8px] tracking-wide">Métrica Evaluada</span>
                        <span className="text-zinc-500 font-semibold">{exp.metric}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 uppercase font-bold block text-[8px] tracking-wide">P-Value (Confianza)</span>
                        <span className="text-zinc-500 font-semibold font-mono">{exp.pValue}</span>
                      </div>
                    </div>

                    {/* Interactive Group Selector (Assign Yourself) */}
                    <div className="flex items-center justify-between bg-white border border-zinc-200 rounded-xl p-2 mt-2">
                      <span className="text-[8px] font-black font-mono text-zinc-500 uppercase tracking-widest">
                        Tu Grupo Asignado:
                      </span>
                      <div className="flex gap-1.5">
                        {['A', 'B'].map((group) => (
                          <button
                            key={group}
                            onClick={() => setSelectedGroup(prev => ({ ...prev, [exp.id]: group as any }))}
                            className={`px-3 py-1 rounded-lg text-[8px] font-black transition-all cursor-pointer ${
                              selectedGroup[exp.id] === group 
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-inner font-black' 
                                : 'text-zinc-500 hover:text-zinc-500'
                            }`}
                          >
                            Grupo {group}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-green-500/5 border border-green-500/10 text-[8px] font-mono text-green-400 leading-normal">
                      💡 <b>Recomendación Automatizada:</b> {exp.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: Event Stream Log */}
          {activeTelemetryTab === 'stream' && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-inner">
                <div className="bg-[#08080a] px-3.5 py-2.5 border-b border-zinc-200 flex items-center justify-between">
                  <span className="text-[8px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                    Live Telemetry Event Log
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                </div>
                
                <div className="p-4 font-mono text-[9px] text-zinc-500 min-h-[160px] leading-relaxed max-h-[260px] overflow-y-auto whitespace-pre-wrap select-text space-y-1 text-left">
                  {telemetryLogs.map((log, index) => {
                    let colorClass = '';
                    if (log.includes('TELEMETRY')) colorClass = 'text-cyan-400 font-bold';
                    else if (log.includes('BIRDBRAIN')) colorClass = 'text-green-400 font-bold';
                    else if (log.includes('IRT')) colorClass = 'text-purple-400';
                    else if (log.includes('DELPHI')) colorClass = 'text-[#FF6B00] font-bold';
                    else if (log.includes('MARKETING')) colorClass = 'text-yellow-400';
                    
                    return (
                      <div key={index} className={colorClass}>
                        {log}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center text-[8px] font-mono text-zinc-600 uppercase">
                <span>Buffer Size: 12 Events</span>
                <span>Active Connection: SECURE SECURE-WEB_SOCKET</span>
              </div>
            </div>
          )}

          {/* TAB CONTENT: YAML Course Studio */}
          {activeTelemetryTab === 'yaml' && (
            <div className="space-y-4 animate-fade-in text-left">
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase text-zinc-800 tracking-tight flex items-center gap-2">
                  LibreLingo Course Studio
                </h4>
                <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                  Crea o edita cursos usando la estructura modular YAML inspirada en el software open-source LibreLingo. El compilador de T1GER traducirá las especificaciones a objetos dinámicos.
                </p>
              </div>

              {/* Textarea code editor */}
              <div className="relative rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-inner flex flex-col focus-within:border-[var(--accent-main)] transition-colors">
                <div className="bg-[#0c0c0e] px-4 py-2 border-b border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--accent-main)] animate-pulse" />
                    <span className="text-[8px] font-mono text-zinc-500 font-black uppercase tracking-wider">
                      librelingo_course_definition.yaml
                    </span>
                  </div>
                  <span className="text-[8px] font-mono text-zinc-600">YAML Mode</span>
                </div>
                <textarea
                  value={yamlText}
                  onChange={(e) => {
                    setYamlText(e.target.value);
                    handleValidateYAML(e.target.value);
                  }}
                  rows={14}
                  className="w-full p-4 bg-transparent border-0 text-[10px] font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none resize-y"
                  style={{ tabSize: 2 }}
                />
              </div>

              {/* Status & Validation Message */}
              {compileError ? (
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex gap-3 text-red-400">
                  <span className="text-sm">⚠️</span>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-wider block mb-1">
                      Error de Compilación
                    </span>
                    <p className="text-[10px] font-semibold leading-relaxed text-red-300/90">
                      {compileError}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-3 flex gap-2.5 text-green-400">
                  <span className="text-xs">✅</span>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-wider block">
                      Sintaxis Compilada con Éxito
                    </span>
                    <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                      Estructura compatible cargada: {parsedLesson?.title || 'Sin título'} ({parsedLesson?.quizQuestions?.length || 0} preguntas).
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <button
                disabled={!!compileError}
                onClick={handlePlayYamlMission}
                className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-black bg-[var(--accent-main)] hover:bg-[var(--accent-main)]/90 shadow-[0_4px_0_0_rgba(163,204,0,0.8)] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
              >
                <Play className="w-4 h-4 fill-black text-black stroke-[3]" /> Compilar y Jugar 🚀
              </button>
            </div>
          )}
        </div>
      </section>
        </div>
      )}

      {/* Public Profile Preview */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
           <Users className="w-4 h-4 text-zinc-600" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Public Reputation</h3>
        </div>
        
        <div className="bg-white shadow-sm rounded-[2rem] p-6 border-accent/10 relative overflow-hidden">
           <div className="absolute top-0 right-0 px-3 py-1 bg-accent/10 border-b border-l border-zinc-200 rounded-bl-xl">
              <span className="text-[8px] font-black uppercase text-accent tracking-widest">Live Preview</span>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white border border-accent/30 flex items-center justify-center text-2xl shadow-sm shadow-accent/10">
                 {appUser?.displayName?.charAt(0) || '🐅'}
              </div>
              <div className="flex-1">
                 <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm uppercase tracking-tight text-zinc-800">{appUser?.displayName || 'Founder'}</span>
                    {appUser?.isFounder && <Crown className="w-3 h-3 text-amber-400" />}
                 </div>
                 <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                       <Sparkles className="w-2.5 h-2.5 text-accent" />
                       <span className="text-[9px] font-black text-zinc-500 uppercase">LVL {appUser?.level || 1}</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <Flame className="w-2.5 h-2.5 text-orange-500" />
                       <span className="text-[9px] font-black text-zinc-500 uppercase">{appUser?.streak || 0}D STREAK</span>
                    </div>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-sm font-black text-accent">{appUser?.xp || 0}</p>
                 <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Total XP</p>
              </div>
           </div>
           
           <p className="mt-4 text-[10px] text-zinc-500 italic font-medium leading-relaxed border-t border-zinc-200 pt-4">
              "Tactical objective: {appUser?.goal || 'Establishing dominant market position.'}"
           </p>
        </div>
      </section>

      {/* Legal & Account Deletion Compliance Section */}
      <section className="space-y-3 pt-4 border-t border-zinc-200">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FF7300]" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Legal & Privacidad (Play Store / App Store)</h3>
          </div>
          <span className="text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Compliant 2026
          </span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-4 space-y-2 shadow-sm">
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="w-full py-3 px-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-left font-bold text-xs text-zinc-700 flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-[#FF7300]" />
              <span>Política de Privacidad (GDPR / CCPA)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>

          <button
            onClick={() => setShowTermsModal(true)}
            className="w-full py-3 px-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-left font-bold text-xs text-zinc-700 flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Scale className="w-4 h-4 text-[#FF7300]" />
              <span>Términos de Servicio & Exención de Responsabilidad</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>

          <button
            onClick={handleConfirmDeleteAccount}
            className="w-full py-3 px-4 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-left font-bold text-xs text-red-700 flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>Eliminar mi Cuenta y Datos Permanentemente</span>
            </div>
            <span className="text-[9px] font-mono uppercase bg-red-200/80 text-red-900 px-2 py-0.5 rounded-full">Exigencia Google/Apple</span>
          </button>
        </div>
      </section>

      {/* Terminate Session */}
      <div className="pt-2">
        <button 
          onClick={logout}
          className="w-full bg-white shadow-sm p-5 rounded-3xl border border-red-200 hover:bg-red-50 flex items-center justify-between group transition-all cursor-pointer"
        >
          <div className="flex items-center gap-4 text-red-600">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-black text-sm uppercase tracking-widest">Cerrar Sesión</span>
          </div>
          <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-xl max-h-[85vh] overflow-y-auto"
            >
              <PrivacyPolicy onBack={() => setShowPrivacyModal(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms of Service Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-xl max-h-[85vh] overflow-y-auto"
            >
              <TermsOfService onBack={() => setShowTermsModal(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
