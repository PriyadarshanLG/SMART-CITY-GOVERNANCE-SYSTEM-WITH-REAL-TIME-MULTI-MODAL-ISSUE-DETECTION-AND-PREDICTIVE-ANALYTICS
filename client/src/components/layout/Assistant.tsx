import { useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Globe2,
  Bot,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  FilePlus2,
  Search,
  Landmark,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import { GovernmentEmblem } from './GovernmentEmblem';

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  options?: ReadonlyArray<{ label: string; action: string }>;
}

const initialBotMessages = {
  en: {
    text: 'Namaste! I am Sahayak (सहायक), your Official Smart City Virtual Citizen Assistant. How may I assist you with municipal services today?',
    options: [
      { label: '📝 File a Grievance (Form SC-2026)', action: 'report' },
      { label: '🔍 Track Grievance Status (GRN Lookup)', action: 'track' },
      { label: '📜 View Citizen Charter & SLA Timelines', action: 'charter' },
      { label: '☎️ Emergency Municipal Helplines', action: 'emergency' },
      { label: '🏢 Contact Ward Nodal Officer', action: 'officer' },
    ],
  },
  hi: {
    text: 'नमस्ते! मैं सहायक हूँ, आपका आधिकारिक स्मार्ट सिटी नागरिक मार्गदर्शक। आज मैं आपकी क्या सहायता कर सकता हूँ?',
    options: [
      { label: '📝 नई शिकायत दर्ज करें (प्रपत्र SC-2026)', action: 'report' },
      { label: '🔍 शिकायत की स्थिति जांचें (GRN)', action: 'track' },
      { label: '📜 नागरिक अधिकार पत्र और समयसीमा', action: 'charter' },
      { label: '☎️ आपातकालीन हेल्पलाइन नंबर', action: 'emergency' },
      { label: '🏢 वार्ड नोडल अधिकारी से संपर्क', action: 'officer' },
    ],
  },
} as const;

