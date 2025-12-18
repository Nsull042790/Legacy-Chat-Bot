/**
 * Luminate Bank Mortgage Chatbot
 * Version: 1.0.3
 * 
 * CHANGELOG:
 * v1.0.3 - Added content debugging to diagnose empty user bubble
 *        - Shows message content in debug label
 *        - Added fallback text if content is empty
 * v1.0.2 - Debug version showed message IS in state but bubble empty
 * v1.0.1 - Attempted fix with unique IDs (still broken)
 * v1.0.0 - Initial release with 40+ mortgage topics
 */

import React, { useReducer, useState, useRef, useEffect } from 'react';
import { Send, Home, RotateCcw } from 'lucide-react';

const VERSION = '1.0.3';

// Message reducer
function messageReducer(state, action) {
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      return [...state, { 
        id: Date.now(), 
        type: 'user', 
        content: action.payload,
        debugContent: `USER SAID: "${action.payload}"` // Extra debug field
      }];
    case 'ADD_BOT_MESSAGE':
      return [...state, { 
        id: Date.now() + 1, 
        type: 'bot', 
        content: action.payload.content, 
        quickReplies: action.payload.quickReplies 
      }];
    case 'RESET':
      return [];
    default:
      return state;
  }
}

// Simplified Knowledge Base
const KNOWLEDGE_BASE = {
  self_employed: {
    patterns: ['self employed', 'self-employed', 'own business', 'business owner', '1099', 'freelance'],
    response: "Self-employed borrowers absolutely can get mortgages! Here's what to know:\n\n• 2 years of self-employment history typically needed\n• Tax returns (2 years) are key—we use your net income\n• Bank statement loans exist if tax returns don't tell the full story"
  },
  down_payment: {
    patterns: ['down payment', 'downpayment', 'how much down'],
    response: "Down payments are flexible:\n\n• Conventional: 3-5%\n• FHA: 3.5%\n• VA: 0% for veterans\n• USDA: 0% for rural areas"
  },
  pmi: {
    patterns: ['what is pmi', "what's pmi", 'pmi'],
    response: "PMI (Private Mortgage Insurance) is required when you put less than 20% down. It drops off once you hit 20% equity."
  },
  fha: {
    patterns: ['fha', 'what is fha'],
    response: "FHA loans: 3.5% down, 580+ credit, great for first-time buyers!"
  }
};

function findMatch(text) {
  const lower = text.toLowerCase();
  for (const [key, data] of Object.entries(KNOWLEDGE_BASE)) {
    for (const pattern of data.patterns) {
      if (lower.includes(pattern)) {
        return data.response;
      }
    }
  }
  return null;
}

export default function MortgageChatbot() {
  const [messages, dispatch] = useReducer(messageReducer, []);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize
  useEffect(() => {
    setTimeout(() => {
      dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: {
          content: "Hey there! 👋 I'm here to help with your mortgage questions.",
          quickReplies: ['What is FHA?', 'Down payment options', 'I\'m self-employed']
        }
      });
    }, 500);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input
  useEffect(() => {
    if (!isTyping) inputRef.current?.focus();
  }, [isTyping]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;

    // Clear input
    setInputValue('');
    
    // Add user message
    dispatch({ type: 'ADD_USER_MESSAGE', payload: text });
    
    // Set typing
    setIsTyping(true);
    
    // Add bot response after delay
    setTimeout(() => {
      const response = findMatch(text) || "I can help with FHA, down payments, PMI, and self-employment questions.";
      dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: {
          content: response,
          quickReplies: ['What is FHA?', 'Down payment options']
        }
      });
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickReply = (reply) => {
    dispatch({ type: 'ADD_USER_MESSAGE', payload: reply });
    setIsTyping(true);
    
    setTimeout(() => {
      const response = findMatch(reply) || "I can help with FHA, down payments, PMI, and self-employment questions.";
      dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: {
          content: response,
          quickReplies: ['What is FHA?', 'Down payment options']
        }
      });
      setIsTyping(false);
    }, 1000);
  };

  const handleRestart = () => {
    dispatch({ type: 'RESET' });
    setInputValue('');
    setTimeout(() => {
      dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: {
          content: "Hey there! 👋 I'm here to help.",
          quickReplies: ['What is FHA?', 'Down payment options']
        }
      });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md h-[700px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between bg-[#0D1834]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#96DAF8]">
              <Home className="w-5 h-5 text-[#0D1834]" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Luminate Bank</h3>
              <p className="text-xs text-[#96DAF8]">v{VERSION}</p>
            </div>
          </div>
          <button onClick={handleRestart} className="text-[#96DAF8] hover:text-white transition-colors">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Debug Info */}
        <div className="bg-yellow-100 px-3 py-1 text-xs text-yellow-800">
          Messages: {messages.length} | Types: {messages.map(m => m.type).join(', ')}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div key={msg.id || index}>
              {/* Debug: Show type and content preview */}
              <div className="text-xs text-red-500 mb-1 font-mono bg-red-50 p-1 rounded">
                [{msg.type}] content={JSON.stringify(msg.content)} | length={msg.content?.length || 0}
              </div>
              
              {/* Message bubble - ALWAYS render with visible styling */}
              <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  style={{
                    backgroundColor: msg.type === 'user' ? '#0D1834' : '#ffffff',
                    color: msg.type === 'user' ? '#ffffff' : '#1f2937',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    maxWidth: '85%',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-line',
                    border: msg.type === 'user' ? 'none' : '1px solid #e5e7eb',
                    minWidth: '50px',
                    minHeight: '20px'
                  }}
                >
                  {msg.content || '[EMPTY CONTENT]'}
                </div>
              </div>
              
              {/* Quick replies */}
              {msg.type === 'bot' && msg.quickReplies && index === messages.length - 1 && !isTyping && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.quickReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickReply(reply)}
                      className="px-4 py-2 bg-white border border-[#96DAF8] rounded-full text-sm text-[#0D1834] hover:bg-[#96DAF8]/20 transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about mortgages..."
              className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#96DAF8] focus:border-transparent outline-none text-sm"
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="w-11 h-11 bg-[#0D1834] rounded-full flex items-center justify-center hover:bg-[#1a2d4d] disabled:opacity-50 transition-colors"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            NMLS #1281698 · Equal Housing Lender
          </p>
        </div>
      </div>
    </div>
  );
}
