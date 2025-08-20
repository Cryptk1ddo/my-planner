import React, { useState, useEffect, useRef } from 'react';
import { Home, Timer, Wind, LayoutDashboard, Plus, MoreVertical, ChevronLeft, ChevronRight, Play, Pause, RefreshCw, Settings, BookOpen, BrainCircuit, ShieldAlert, Bot, Link as LinkIcon, User, BarChart2, Zap, Moon, Sun, Coffee, Droplets, Dumbbell, Users, Lock, Star, CheckCircle, XCircle, Tag, Share2, Brain, Library, Lightbulb, WifiOff, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';

// --- Gemini API Call Helper ---
const callGeminiAPI = async (prompt, retries = 3, delay = 1000) => {
  try {
    let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };
    const apiKey = ""; // Leave empty
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        console.warn(`Rate limited. Retrying in ${delay / 1000}s... (${retries} retries left)`);
        await new Promise(res => setTimeout(res, delay));
        return callGeminiAPI(prompt, retries - 1, delay * 2);
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      return result.candidates[0].content.parts[0].text;
    } else {
      console.error("Unexpected API response structure:", result);
      return "Sorry, I couldn't get a response. Please try again.";
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "An error occurred while contacting the AI. Please check the console.";
  }
};


// Mock Data with new color palette
const dailyPlanData = {
  wins: ['', '', ''],
  identity: "Today, I am focused and disciplined.",
  journal: "I'm grateful for the opportunity to improve and grow."
};

const eveningReviewData = {
    wins: ['', '', ''],
    improvement: '',
    stressLevel: 5,
    dopamineChecklist: {
        'No phone 1hr before bed': true,
        'Morning sunlight': true,
        'Meditation': false,
        'No late caffeine': true,
    }
};

const scheduleData = [
  { id: 1, time: '09:00', task: 'Deep Work: Project A', type: 'deep', duration: 90 },
  { id: 2, time: '10:30', task: 'Break', type: 'break', duration: 15 },
  { id: 3, time: '10:45', task: 'Admin: Emails & Calls', type: 'admin', duration: 45 },
  { id: 4, time: '11:30', task: 'Movement: Walk', type: 'movement', duration: 30 },
  { id: 5, time: '12:00', task: 'Deep Work: Project B', type: 'deep', duration: 120 },
  { id: 6, time: '14:00', task: 'Lunch', type: 'break', duration: 60 },
];

const taskTypeColors = {
  deep: 'bg-orange-600',
  admin: 'bg-orange-400',
  movement: 'bg-gray-600',
  break: 'bg-gray-700',
};

const dashboardData = {
  momentumScore: 88,
  focusStreaks: 12,
  dopamineScore: 75,
  workDistribution: [
    { name: 'Deep Work', value: 210, color: '#ea580c' }, // orange-600
    { name: 'Admin', value: 45, color: '#fb923c' }, // orange-400
    { name: 'Movement', value: 30, color: '#4b5563' }, // gray-600
  ],
  moodEnergy: [
    { day: 'Mon', mood: 7, energy: 8 },
    { day: 'Tue', mood: 6, energy: 7 },
    { day: 'Wed', mood: 8, energy: 9 },
    { day: 'Thu', mood: 7, energy: 8 },
    { day: 'Fri', mood: 9, energy: 9 },
  ]
};

const breathworkProtocols = [
    { id: 'box', name: 'Box Breathing', duration: '4-4-4-4', description: 'Focus & Reset', icon: Zap, color: 'text-orange-400' },
    { id: 'coherence', name: 'Coherence Breathing', duration: '6:6', description: 'Stress Regulation', icon: Droplets, color: 'text-gray-300' },
    { id: 'sleep', name: '4-7-8 Downshift', duration: '4-7-8', description: 'Sleep Protocol', icon: Moon, color: 'text-orange-500' },
];