export function Assistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: initialBotMessages.en.text, options: initialBotMessages.en.options },
  ]);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    setMessages([
      {
        sender: 'bot',
        text: initialBotMessages[nextLang].text,
        options: initialBotMessages[nextLang].options,
      },
    ]);
  };

  const handleOptionClick = (action: string, label: string) => {
    setMessages((prev) => [...prev, { sender: 'user', text: label }]);

    setTimeout(() => {
      if (action === 'report') {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: language === 'en'
              ? 'You can lodge public grievances for road damage, streetlights, drainage, water supply, and waste. Would you like to open the official Form SC-GRV-2026?'
              : 'आप सड़क, स्ट्रीट लाइट, जल आपूर्ति और कचरे की शिकायत दर्ज कर सकते हैं। क्या आप प्रपत्र SC-GRV-2026 खोलना चाहते हैं?',
            options: [
              { label: language === 'en' ? 'Open Grievance Form ➔' : 'शिकायत प्रपत्र खोलें ➔', action: 'go_report' },
              { label: language === 'en' ? 'Main Menu ↺' : 'मुख्य मेनू ↺', action: 'reset' },
            ],
          },
        ]);
      } else if (action === 'go_report') {
        navigate('/report');
        setIsOpen(false);
      } else if (action === 'track') {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: language === 'en'
              ? 'Please enter your 14-digit Grievance Registration Number (e.g. SC-2026-000001) in the box below, or view the sample audit dossier:'
              : 'कृपया नीचे दिए गए बॉक्स में अपना संदर्भ क्रमांक (जैसे SC-2026-000001) लिखें या नमूना ऑडिट देखें:',
            options: [
              { label: 'View Sample Grievance SC-2026-000001', action: 'go_sample_track' },
              { label: language === 'en' ? 'Main Menu ↺' : 'मुख्य मेनू ↺', action: 'reset' },
            ],
          },
        ]);
      } else if (action === 'go_sample_track') {
        navigate('/complaints/SC-2026-000001');
        setIsOpen(false);
      } else if (action === 'charter') {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: language === 'en'
              ? 'Under the Citizen Charter (नागरिक अधिकार पत्र):\n• Potholes & Road Cracks: 48 Hours\n• Water Contamination / Burst: 12 Hours\n• Street Light Outage: 24 Hours\n• Garbage Clearance: 8 Hours\n• Drainage Desilting: 36 Hours'
              : 'नागरिक अधिकार पत्र के तहत निवारण समयसीमा:\n• सड़क के गड्ढे: 48 घंटे\n• पाइपलाइन लीकेज: 12 घंटे\n• स्ट्रीट लाइट: 24 घंटे\n• कचरा उठाव: 8 घंटे\n• नाला सफाई: 36 घंटे',
            options: [
              { label: language === 'en' ? 'File a Grievance Now' : 'शिकायत दर्ज करें', action: 'go_report' },
              { label: language === 'en' ? 'Main Menu ↺' : 'मुख्य मेनू ↺', action: 'reset' },
            ],
          },
        ]);
      } else if (action === 'emergency') {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: language === 'en'
              ? 'Official Emergency Contact Numbers:\n• National Emergency: 112\n• Municipal Grievance Helpline: 1800-11-2026\n• Water & Sewerage Desk: 1916\n• Electricity Fault: 1912\n• Fire & Rescue: 101'
              : 'आधिकारिक आपातकालीन नंबर:\n• राष्ट्रीय आपातकाल: 112\n• नगर निगम हेल्पलाइन: 1800-11-2026\n• जल एवं सीवरेज: 1916\n• विद्युत सहायता: 1912\n• अग्निशमन: 101',
            options: [
              { label: language === 'en' ? 'Main Menu ↺' : 'मुख्य मेनू ↺', action: 'reset' },
            ],
          },
        ]);
      } else if (action === 'officer') {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: language === 'en'
              ? 'Municipal Nodal Officers are available at Ward Offices from 10:00 AM to 5:00 PM on working days. You can also view the Ward GIS Intelligence console for field officer jurisdictions.'
              : 'वार्ड नोडल अधिकारी कार्यदिवसों में सुबह 10 से शाम 5 बजे तक उपलब्ध हैं। आप वार्ड जीआईएस कंसोल भी देख सकते हैं।',
            options: [
              { label: language === 'en' ? 'Open GIS Console ➔' : 'जीआईएस कंसोल खोलें ➔', action: 'go_gis' },
              { label: language === 'en' ? 'Main Menu ↺' : 'मुख्य मेनू ↺', action: 'reset' },
            ],
          },
        ]);
      } else if (action === 'go_gis') {
        navigate('/home');
        setIsOpen(false);
      } else if (action === 'reset') {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: initialBotMessages[language].text,
            options: initialBotMessages[language].options,
          },
        ]);
      }
    }, 400);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputValue('');

    // Check if user entered a complaint reference ID
    const refMatch = userText.match(/SC-\d{4}-\d{6}/i);
    setTimeout(() => {
      if (refMatch) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: language === 'en'
              ? `Reference ID ${refMatch[0].toUpperCase()} found! Click below to view the official grievance dossier:`
              : `संदर्भ संख्या ${refMatch[0].toUpperCase()} प्राप्त हुई! आधिकारिक डॉसियर देखने के लिए क्लिक करें:`,
            options: [
              { label: `Audit ${refMatch[0].toUpperCase()}`, action: 'go_custom_track' },
            ],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: language === 'en'
              ? `Thank you for your query regarding "${userText}". How would you like to proceed?`
              : `"${userText}" के संबंध में आपके प्रश्न के लिए धन्यवाद। आप क्या करना चाहेंगे?`,
            options: [
              { label: language === 'en' ? '📝 Lodge Grievance Form' : '📝 शिकायत दर्ज करें', action: 'report' },
              { label: language === 'en' ? '🔍 Track Grievance Status' : '🔍 स्थिति ट्रैक करें', action: 'track' },
              { label: language === 'en' ? 'Main Menu ↺' : 'मुख्य मेनू ↺', action: 'reset' },
            ],
          },
        ]);
      }
    }, 500);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <aside aria-label="Official Citizen Virtual Assistant" className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          type="button"
          className="group relative flex items-center gap-2.5 rounded-full bg-[#0A2540] px-4 py-3 text-white shadow-2xl border-2 border-amber-400 hover:bg-[#06182B] active:scale-95 transition-all dark:bg-blue-700"
          aria-label="Open Sahayak Citizen Virtual Assistant"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-slate-950">
            <Bot className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[10px] font-hindi font-bold text-amber-300 leading-tight">सहायक · 24x7</span>
            <span className="text-xs font-black tracking-wide leading-tight">Citizen Sahayak</span>
          </div>
        </button>
      )}

      {isOpen && (
        <div className="relative flex h-[540px] w-[350px] sm:w-[380px] flex-col overflow-hidden rounded-2xl border-2 border-[#0A2540] bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-[#0A2540] px-4 py-3 text-white dark:border-slate-800 dark:bg-[#05111F]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-black">
                🏛️
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-hindi text-xs font-bold text-amber-300">सहायक (Sahayak)</span>
                  <span className="rounded bg-emerald-500/30 px-1 py-0.2 text-[8px] font-extrabold text-emerald-300 border border-emerald-500/40">
                    Official Bot
                  </span>
                </div>
                <span className="block text-[10px] text-slate-300">
                  Smart City Citizen Helpdesk
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switch */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-200 hover:bg-slate-700 border border-slate-700"
                title="Switch Language (हिन्दी / English)"
              >
                <Globe2 className="h-3 w-3 text-amber-400" />
                <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Close Assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Viewport */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-xs bg-slate-50/70 dark:bg-slate-950/60">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#0A2540] text-white dark:bg-blue-600 rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                </div>

                {/* Quick Action Options */}
                {msg.options && (
                  <div className="mt-2 flex flex-col gap-1.5 w-full">
                    {msg.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleOptionClick(opt.action, opt.label)}
                        className="w-full text-left rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 hover:border-amber-500 hover:bg-amber-50/50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition shadow-sm"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={language === 'en' ? 'Type grievance or Ref ID (e.g. SC-2026)...' : 'शिकायत या संदर्भ संख्या लिखें...'}
                className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#0A2540] focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <button
                type="button"
                onClick={handleSend}
                className="rounded-lg bg-[#0A2540] p-2 text-white hover:bg-[#06182B] active:scale-95 transition dark:bg-blue-600"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-400">
              <span>National Grievance AI Desk</span>
              <span className="font-mono">STQC Audited</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
