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
} from 'lucide-react';

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  options?: ReadonlyArray<{ label: string; action: string }>;
}

const initialBotMessages = {
  en: {
    text: 'Namaste! I am Sahayak, your Smart City Citizen Assistant. How can I help you today?',
    options: [
      { label: '🚧 Report Pothole / Road damage', action: 'pothole' },
      { label: '💡 Report Streetlight issue', action: 'streetlight' },
      { label: '🗑️ Report Garbage / Waste Pile', action: 'garbage' },
      { label: '🔍 Track Grievance Status', action: 'track' },
    ],
  },
  hi: {
    text: 'नमस्ते! मैं सहायक हूँ, आपका स्मार्ट सिटी नागरिक सहायक। आज मैं आपकी क्या सहायता कर सकता हूँ?',
    options: [
      { label: '🚧 सड़क के गड्ढे की शिकायत', action: 'pothole' },
      { label: '💡 स्ट्रीट लाइट बंद होना', action: 'streetlight' },
      { label: '🗑️ कचरे के ढेर की शिकायत', action: 'garbage' },
      { label: '🔍 शिकायत की स्थिति जांचें', action: 'track' },
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
      if (action === 'pothole') {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: language === 'en'
              ? 'Understood. I will prepare a Road Damage report. Click below to prefill the grievance form.'
              : 'समझ गया। मैं सड़क मरम्मत की शिकायत तैयार करूँगा। नीचे क्लिक करके फ़ॉर्म भरें।',
            options: [{ label: language === 'en' ? '📝 Prefill Road Form' : '📝 फ़ॉर्म भरें', action: 'go_pothole' }],
          },
        ]);
      } else if (action === 'streetlight') {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: language === 'en'
              ? 'Understood. I will prepare a Street Light report. Click below to prefill the grievance form.'
              : 'समझ गया। मैं स्ट्रीट लाइट की शिकायत तैयार करूँगा। नीचे क्लिक करके फ़ॉर्म भरें।',
            options: [{ label: language === 'en' ? '📝 Prefill Light Form' : '📝 फ़ॉर्म भरें', action: 'go_streetlight' }],
          },
        ]);
      } else if (action === 'garbage') {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: language === 'en'
              ? 'Understood. I will prepare a Sanitation report. Click below to prefill the grievance form.'
              : 'समझ गया। मैं सफाई की शिकायत तैयार करूँगा। नीचे क्लिक करके फ़ॉर्म भरें।',
            options: [{ label: language === 'en' ? '📝 Prefill Sanitation Form' : '📝 फ़ॉर्म भरें', action: 'go_garbage' }],
          },
        ]);
      } else if (action === 'track') {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: language === 'en'
              ? 'Click below to view the official tracking receipt for sample grievance SC-2026-000001, or enter your reference ID.'
              : 'नमूना शिकायत SC-2026-000001 की आधिकारिक स्थिति रसीद देखने के लिए नीचे क्लिक करें।',
            options: [{ label: language === 'en' ? '🔍 View Sample Receipt' : '🔍 रसीद देखें', action: 'go_receipt' }],
          },
        ]);
      } else if (action === 'go_pothole' || action === 'go_streetlight' || action === 'go_garbage') {
        setIsOpen(false);
        navigate('/report');
      } else if (action === 'go_receipt') {
        setIsOpen(false);
        navigate('/complaints/SC-2026-000001');
      }
    }, 600);
  };

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { sender: 'user', text: trimmed }]);
    setInputValue('');

    const lowerText = trimmed.toLowerCase();

    setTimeout(() => {
      if (lowerText.includes('pothole') || lowerText.includes('road') || lowerText.includes('गड्ढा') || lowerText.includes('सड़क')) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: language === 'en'
              ? 'I detected a road maintenance concern. Would you like to launch the grievance form?'
              : 'मुझे सड़क से संबंधित शिकायत मिली। क्या आप नया फ़ॉर्म भरना चाहते हैं?',
            options: [{ label: language === 'en' ? '📝 Prefill Road Form' : '📝 फ़ॉर्म भरें', action: 'go_pothole' }],
          },
        ]);
      } else if (lowerText.includes('track') || lowerText.includes('status') || lowerText.includes('स्थिति') || lowerText.includes('sc-')) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: language === 'en'
              ? 'Here is the direct link to the grievance tracking audit page.'
              : 'शिकायत ट्रैकिंग ऑडिट पृष्ठ का सीधा लिंक यहाँ है।',
            options: [{ label: language === 'en' ? '🔍 Open Tracking Audit' : '🔍 स्थिति देखें', action: 'go_receipt' }],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: language === 'en'
              ? 'Thank you. I have recorded your inquiry. You can file a formal complaint using the button below.'
              : 'धन्यवाद। आप नीचे दिए गए बटन से नई शिकायत भी दर्ज कर सकते हैं।',
            options: [{ label: language === 'en' ? '📝 Open Grievance Form' : '📝 फ़ॉर्म पर जाएँ', action: 'go_pothole' }],
          },
        ]);
      }
    }, 600);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen((current) => !current)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 transition-all hover:scale-110 active:scale-95"
        title="Sahayak - Smart City AI Citizen Assistant"
        type="button"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 flex h-[30rem] w-[calc(100vw-2rem)] sm:w-96 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-4 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                  SAHAYAK AI <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-slate-300">Smart City Citizen Desk</p>
              </div>
            </div>

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold tracking-wider hover:bg-white/20 transition"
              type="button"
            >
              <Globe2 className="h-3 w-3" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>
          </div>

          {/* Tricolor line */}
          <div className="flex h-1 w-full">
            <div className="h-full w-1/3 bg-[#FF9933]" />
            <div className="h-full w-1/3 bg-white" />
            <div className="h-full w-1/3 bg-[#138808]" />
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-900/30">
            {messages.map((msg, index) => (
              <div
                key={`${msg.sender}-${index}`}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'rounded-tr-none bg-blue-600 text-white font-medium shadow-sm'
                      : 'rounded-tl-none border border-slate-200 bg-white text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.options && msg.options.length > 0 && (
                  <div className="mt-2 flex w-full max-w-[88%] flex-col gap-1.5">
                    {msg.options.map((opt) => (
                      <button
                        key={opt.action}
                        onClick={() => {
                          if (opt.action === 'go_pothole' || opt.action === 'go_streetlight' || opt.action === 'go_garbage') {
                            setIsOpen(false);
                            navigate('/report');
                          } else if (opt.action === 'go_receipt') {
                            setIsOpen(false);
                            navigate('/complaints/SC-2026-000001');
                          } else {
                            handleOptionClick(opt.action, opt.label);
                          }
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 text-left text-[11px] font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                        type="button"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <div className="flex gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={language === 'en' ? 'Ask Sahayak anything...' : 'सहायक से पूछें...'}
              className="flex-1 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
            <button
              onClick={handleSend}
              className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 transition"
              type="button"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