const notesData = {
    insights: [
        { id: 1, title: "The Power of Single-Tasking", content: "Realized today during my deep work session that switching tasks, even for a moment, completely derails my focus. The cost of context switching is higher than I thought.", tags: ['focus', 'productivity'] },
        { id: 2, title: "Morning Sunlight is a Game Changer", content: "Getting 10 minutes of sunlight right after waking up has noticeably improved my energy levels throughout the day. It's a non-negotiable now.", tags: ['health', 'routine'] },
    ],
    swipeFile: [
        { id: 1, quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", source: "Aristotle", tags: ['philosophy', 'habits'] },
        { id: 2, quote: "The amateur waits for inspiration. The rest of us just get up and go to work.", source: "Stephen King", tags: ['creativity', 'work-ethic'] },
    ]
};

const knowledgeHubData = [
    { id: 1, title: "Dopamine Mastery", category: "Neuroscience", icon: BrainCircuit, color: "text-orange-400", summary: "Understand and manage your dopamine levels to improve motivation, focus, and satisfaction.", details: ["Delay gratification; avoid quick dopamine hits.", "Set and achieve meaningful goals.", "Use intermittent rewards for tasks.", "Practice dopamine detox days."] },
    { id: 2, title: "Sleep Optimization", category: "Recovery", icon: Moon, color: "text-gray-300", summary: "Engineer your environment and habits for deep, restorative sleep to maximize daily performance.", details: ["Consistent wake-up time.", "Cool, dark, and quiet room.", "No screens 90 minutes before bed.", "Get morning sunlight exposure."] },
    { id: 3, title: "Digital Minimalism", category: "Focus", icon: WifiOff, color: "text-orange-500", summary: "Curate your digital life to serve your goals, not distract from them.", details: ["Turn off all non-essential notifications.", "Schedule specific times for email and social media.", "Use grayscale mode on your phone.", "Delete apps you don't truly need."] },
    { id: 4, title: "Focus Nutrition", category: "Health", icon: Coffee, color: "text-orange-300", summary: "Learn which foods and nutrients boost cognitive function and sustained energy.", details: ["Prioritize healthy fats (avocado, nuts).", "Stay hydrated with water and electrolytes.", "Limit sugar and processed foods.", "Consider L-Theanine with caffeine."] },
];

// Re-ordered Components for correct initialization
const Header = () => (
  <header className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm border-b border-gray-900 z-10">
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h1 className="text-xl font-bold tracking-tight text-gray-100">Parabola</h1>
    </div>
    <div className="flex items-center space-x-4">
      <button className="text-gray-500 hover:text-white transition-colors"><Bot size={20} /></button>
      <button className="text-gray-500 hover:text-white transition-colors"><Settings size={20} /></button>
    </div>
  </header>
);

const BottomNav = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'planner', icon: Home, label: 'Planner' },
    { id: 'pomodoro', icon: Timer, label: 'Focus' },
    { id: 'capture', icon: BookOpen, label: 'Capture' },
    { id: 'breathwork', icon: Wind, label: 'Breath' },
    { id: 'library', icon: Library, label: 'Library' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Stats' },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-gray-900 flex justify-around p-2 max-w-md mx-auto rounded-b-2xl">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`relative flex flex-col items-center justify-center w-14 h-16 rounded-lg transition-all duration-300 ${activeTab === item.id ? 'text-orange-400' : 'text-gray-500 hover:bg-gray-800'}`}
        >
          <item.icon size={24} />
          <span className="text-xs mt-1">{item.label}</span>
          {activeTab === item.id && (
            <motion.div
              layoutId="active-indicator"
              className="absolute bottom-0 h-1 w-8 bg-orange-400 rounded-full"
            />
          )}
        </button>
      ))}
    </nav>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-900/50 border border-gray-800 rounded-xl p-4 ${className}`}>
    {children}
  </div>
);

const PlannerScreen = () => {
    // Morning Ritual State
    const [morningWins, setMorningWins] = useState(dailyPlanData.wins);
    const [identity, setIdentity] = useState(dailyPlanData.identity);
    const [journal, setJournal] = useState(dailyPlanData.journal);
    const [isGeneratingMorning, setIsGeneratingMorning] = useState(false);
    
    // Evening Review State
    const [eveningWins, setEveningWins] = useState(eveningReviewData.wins);
    const [improvement, setImprovement] = useState(eveningReviewData.improvement);
    const [stressLevel, setStressLevel] = useState(eveningReviewData.stressLevel);
    const [dopamineChecklist, setDopamineChecklist] = useState(eveningReviewData.dopamineChecklist);
    const [isGeneratingEvening, setIsGeneratingEvening] = useState(false);
    const [aiAdvice, setAiAdvice] = useState('');

    const handleGenerateMorningRitual = async () => {
        const goal = prompt("What is your main goal for today?");
        if (!goal) return;
        
        setIsGeneratingMorning(true);
        const promptText = `My main goal today is: "${goal}". Based on this, generate a JSON object with two keys: "wins" (an array of 3 specific, actionable key wins for the day) and "identity" (a short, powerful core identity statement for today). Example format: {"wins": ["Win 1", "Win 2", "Win 3"], "identity": "Today, I am..."}`;
        const response = await callGeminiAPI(promptText);
        try {
            const parsed = JSON.parse(response);
            if (parsed.wins && parsed.identity) {
                setMorningWins(parsed.wins);
                setIdentity(parsed.identity);
            }
        } catch (e) {
            console.error("Failed to parse AI response:", e);
            alert("The AI response was not in the correct format. Please try again.");
        }
        setIsGeneratingMorning(false);
    };
    
    const handleGenerateEveningAdvice = async () => {
        setIsGeneratingEvening(true);
        setAiAdvice('');
        const promptText = `Here's my evening review. My wins today were: "${eveningWins.join(', ')}". The one thing I want to improve is: "${improvement}". Based on this, give me one small, actionable "1% improvement" suggestion for tomorrow. Keep it concise and encouraging.`;
        const response = await callGeminiAPI(promptText);
        setAiAdvice(response);
        setIsGeneratingEvening(false);
    };

    const handleChecklistChange = (key) => {
        setDopamineChecklist(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-lg font-semibold mb-3 text-orange-400">Morning Priming Ritual</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-400">3 Key Wins for Today</label>
                        {morningWins.map((win, index) => (
                             <input key={index} type="text" value={win} onChange={(e) => { const newWins = [...morningWins]; newWins[index] = e.target.value; setMorningWins(newWins); }} placeholder={`Win #${index + 1}`} className="w-full bg-gray-800 rounded-md p-2 mt-1 focus:outline-none text-gray-200" />
                        ))}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-400">Today’s Core Identity</label>
                        <input type="text" value={identity} onChange={(e) => setIdentity(e.target.value)} className="w-full bg-gray-800 rounded-md p-2 mt-1 focus:outline-none text-gray-200" />
                    </div>
                    <button onClick={handleGenerateMorningRitual} disabled={isGeneratingMorning} className="w-full flex items-center justify-center space-x-2 bg-orange-600/20 text-orange-300 hover:bg-orange-600/40 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                        <Sparkles size={16} />
                        <span>{isGeneratingMorning ? 'Generating...' : '✨ Suggest Wins & Identity'}</span>
                    </button>
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold text-orange-400">Today's Plan</h2>
                    <button className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-full">
                        <Plus size={16} />
                    </button>
                </div>
                <div className="space-y-2">
                    {scheduleData.map(item => (
                        <div key={item.id} className={`flex items-center p-3 rounded-lg ${taskTypeColors[item.type]}`}>
                            <div className="w-16 text-sm font-mono text-white/90">{item.time}</div>
                            <div className="flex-1 font-semibold text-white">{item.task}</div>
                            <div className="text-xs text-white/80">{item.duration}m</div>
                            <button className="ml-3 text-white/80"><MoreVertical size={16} /></button>
                        </div>
                    ))}
                </div>
            </Card>

            <Card>
                <h2 className="text-lg font-semibold mb-3 text-orange-400">Evening Review</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-400">3 Wins from Today</label>
                        {eveningWins.map((win, index) => (
                            <input key={index} type="text" value={win} onChange={(e) => { const newWins = [...eveningWins]; newWins[index] = e.target.value; setEveningWins(newWins); }} placeholder={`Win #${index + 1}`} className="w-full bg-gray-800 rounded-md p-2 mt-1 focus:outline-none text-gray-200" />
                        ))}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-400">1 Thing to Improve</label>
                        <input type="text" value={improvement} onChange={(e) => setImprovement(e.target.value)} placeholder="e.g., Started deep work faster" className="w-full bg-gray-800 rounded-md p-2 mt-1 focus:outline-none text-gray-200" />
                    </div>
                    <button onClick={handleGenerateEveningAdvice} disabled={isGeneratingEvening} className="w-full flex items-center justify-center space-x-2 bg-orange-600/20 text-orange-300 hover:bg-orange-600/40 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                        <Sparkles size={16} />
                        <span>{isGeneratingEvening ? 'Getting Advice...' : '✨ Get 1% Improvement Advice'}</span>
                    </button>
                    {aiAdvice && <div className="p-3 bg-gray-800 rounded-md text-sm text-gray-300 italic">{aiAdvice}</div>}
                </div>
            </Card>
        </div>
    );
};

