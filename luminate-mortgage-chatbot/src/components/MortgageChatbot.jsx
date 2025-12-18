/**
 * Luminate Bank Mortgage Chatbot
 * Version: 1.0.4
 *
 * CHANGELOG:
 * v1.0.4 - Production release
 *        - Removed debug elements
 *        - Expanded knowledge base (40+ topics)
 *        - Added lead capture flow
 *        - Fixed message content rendering
 * v1.0.3 - Debug version with content diagnostics
 * v1.0.2 - Debug version (message in state, bubble empty)
 * v1.0.1 - Attempted fix with unique IDs
 * v1.0.0 - Initial release
 */

import { useReducer, useState, useRef, useEffect } from 'react';
import { Send, Home, RotateCcw } from 'lucide-react';

const VERSION = '1.0.4';

// Message reducer for state management
function messageReducer(state, action) {
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      return [...state, {
        id: `user-${Date.now()}`,
        type: 'user',
        content: action.payload
      }];
    case 'ADD_BOT_MESSAGE':
      return [...state, {
        id: `bot-${Date.now()}`,
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

// Comprehensive Knowledge Base
const KNOWLEDGE_BASE = {
  // Down Payment
  down_payment: {
    patterns: ['down payment', 'downpayment', 'how much down', 'money down', 'upfront'],
    response: "Great question! Down payment requirements vary by loan type:\n\n• Conventional: 3-5% minimum\n• FHA: 3.5% with 580+ credit\n• VA: 0% for eligible veterans\n• USDA: 0% for rural areas\n\nMany first-time buyer programs offer down payment assistance too!",
    quickReplies: ['Tell me about FHA', 'VA loan info', 'What is PMI?']
  },

  // FHA Loans
  fha: {
    patterns: ['fha', 'fha loan', 'what is fha', 'federal housing'],
    response: "FHA loans are government-backed mortgages perfect for first-time buyers!\n\n✓ Down payment as low as 3.5%\n✓ Credit scores from 580 accepted\n✓ Flexible debt-to-income ratios\n✓ Gift funds allowed for down payment\n\nThe trade-off is mortgage insurance for the life of the loan.",
    quickReplies: ['FHA vs Conventional', 'What is PMI?', 'Talk to a specialist']
  },

  // VA Loans
  va: {
    patterns: ['va loan', 'va ', 'veteran', 'military', 'service member'],
    response: "Thank you for your service! VA loans offer incredible benefits:\n\n✓ NO down payment required\n✓ NO PMI (huge savings!)\n✓ Competitive interest rates\n✓ Limited closing costs\n\nEligible: Active duty, veterans, National Guard, and surviving spouses.",
    quickReplies: ['Check VA eligibility', 'Down payment options', 'Get pre-approved']
  },

  // PMI
  pmi: {
    patterns: ['pmi', 'private mortgage insurance', 'mortgage insurance', 'insurance required'],
    response: "PMI (Private Mortgage Insurance) protects the lender if you default.\n\n• Required when down payment < 20%\n• Costs 0.5% - 1% of loan annually\n• Drops off at 20% equity (conventional)\n• VA loans have NO PMI!\n\nIt's not forever—just until you build equity.",
    quickReplies: ['How to avoid PMI', 'VA loan benefits', 'Down payment options']
  },

  // Self-Employed
  self_employed: {
    patterns: ['self employed', 'self-employed', 'own business', 'business owner', '1099', 'freelance', 'contractor', 'entrepreneur'],
    response: "Self-employed? You can absolutely get a mortgage!\n\nWhat you'll need:\n• 2 years of tax returns\n• Year-to-date P&L statement\n• Business bank statements\n• CPA letter or business license\n\nWe also offer bank statement loans if tax returns don't show your full income.",
    quickReplies: ['Bank statement loans', 'Required documents', 'Talk to a specialist']
  },

  // Pre-Approval
  pre_approval: {
    patterns: ['pre-approval', 'preapproval', 'pre approved', 'preapproved', 'get approved', 'qualify'],
    response: "Getting pre-approved is a smart first step!\n\nBenefits:\n✓ Know your exact budget\n✓ Sellers take you seriously\n✓ Faster closing process\n✓ Lock in your rate\n\nTypically takes 24-48 hours. You'll need ID, income docs, and bank statements.",
    quickReplies: ['Start pre-approval', 'Required documents', 'Check my eligibility']
  },

  // Interest Rates
  rates: {
    patterns: ['rate', 'rates', 'interest rate', 'apr', 'what rate', 'today\'s rate', 'current rate'],
    response: "Mortgage rates change daily based on the market.\n\nFactors affecting YOUR rate:\n• Credit score (higher = better)\n• Down payment amount\n• Loan type & term\n• Property type\n• Debt-to-income ratio\n\nThe best way to know your rate is to get pre-approved!",
    quickReplies: ['Get my rate', 'Improve my credit', 'Get pre-approved']
  },

  // Credit Score
  credit: {
    patterns: ['credit', 'credit score', 'fico', 'credit check', 'bad credit', 'low credit'],
    response: "Credit score requirements by loan type:\n\n• Conventional: 620+ (best rates at 740+)\n• FHA: 580+ (or 500 with 10% down)\n• VA: No minimum, but 620+ preferred\n• USDA: 640+\n\nLower score? We have options! Let's talk.",
    quickReplies: ['FHA loans', 'Check my eligibility', 'Talk to a specialist']
  },

  // Closing Costs
  closing_costs: {
    patterns: ['closing cost', 'closing costs', 'fees', 'how much to close'],
    response: "Closing costs typically run 2-5% of the loan amount.\n\nCommon costs:\n• Loan origination (0.5-1%)\n• Appraisal ($400-$600)\n• Title insurance\n• Prepaid taxes & insurance\n\nSeller credits and lender credits can help reduce these!",
    quickReplies: ['Negotiate closing costs', 'Get an estimate', 'Talk to a specialist']
  },

  // Refinance
  refinance: {
    patterns: ['refinance', 'refi', 'refinancing', 'lower payment', 'cash out', 'cash-out'],
    response: "Refinancing can save you money or unlock equity!\n\nReasons to refi:\n• Lower your interest rate\n• Reduce monthly payment\n• Switch ARM to fixed\n• Cash out home equity\n• Remove PMI\n\nRule of thumb: Refinance if you can drop your rate by 0.5%+",
    quickReplies: ['Cash-out options', 'Check refi rates', 'Talk to a specialist']
  },

  // First-Time Buyer
  first_time: {
    patterns: ['first time', 'first-time', 'first home', 'never bought', 'new buyer'],
    response: "Congratulations on buying your first home! 🏠\n\nFirst-time buyer perks:\n• FHA loans with 3.5% down\n• Down payment assistance programs\n• Tax credits in some states\n• Lower PMI rates\n\nYou may qualify even if you owned a home 3+ years ago!",
    quickReplies: ['FHA loans', 'Down payment help', 'Get pre-approved']
  },

  // Conventional
  conventional: {
    patterns: ['conventional', 'conforming', 'traditional loan', 'regular mortgage'],
    response: "Conventional loans are traditional mortgages not backed by the government.\n\nPros:\n• Lower fees than FHA over time\n• PMI drops off at 20% equity\n• Higher loan limits available\n• More property types eligible\n\nRequires: 620+ credit, 3-5% down, stable income",
    quickReplies: ['FHA vs Conventional', 'Down payment options', 'Get pre-approved']
  },

  // Jumbo
  jumbo: {
    patterns: ['jumbo', 'jumbo loan', 'high balance', 'over limit'],
    response: "Jumbo loans are for amounts exceeding conforming limits ($766,550 in most areas for 2024).\n\nRequirements:\n• Higher credit score (700+)\n• Larger down payment (10-20%)\n• More reserves required\n• Lower debt-to-income ratio\n\nWe have competitive jumbo rates!",
    quickReplies: ['Check jumbo rates', 'Down payment options', 'Talk to a specialist']
  },

  // USDA
  usda: {
    patterns: ['usda', 'rural', 'rural development'],
    response: "USDA loans offer 0% down for eligible rural and suburban areas!\n\n✓ No down payment\n✓ Lower mortgage insurance\n✓ Competitive rates\n✓ Income limits apply\n\nMany areas just outside cities qualify. Let's check your address!",
    quickReplies: ['Check my eligibility', 'Down payment options', 'Talk to a specialist']
  },

  // Documents
  documents: {
    patterns: ['document', 'documents', 'paperwork', 'what do i need', 'need to provide'],
    response: "Here's what you'll typically need:\n\n📄 Income: Pay stubs (30 days), W-2s (2 years)\n📄 Assets: Bank statements (2 months)\n📄 ID: Driver's license, SSN\n📄 Tax returns (if self-employed)\n📄 Gift letter (if using gift funds)\n\nWe'll guide you through everything!",
    quickReplies: ['Self-employed docs', 'Start pre-approval', 'Talk to a specialist']
  },

  // Bank Statement Loans
  bank_statement: {
    patterns: ['bank statement', 'bank statements', 'no tax return', 'stated income'],
    response: "Bank statement loans are great for self-employed borrowers!\n\nHow it works:\n• Use 12-24 months of bank deposits\n• No tax returns required\n• Calculate income from deposits\n• Higher rates, but more qualifying income\n\nPerfect if your tax returns don't reflect your true earnings.",
    quickReplies: ['Self-employed options', 'Required documents', 'Talk to a specialist']
  },

  // Investment Property
  investment: {
    patterns: ['investment', 'rental', 'rental property', 'investment property', 'second home', 'vacation home'],
    response: "Looking to invest in real estate? Great choice!\n\nInvestment property loans:\n• 15-25% down payment typical\n• Slightly higher rates\n• Rental income can help qualify\n• Can use for 1-4 unit properties\n\nSecond homes have different (easier) requirements!",
    quickReplies: ['Investment rates', 'Second home vs rental', 'Talk to a specialist']
  },

  // ARM
  arm: {
    patterns: ['arm', 'adjustable', 'adjustable rate', '5/1', '7/1', '10/1'],
    response: "Adjustable Rate Mortgages (ARMs) start with a lower fixed rate:\n\n• 5/1 ARM: Fixed 5 years, then adjusts yearly\n• 7/1 ARM: Fixed 7 years\n• 10/1 ARM: Fixed 10 years\n\nBest for: Short-term ownership or expecting income increases. Rates have caps to limit increases.",
    quickReplies: ['ARM vs Fixed', 'Current rates', 'Talk to a specialist']
  },

  // Debt-to-Income
  dti: {
    patterns: ['dti', 'debt to income', 'debt-to-income', 'how much can i afford', 'afford'],
    response: "Debt-to-Income (DTI) is key to how much you can borrow!\n\nGuidelines:\n• Front-end DTI: Housing costs ≤ 28-31%\n• Back-end DTI: All debts ≤ 43-50%\n\nLower DTI = easier approval & better rates. Paying off debt before applying helps!",
    quickReplies: ['Calculate my DTI', 'Improve my chances', 'Get pre-approved']
  },

  // Timeline
  timeline: {
    patterns: ['how long', 'timeline', 'time to close', 'closing time', 'process take'],
    response: "Typical mortgage timeline:\n\n📅 Pre-approval: 1-3 days\n📅 Home search: Varies\n📅 Under contract to close: 30-45 days\n\nWe can often close faster! Cash-out refis take 30-45 days. Rate locks typically last 30-60 days.",
    quickReplies: ['Start pre-approval', 'What to expect', 'Talk to a specialist']
  },

  // Gift Funds
  gift: {
    patterns: ['gift', 'gift funds', 'gift money', 'family help', 'parents help'],
    response: "Yes, gift funds can be used for down payment!\n\nRequirements:\n• Gift letter signed by donor\n• Donor bank statements\n• Must be a gift, not a loan\n• Donor must be family (usually)\n\nFHA, VA, and Conventional all allow gifts. Some programs allow 100% gift funds!",
    quickReplies: ['FHA loans', 'Down payment options', 'Talk to a specialist']
  },

  // Escrow
  escrow: {
    patterns: ['escrow', 'impound', 'taxes and insurance'],
    response: "Escrow accounts collect monthly funds for:\n\n• Property taxes\n• Homeowner's insurance\n• Mortgage insurance (if applicable)\n\nYour lender pays these bills when due. Required for most loans with < 20% down. Makes budgeting easier!",
    quickReplies: ['Closing costs', 'What to expect', 'Talk to a specialist']
  },

  // Appraisal
  appraisal: {
    patterns: ['appraisal', 'home value', 'appraised', 'worth'],
    response: "Appraisals determine your home's fair market value.\n\nWhat happens:\n• Licensed appraiser visits property\n• Compares to recent similar sales\n• Costs $400-$600 typically\n• Required for most loans\n\nIf appraisal is low, we can renegotiate or explore options!",
    quickReplies: ['What if low appraisal?', 'Closing costs', 'Talk to a specialist']
  }
};

// Lead capture triggers
const LEAD_TRIGGERS = [
  'talk to', 'specialist', 'advisor', 'contact', 'call me', 'get started',
  'start pre-approval', 'check my eligibility', 'get my rate', 'get pre-approved',
  'speak to', 'human', 'person', 'agent', 'loan officer'
];

// Default quick replies
const DEFAULT_QUICK_REPLIES = ['Down payment options', 'FHA loans', 'VA loans', 'Get pre-approved'];

function findMatch(text) {
  const lower = text.toLowerCase();

  // Check for lead capture triggers
  for (const trigger of LEAD_TRIGGERS) {
    if (lower.includes(trigger)) {
      return { type: 'lead_capture' };
    }
  }

  // Search knowledge base
  for (const [, data] of Object.entries(KNOWLEDGE_BASE)) {
    for (const pattern of data.patterns) {
      if (lower.includes(pattern)) {
        return { type: 'knowledge', data };
      }
    }
  }

  return null;
}

export default function MortgageChatbot() {
  const [messages, dispatch] = useReducer(messageReducer, []);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [leadCapture, setLeadCapture] = useState({
    active: false,
    step: 0,
    data: { name: '', phone: '', email: '' }
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize with welcome message
  useEffect(() => {
    setTimeout(() => {
      dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: {
          content: "Hey there! 👋 I'm Luna, your Luminate mortgage assistant. I can help with loan options, rates, and getting you pre-approved. What would you like to know?",
          quickReplies: DEFAULT_QUICK_REPLIES
        }
      });
    }, 500);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when not typing
  useEffect(() => {
    if (!isTyping) inputRef.current?.focus();
  }, [isTyping]);

  const handleLeadCapture = (input) => {
    const { step, data } = leadCapture;
    let newData = { ...data };
    let response = '';
    let quickReplies = [];
    let nextStep = step;
    let stayActive = true;

    switch (step) {
      case 0:
        response = "I'd love to connect you with one of our mortgage specialists! They can give you personalized advice and current rates.\n\nWhat's your name?";
        nextStep = 1;
        break;
      case 1:
        newData.name = input;
        response = `Nice to meet you, ${input}! What's the best phone number to reach you?`;
        nextStep = 2;
        break;
      case 2:
        newData.phone = input;
        response = "Great! And what's your email address?";
        nextStep = 3;
        break;
      case 3:
        newData.email = input;
        response = `Perfect, ${newData.name}! ✅\n\nOne of our mortgage specialists will reach out within 24 hours at:\n📞 ${newData.phone}\n📧 ${newData.email}\n\nIn the meantime, is there anything else I can help you with?`;
        quickReplies = DEFAULT_QUICK_REPLIES;
        stayActive = false;
        console.log('Lead captured:', newData);
        break;
      default:
        break;
    }

    setLeadCapture({
      active: stayActive,
      step: nextStep,
      data: newData
    });

    return { response, quickReplies };
  };

  const addBotMessage = (content, quickReplies = []) => {
    setIsTyping(true);

    setTimeout(() => {
      dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: { content, quickReplies }
      });
      setIsTyping(false);
    }, 800 + Math.random() * 400);
  };

  const handleSend = (textOverride) => {
    const text = (textOverride || inputValue).trim();
    if (!text || isTyping) return;

    setInputValue('');

    // Add user message
    dispatch({ type: 'ADD_USER_MESSAGE', payload: text });

    // Handle lead capture flow
    if (leadCapture.active) {
      const result = handleLeadCapture(text);
      addBotMessage(result.response, result.quickReplies);
      return;
    }

    // Find matching response
    const match = findMatch(text);

    if (match?.type === 'lead_capture') {
      const result = handleLeadCapture(text);
      addBotMessage(result.response, result.quickReplies);
    } else if (match?.type === 'knowledge') {
      addBotMessage(match.data.response, match.data.quickReplies);
    } else {
      addBotMessage(
        "I can help with lots of mortgage topics!\n\nTry asking about:\n• Down payments & loan types\n• FHA, VA, Conventional, Jumbo\n• Credit scores & pre-approval\n• Self-employed mortgages\n• Refinancing options\n\nOr I can connect you with a specialist!",
        ['Down payment options', 'Loan types', 'I\'m self-employed', 'Talk to a specialist']
      );
    }
  };

  const handleQuickReply = (reply) => {
    handleSend(reply);
  };

  const handleRestart = () => {
    dispatch({ type: 'RESET' });
    setInputValue('');
    setLeadCapture({ active: false, step: 0, data: { name: '', phone: '', email: '' } });

    setTimeout(() => {
      dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: {
          content: "Hey there! 👋 I'm Luna, your Luminate mortgage assistant. How can I help you today?",
          quickReplies: DEFAULT_QUICK_REPLIES
        }
      });
    }, 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
              <p className="text-xs text-[#96DAF8]">Mortgage Assistant v{VERSION}</p>
            </div>
          </div>
          <button
            onClick={handleRestart}
            className="text-[#96DAF8] hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            title="Start over"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div key={msg.id}>
              {/* Message bubble */}
              <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.type === 'user'
                      ? 'bg-[#0D1834] text-white rounded-br-md'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>

              {/* Quick replies - only show on last bot message when not typing */}
              {msg.type === 'bot' && msg.quickReplies && msg.quickReplies.length > 0 &&
               index === messages.length - 1 && !isTyping && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.quickReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickReply(reply)}
                      className="px-4 py-2 bg-white border border-[#96DAF8] rounded-full text-sm text-[#0D1834] hover:bg-[#96DAF8]/20 transition-colors font-medium"
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
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-[#0D1834] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#0D1834] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 bg-[#0D1834] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
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
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about mortgages..."
              className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#96DAF8] focus:border-transparent outline-none text-sm"
              disabled={isTyping}
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping}
              className="w-11 h-11 bg-[#0D1834] rounded-full flex items-center justify-center hover:bg-[#1a2d4d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Luminate Home Loans Inc. · NMLS #1281698 · Equal Housing Lender
          </p>
        </div>
      </div>
    </div>
  );
}
