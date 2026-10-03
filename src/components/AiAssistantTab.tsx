import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Sparkles,
  Send,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { askAiAssistant } from '../services/api';
import { AiChatMessage } from '../types/finance';
import advisorAvatarImg from '../assets/images/avatar_fin_advisor_1791045585813.jpg';
import userAvatarImg from '../assets/images/avatar_bangla_user_1791045575293.jpg';

export const AiAssistantTab: React.FC = () => {
  const {
    transactions,
    budgets,
    goals,
    user,
    formatMoney
  } = useFinance();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'init_msg_1',
      sender: 'assistant',
      text: `Hello! I am FinSathi AI, your personal financial advisor. Your database is connected to Firebase Cloud Firestore and ready for your data entries. Record your income, daily expenses, or budgets, and ask me anything about your financial habits or goals!`,
      timestamp: 'Just now',
      quickActions: [
        'How should I plan my monthly budget?',
        'Tips on building an emergency reserve fund',
        'How to categorize recurring bills?',
        'Show summary of this month'
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Speech Recognition (Voice input)
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Text to Speech playback
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMsg: AiChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await askAiAssistant(textToSend, history, {
        transactions,
        budgets,
        goals,
        userProfile: user
      });

      const assistantMsg: AiChatMessage = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: res.suggestedActions || []
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      const fallbackMsg: AiChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: 'Unable to connect to financial model. Please check network connectivity and try again.',
        timestamp: 'Now'
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] min-h-[550px] flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Assistant Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={advisorAvatarImg}
              alt="FinSathi AI Consultant"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-2xs"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                FinSathi AI <span className="text-emerald-600 font-semibold">Financial Advisor</span>
              </h2>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Grounded in your real cash flow, budgets, and savings targets
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: `reset_${Date.now()}`,
                sender: 'assistant',
                text: 'Chat conversation reset. What financial insights would you like to review?',
                timestamp: 'Just now',
                quickActions: [
                  'How much did I spend on Food & Dining?',
                  'Which category is over budget?',
                  'How can I save $300 more this month?'
                ]
              }
            ]);
          }}
          title="Reset Conversation"
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <img
                src={isUser ? userAvatarImg : advisorAvatarImg}
                alt={isUser ? user.name : 'FinSathi AI'}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 mt-0.5"
              />

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap text-xs sm:text-[13px] leading-relaxed">
                  {msg.text}
                </div>

                {/* Footer timestamp & TTS */}
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => speakText(msg.text)}
                      className="p-1 hover:text-emerald-600 transition-colors ml-2"
                      title="Listen via Voice Synthesis"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Suggested Action Chips */}
                {!isUser && msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                    {msg.quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(action)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors text-left"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <img
              src={advisorAvatarImg}
              alt="FinSathi AI"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-xs p-3 flex items-center gap-2 text-slate-500 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>FinSathi AI is analyzing your transactions and budgets...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Bar */}
      <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 overflow-x-auto no-scrollbar flex items-center gap-2">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">
          Quick Prompts:
        </span>
        {[
          'How much did I spend on Food & Dining?',
          'Is my Shopping budget over limit?',
          'What was my largest unusual expense?',
          'How can I save $300 more this month?'
        ].map((p, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(p)}
            className="px-2.5 py-1 text-[11px] text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-full shrink-0 transition-colors whitespace-nowrap font-medium"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3.5 sm:p-4 border-t border-slate-200/80 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            title={isListening ? 'Stop listening' : 'Speak your question'}
            className={`p-2.5 rounded-lg border transition-colors ${
              isListening
                ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask anything about your income, expenses, budgets, or savings goals..."
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition-colors shadow-2xs active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