const PomodoroScreen = () => {
    const intervals = { '25/5': 25, '50/10': 50, '90/20': 90 };
    const [mode, setMode] = useState('25/5');
    const [timeLeft, setTimeLeft] = useState(intervals[mode] * 60);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        setIsActive(false);
        setTimeLeft(intervals[mode] * 60);
    }, [mode]);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (!isActive && timeLeft !== 0) {
            clearInterval(interval);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(intervals[mode] * 60);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((intervals[mode] * 60 - timeLeft) / (intervals[mode] * 60)) * 100;

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-8">
            <div className="flex space-x-2">
                {Object.keys(intervals).map(key => (
                    <button key={key} onClick={() => setMode(key)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${mode === key ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                        {key}
                    </button>
                ))}
            </div>

            <div className="relative w-64 h-64 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="120" stroke="#1f2937" strokeWidth="10" fill="transparent" />
                    <motion.circle cx="50%" cy="50%" r="120" stroke="#f97316" strokeWidth="10" fill="transparent" strokeDasharray="753.98" strokeDashoffset={753.98 - (753.98 * progress) / 100} strokeLinecap="round" initial={{ strokeDashoffset: 753.98 }} animate={{ strokeDashoffset: 753.98 - (753.98 * progress) / 100 }} transition={{ duration: 1, ease: "linear" }} />
                </svg>
                <div className="text-center">
                    <div className="text-6xl font-mono font-bold tracking-tighter text-gray-100">{formatTime(timeLeft)}</div>
                    <div className="text-gray-500 text-sm">Deep Work</div>
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <button onClick={resetTimer} className="bg-gray-800 p-4 rounded-full text-gray-400 hover:bg-gray-700 transition-colors"><RefreshCw size={24} /></button>
                <button onClick={toggleTimer} className="bg-orange-600 w-20 h-20 rounded-full text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-700 transition-colors">{isActive ? <Pause size={32} /> : <Play size={32} />}</button>
                <button className="bg-gray-800 p-4 rounded-full text-gray-400 hover:bg-gray-700 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg></button>
            </div>
        </div>
    );
};

const CaptureScreen = () => {
    const [quickDump, setQuickDump] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summary, setSummary] = useState('');

    const handleSummarize = async () => {
        setIsSummarizing(true);
        setSummary('');
        const textToSummarize = `Quick Dump:\n${quickDump}\n\nInsight Journal:\n${notesData.insights.map(n => `Title: ${n.title}\nContent: ${n.content}`).join('\n\n')}`;
        const promptText = `Summarize the following notes and thoughts into a few key takeaways:\n\n${textToSummarize}`;
        const response = await callGeminiAPI(promptText);
        setSummary(response);
        setIsSummarizing(false);
    };

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-lg font-semibold mb-3 text-orange-400">Quick Dump</h2>
                <textarea value={quickDump} onChange={(e) => setQuickDump(e.target.value)} rows="3" placeholder="Capture any thought, task, or idea..." className="w-full bg-gray-800 rounded-md p-2 focus:outline-none resize-none placeholder-gray-500 text-gray-200"></textarea>
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-3"><h2 className="text-lg font-semibold text-orange-400">Insight Journal</h2><button className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full"><Plus size={16} /></button></div>
                <div className="space-y-3">{notesData.insights.map(note => (<div key={note.id} className="bg-black/20 p-3 rounded-lg border border-gray-800"><h3 className="font-semibold text-gray-100">{note.title}</h3><p className="text-sm text-gray-400 mt-1">{note.content}</p></div>))}</div>
            </Card>
            
             <Card>
                <button onClick={handleSummarize} disabled={isSummarizing} className="w-full flex items-center justify-center space-x-2 bg-orange-600/20 text-orange-300 hover:bg-orange-600/40 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                    <Sparkles size={16} />
                    <span>{isSummarizing ? 'Summarizing...' : '✨ AI Summary'}</span>
                </button>
                {summary && <div className="mt-4 p-3 bg-gray-800 rounded-md text-sm text-gray-300">{summary}</div>}
            </Card>
        </div>
    );
};

const BreathworkScreen = ({ openModal }) => (
    <div className="space-y-4">
        <h2 className="text-xl font-semibold text-orange-400">Breathwork Booster</h2>
        <p className="text-gray-400">Short, scientifically designed breathing sequences to enhance your mental state.</p>
        {breathworkProtocols.map(p => (
            <motion.div key={p.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="flex items-center space-x-4 cursor-pointer hover:border-orange-500 transition-colors" onClick={() => openModal(p.id)}>
                    <p.icon size={32} className={p.color} />
                    <div className="flex-1"><h3 className="font-semibold text-white">{p.name}</h3><p className="text-sm text-gray-400">{p.description}</p></div>
                    <div className="text-right"><p className="font-mono text-lg text-white">{p.duration}</p><p className="text-xs text-gray-500">Protocol</p></div>
                </Card>
            </motion.div>
        ))}
    </div>
);

const KnowledgeHubScreen = ({ openModal }) => (
    <div className="space-y-4">
        <h2 className="text-xl font-semibold text-orange-400">Knowledge Hub</h2>
        <p className="text-gray-400">Your private vault of high-performance tools and protocols.</p>
        <div className="grid grid-cols-2 gap-4">
            {knowledgeHubData.map(p => (
                <motion.div key={p.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => openModal(p)}>
                    <Card className="flex flex-col items-start space-y-2 cursor-pointer h-full hover:border-orange-500 transition-colors">
                        <p.icon size={28} className={p.color} /><div className="flex-1"><h3 className="font-semibold text-white">{p.title}</h3><p className="text-xs text-gray-500">{p.category}</p></div>
                    </Card>
                </motion.div>
            ))}
        </div>
    </div>
);

const ProtocolDetailModal = ({ protocol, closeModal }) => {
    const [isAsking, setIsAsking] = useState(false);
    const [aiResponse, setAiResponse] = useState('');

    const handleAskCompanion = async () => {
        setIsAsking(true);
        setAiResponse('');
        const promptText = `Explain the core principles of the "${protocol.title}" protocol in a simple, conversational way. Focus on the 'why' behind the key actions.`;
        const response = await callGeminiAPI(promptText);
        setAiResponse(response);
        setIsAsking(false);
    };

    return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center z-50 p-4">
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-start justify-between mb-4">
                <div><h2 className="text-xl font-bold text-gray-100">{protocol.title}</h2><p className={`text-sm font-medium ${protocol.color}`}>{protocol.category}</p></div>
                <button onClick={closeModal} className="text-gray-500 hover:text-white"><XCircle size={28} /></button>
            </div>
            <p className="text-gray-300 mb-4">{protocol.summary}</p>
            <div className="space-y-2"><h3 className="font-semibold text-gray-400">Key Actions:</h3><ul className="list-disc list-inside space-y-1 text-gray-300">{protocol.details.map((item, index) => (<li key={index}>{item}</li>))}</ul></div>
            <button onClick={handleAskCompanion} disabled={isAsking} className="mt-6 w-full flex items-center justify-center space-x-2 bg-orange-600/20 text-orange-300 hover:bg-orange-600/40 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                <Sparkles size={16} />
                <span>{isAsking ? 'Thinking...' : '✨ Ask AI Companion'}</span>
            </button>
            {aiResponse && <div className="mt-4 p-3 bg-gray-800 rounded-md text-sm text-gray-300">{aiResponse}</div>}
        </motion.div>
    </motion.div>
    );
};


const BreathworkModal = ({ protocolId, closeModal }) => {
    const protocol = breathworkProtocols.find(p => p.id === protocolId);
    const [instruction, setInstruction] = useState('Get Ready...');
    const [cycle, setCycle] = useState(0);

    const timings = { box: [{ instruction: 'Breathe In', duration: 4 }, { instruction: 'Hold', duration: 4 }, { instruction: 'Breathe Out', duration: 4 }, { instruction: 'Hold', duration: 4 },], coherence: [{ instruction: 'Breathe In', duration: 6 }, { instruction: 'Breathe Out', duration: 6 },], sleep: [{ instruction: 'Breathe In', duration: 4 }, { instruction: 'Hold', duration: 7 }, { instruction: 'Breathe Out', duration: 8 },], };
    const sequence = timings[protocol.id];

    useEffect(() => { let stepIndex = 0; let timer; const runSequence = () => { const step = sequence[stepIndex]; setInstruction(step.instruction); timer = setTimeout(() => { stepIndex = (stepIndex + 1) % sequence.length; if (stepIndex === 0) setCycle(c => c + 1); runSequence(); }, step.duration * 1000); }; const startTimeout = setTimeout(runSequence, 2000); return () => { clearTimeout(startTimeout); clearTimeout(timer); }; }, [protocol.id, sequence]);
    const animationProps = { 'Breathe In': { scale: 1.2, transition: { duration: sequence.find(s=>s.instruction==='Breathe In')?.duration || 4, ease: "easeInOut" } }, 'Breathe Out': { scale: 1, transition: { duration: sequence.find(s=>s.instruction==='Breathe Out')?.duration || 4, ease: "easeInOut" } }, 'Hold': { scale: 'inherit', transition: { duration: 0.5 } }, };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center z-50 p-4">
            <div className="absolute top-4 right-4"><button onClick={closeModal} className="text-gray-500 hover:text-white"><XCircle size={28} /></button></div>
            <div className="text-center mb-8"><h2 className="text-2xl font-bold text-gray-100">{protocol.name}</h2><p className="text-gray-400">{protocol.description}</p></div>
            <div className="w-64 h-64 rounded-full border-2 border-orange-500/50 flex items-center justify-center"><motion.div className="w-48 h-48 bg-orange-500 rounded-full" animate={animationProps[instruction] || {}} /></div>
            <div className="text-center mt-8"><p className="text-4xl font-semibold tracking-widest uppercase text-gray-100">{instruction}</p><p className="text-gray-400 mt-2">Cycle: {cycle + 1}</p></div>
        </motion.div>
    );
};

const DashboardScreen = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4 text-center">
            <Card><p className="text-3xl font-bold text-orange-400">{dashboardData.momentumScore}</p><p className="text-xs text-gray-400">Momentum</p></Card>
            <Card><p className="text-3xl font-bold text-gray-200">{dashboardData.focusStreaks}</p><p className="text-xs text-gray-400">Focus Streak</p></Card>
            <Card><p className="text-3xl font-bold text-orange-300">{dashboardData.dopamineScore}%</p><p className="text-xs text-gray-400">Dopamine Score</p></Card>
        </div>
        <Card>
            <h3 className="text-lg font-semibold mb-3 text-orange-400">Work Distribution</h3><div className="h-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={dashboardData.workDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} fill="#8884d8" paddingAngle={5}>{dashboardData.workDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '0.5rem' }} /></PieChart></ResponsiveContainer></div>
        </Card>
        <Card>
            <h3 className="text-lg font-semibold mb-3 text-orange-400">Mood & Energy Trends</h3><div className="h-48"><ResponsiveContainer width="100%" height="100%"><LineChart data={dashboardData.moodEnergy} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><XAxis dataKey="day" stroke="#4b5563" fontSize={12} /><YAxis stroke="#4b5563" fontSize={12} /><Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '0.5rem' }} /><Line type="monotone" dataKey="mood" stroke="#f97316" strokeWidth={2} name="Mood" /><Line type="monotone" dataKey="energy" stroke="#9ca3af" strokeWidth={2} name="Energy" /></LineChart></ResponsiveContainer></div>
        </Card>
    </div>
);

// Main App Component
export default function App() {
  const [activeTab, setActiveTab] = useState('planner');
  const [showModal, setShowModal] = useState(null); // Can be 'breathwork' or 'protocol'
  const [modalData, setModalData] = useState(null);

  const openModal = (type, data) => {
    setModalData(data);
    setShowModal(type);
  };

  const closeModal = () => {
    setShowModal(null);
    setModalData(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'planner': return <PlannerScreen />;
      case 'pomodoro': return <PomodoroScreen />;
      case 'capture': return <CaptureScreen />;
      case 'breathwork': return <BreathworkScreen openModal={(data) => openModal('breathwork', data)} />;
      case 'library': return <KnowledgeHubScreen openModal={(data) => openModal('protocol', data)} />;
      case 'dashboard': return <DashboardScreen />;
      default: return <PlannerScreen />;
    }
  };

  return (
    <div className="bg-black text-gray-200 font-sans antialiased h-screen w-full flex flex-col max-w-md mx-auto border border-gray-900 rounded-2xl overflow-hidden shadow-2xl">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 pb-24 scrollbar-hide">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      <AnimatePresence>
        {showModal === 'breathwork' && <BreathworkModal protocolId={modalData} closeModal={closeModal} />}
        {showModal === 'protocol' && <ProtocolDetailModal protocol={modalData} closeModal={closeModal} />}
      </AnimatePresence>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
