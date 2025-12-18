/**
 * Legacy Mortgage Division Chatbot (Luminate Bank)
 * Version: 1.0.13
 *
 * CHANGELOG:
 * v1.0.13 - Branch locations & contact info
 *         - Added branch_locations topic with office addresses
 *         - NJ HQ: 219 Paterson Ave, Little Falls
 *         - Corporate HQ: Minneapolis, MN
 *         - Florida: Sarasota & Tampa Bay region
 *         - Updated service_areas and contact responses
 * v1.0.12 - Conversation memory & proactive closing
 *         - Tracks last topic discussed for context
 *         - Follow-up detection ("tell me more", "these loans")
 *         - Deeper responses on follow-up questions
 *         - Proactive lead capture after 2nd message on topic
 *         - Smoother conversation flow
 * v1.0.11 - Auto-learning intent system
 *         - Manual intent mappings for all blog topics
 *         - Auto-learning: extracts keywords from user input
 *         - Matches keywords against knowledge base patterns
 *         - Partial word matching (e.g., "renovation" → "renovate")
 *         - Question phrase detection for better context
 *         - New topics auto-work without manual mapping!
 * v1.0.10 - Intent detection system
 *         - New action + topic matching (e.g., "cancel" + "pmi" → pmi_removal)
 *         - More flexible PMI removal patterns
 *         - Better handling of natural questions
 * v1.0.9 - Blog content integration
 *        - Added 203(k) renovation loan info
 *        - Added Value Assurance program
 *        - Added PA assistance (Keystone, K-FIT, PHFA)
 *        - Added NJ programs (YOUR Home, Smart Start)
 *        - Added PMI cancellation guide
 *        - Added assumable mortgage info
 *        - Added college home buying tips
 *        - Added homeowner tax benefits
 * v1.0.8 - Improved conversation handling
 *        - Typo tolerance for common misspellings
 *        - Negation detection (e.g., "I don't have 20% down")
 *        - Smart alternatives when user expresses limitations
 *        - New low down payment response
 * v1.0.7 - Smart pattern matching
 *        - Scoring-based algorithm (longer patterns = higher priority)
 *        - Word boundary detection for accuracy
 *        - Multiple keyword matches boost relevance
 *        - Handles natural questions like "tell me about X"
 * v1.0.6 - Bug fixes
 *        - Fixed pattern matching (self-employed now works)
 *        - Restored version display in header
 * v1.0.5 - Company-specific update
 *        - Added Legacy Mortgage Division branding
 *        - Added company-specific loan products
 *        - Added Non-QM, Bridge, Reverse Mortgage info
 *        - Added service areas and contact info
 *        - Added Home Sale Assured program
 * v1.0.4 - Production release
 * v1.0.3 - Debug version with content diagnostics
 * v1.0.2 - Debug version (message in state, bubble empty)
 * v1.0.1 - Attempted fix with unique IDs
 * v1.0.0 - Initial release
 */

import { useReducer, useState, useRef, useEffect } from 'react';
import { Send, Home, RotateCcw } from 'lucide-react';

const VERSION = '1.0.13';

// ==================== CONVERSATION MEMORY ====================
// Follow-up phrases that indicate user wants more info on previous topic
const FOLLOW_UP_PHRASES = [
  'tell me more', 'more about', 'more info', 'more information',
  'explain more', 'go on', 'continue', 'what else',
  'these loans', 'those loans', 'that loan', 'this loan',
  'that option', 'those options', 'these options',
  'that program', 'those programs', 'these programs',
  'how does that work', 'how do they work', 'how does it work',
  'sounds good', 'sounds interesting', 'interested',
  'yes', 'yeah', 'yep', 'sure', 'ok tell me',
  'and', 'what about'
];

// Deep-dive responses for follow-up questions (provides more detail + closing)
const FOLLOW_UP_RESPONSES = {
  self_employed: {
    response: "Let me break down your best options as a self-employed borrower:\n\n📊 **Bank Statement Loans:**\n• We average your deposits over 12-24 months\n• Personal OR business accounts work\n• No tax returns needed!\n• Great if write-offs reduce your taxable income\n\n📊 **Asset Depletion:**\n• Use retirement/investment accounts\n• We calculate \"income\" from assets\n• Perfect for high net worth borrowers\n\n💡 The best program depends on your specific situation. A quick call with one of our specialists can identify which option saves you the most!",
    quickReplies: ['Talk to a specialist', 'Get pre-approved', 'Bank statement details']
  },
  bank_statement: {
    response: "Here's exactly how Bank Statement Loans work:\n\n📋 **The Process:**\n1. Provide 12 or 24 months of statements\n2. We calculate average monthly deposits\n3. Apply an expense factor (usually 50%)\n4. That becomes your qualifying income!\n\n✅ **Example:**\n• $20,000/month average deposits\n• 50% expense factor = $10,000 income\n• Can qualify for $400K+ loan!\n\n🎯 **Best Part:** Your tax returns showing $60K don't limit you when deposits show $240K!\n\nWant to see what you'd qualify for? I can connect you with a specialist who does these daily.",
    quickReplies: ['Talk to a specialist', 'Get pre-approved', 'Other self-employed options']
  },
  non_qm: {
    response: "Non-QM loans are our specialty — here's why they're powerful:\n\n🔓 **Who Benefits:**\n• Self-employed with write-offs\n• Real estate investors (DSCR loans)\n• Recent credit events (2+ years ago)\n• Foreign nationals\n• High assets, complex income\n\n📈 **What's Possible:**\n• Up to $3M+ loan amounts\n• Interest-only options\n• 40-year terms available\n• Bank statement qualification\n\nAs a Top Non-QM Lender, we close these when others can't. Let's see what we can do for you!",
    quickReplies: ['Talk to a specialist', 'Bank statement loans', 'Get pre-approved']
  },
  fha: {
    response: "FHA is fantastic for many buyers — here's the full picture:\n\n✅ **Pros:**\n• 3.5% down (gift funds OK!)\n• 580 credit score minimum\n• Higher DTI allowed (up to 50%+)\n• Seller can pay up to 6% closing costs\n\n⚠️ **Considerations:**\n• Mortgage insurance for life of loan\n• Property must meet FHA standards\n• Loan limits vary by county\n\n💡 **Pro Tip:** If credit improves later, you can refinance to conventional and drop the MI!\n\nReady to see if FHA is right for you? A quick pre-approval takes just minutes.",
    quickReplies: ['Get pre-approved', 'FHA vs Conventional', 'Talk to a specialist']
  },
  va: {
    response: "VA loans are the best deal in mortgages — here's everything:\n\n🎖️ **Unbeatable Benefits:**\n• TRUE 0% down payment\n• ZERO PMI — ever!\n• Lower rates than conventional\n• No prepayment penalties\n• Easier credit requirements\n\n📋 **Eligibility:**\n• 90+ days active duty (wartime)\n• 181+ days active duty (peacetime)\n• 6+ years National Guard/Reserves\n• Surviving spouses may qualify\n\n💰 **Funding Fee:** 2.15% first use (can be financed)\n• Disabled veterans: EXEMPT!\n\nThank you for your service! Let's get you into your new home.",
    quickReplies: ['Check my eligibility', 'Get pre-approved', 'Talk to a specialist']
  },
  jumbo: {
    response: "Our Jumbo loans are industry-leading — here's why:\n\n💎 **Key Advantages:**\n• 10% down with NO PMI!\n• Loan amounts $766,550+\n• Up to $3M+ available\n• Competitive rates\n• Primary & second homes\n\n📊 **Requirements:**\n• 700+ credit score ideal\n• 6-12 months reserves\n• Stable income history\n• Full documentation\n\n🏠 **Perfect For:**\n• Luxury homes\n• High-cost areas (NYC, NJ, FL)\n• High earners\n\nHigh-value properties need specialized handling. Let me connect you with our Jumbo specialist.",
    quickReplies: ['Talk to a specialist', 'Get pre-approved', 'Down payment options']
  },
  down_payment: {
    response: "Let me show you ALL your down payment options:\n\n💰 **Zero Down:**\n• VA: $0 (veterans/military)\n• USDA: $0 (eligible rural areas)\n\n💰 **Low Down:**\n• FHA: 3.5%\n• Conventional: 3-5%\n• Jumbo: 10% (NO PMI!)\n\n🎁 **Assistance Programs:**\n• NJ Smart Start: Up to $15,000!\n• PA Keystone: Up to $6,000\n• K-FIT: 5% forgiven over 10 years\n\n💡 Many buyers qualify for multiple programs! Let's find the best combination for you.",
    quickReplies: ['Talk to a specialist', 'State programs', 'Get pre-approved']
  },
  refinance: {
    response: "Here's when refinancing makes sense:\n\n✅ **Good Reasons to Refi:**\n• Drop rate by 0.5%+ = savings!\n• Remove PMI (hit 20% equity)\n• Cash out for renovations/debt\n• Switch ARM to fixed\n• Shorten loan term\n\n📊 **Break-Even Math:**\n• Closing costs ÷ monthly savings = months to break even\n• Staying 3+ years? Usually worth it!\n\n💰 **Cash-Out Options:**\n• Up to 80% LTV conventional\n• Up to 85% LTV FHA\n• Up to 100% LTV VA!\n\nRates change daily. Want to see your numbers?",
    quickReplies: ['Check my rate', 'Cash-out options', 'Talk to a specialist']
  },
  pre_approval: {
    response: "Pre-approval is your secret weapon — here's why:\n\n🏆 **Benefits:**\n• Know your EXACT budget\n• Sellers take you seriously\n• Beat other buyers to offers\n• Lock your rate early\n• Identify issues before house hunting\n\n📋 **What We Need:**\n• ID & Social Security\n• Pay stubs (30 days)\n• W-2s or tax returns (2 years)\n• Bank statements (2 months)\n\n⏱️ **Timeline:** Usually 24-48 hours!\n\n💡 No cost, no obligation. Ready to see what you qualify for?",
    quickReplies: ['Start pre-approval', 'Talk to a specialist', 'Documents needed']
  },
  // Default follow-up for topics without specific deep-dive
  default: {
    response: "I'd love to give you more specific details!\n\nThe best way to get personalized information is a quick conversation with one of our loan specialists. They can:\n\n✓ Answer your specific questions\n✓ Run scenarios for your situation\n✓ Show you exact rates and payments\n✓ Identify programs you qualify for\n\nNo pressure, no obligation — just helpful information. Want me to connect you?",
    quickReplies: ['Talk to a specialist', 'Get pre-approved', 'Ask another question']
  }
};

// Proactive closing message after providing follow-up info
const CLOSING_PUSH = "\n\n🎯 **Ready to take the next step?** Our specialists close loans like this every day. A quick 5-minute call can answer all your questions!";

// Common typo corrections for mortgage-related terms
const TYPO_CORRECTIONS = {
  // Self-employed variations
  'sel employed': 'self employed',
  'selfemployed': 'self employed',
  'self-employd': 'self employed',
  'selfeployed': 'self employed',
  'slef employed': 'self employed',
  'sel-employed': 'self employed',
  // Down payment variations
  'downpayment': 'down payment',
  'down payement': 'down payment',
  'donw payment': 'down payment',
  'dwon payment': 'down payment',
  // FHA variations
  'fah loan': 'fha loan',
  'fah': 'fha',
  // Pre-approval variations
  'pre approval': 'pre-approval',
  'proapproval': 'pre-approval',
  'preapproved': 'pre-approved',
  'pre aproved': 'pre-approved',
  'preaporved': 'pre-approved',
  // Refinance variations
  'refinace': 'refinance',
  'refianance': 'refinance',
  'refinace': 'refinance',
  'refiannce': 'refinance',
  // Mortgage variations
  'morgage': 'mortgage',
  'mortage': 'mortgage',
  'morgatge': 'mortgage',
  'mortgae': 'mortgage',
  // Conventional variations
  'conventinal': 'conventional',
  'convential': 'conventional',
  'convenitonal': 'conventional',
  // Other common typos
  'intrest': 'interest',
  'intrest rate': 'interest rate',
  'closeing': 'closing',
  'closign': 'closing',
  'appraisel': 'appraisal',
  'appraisl': 'appraisal',
  'documets': 'documents',
  'documants': 'documents',
  'veteren': 'veteran',
  'vetran': 'veteran',
  'jumobo': 'jumbo',
  'jumb': 'jumbo',
  'non qm': 'non-qm',
  'birdge': 'bridge',
  'bridg loan': 'bridge loan'
};

// Negation patterns to detect when user expresses limitations
const NEGATION_PATTERNS = [
  "don't have", "dont have", "do not have",
  "can't afford", "cant afford", "cannot afford",
  "no ", "without ",
  "not enough", "don't want to put", "dont want to put"
];

// Map negation + topic to alternative responses
const NEGATION_RESPONSES = {
  // User says they don't have 20% down
  low_down_payment: {
    triggers: ['20%', '20 percent', 'twenty percent', 'large down', 'big down', 'lot down', 'much down'],
    response: "Great news! You don't need 20% down to buy a home! 🎉\n\n💰 Low & Zero Down Payment Options:\n• VA Loans: 0% down (veterans/military)\n• USDA: 0% down (rural areas)\n• FHA: Just 3.5% down\n• Conventional: As low as 3% down\n• Jumbo: 10% down with NO PMI!\n\nWe also have down payment assistance programs available!",
    quickReplies: ['VA loans', 'FHA loans', 'Down payment help', 'Talk to a specialist']
  },
  // User says they don't have good credit
  low_credit: {
    triggers: ['good credit', 'great credit', 'perfect credit', 'high credit', '700', '750', '800'],
    response: "No worries! We help buyers with all credit situations! 💪\n\nOptions for lower credit scores:\n• FHA: Accepts 580+ (some down to 500)\n• VA: No minimum score requirement\n• Non-QM: Flexible credit guidelines\n• Bank Statement Loans: Focus on income, not score\n\nWe're Top Non-QM lenders — finding solutions is what we do!",
    quickReplies: ['FHA loans', 'Non-QM loans', 'Talk to a specialist']
  },
  // User says they can't prove income traditionally
  alt_income: {
    triggers: ['tax returns', 'w2', 'w-2', 'pay stubs', 'paystubs', 'prove income', 'show income'],
    response: "We have great options for non-traditional income verification! 📄\n\nAlternatives to tax returns:\n• Bank Statement Loans (12-24 months)\n• Asset Depletion Programs\n• P&L Only Programs\n• 1099 Income Programs\n\nYour write-offs shouldn't prevent homeownership!",
    quickReplies: ['Bank statement loans', 'Self-employed options', 'Talk to a specialist']
  }
};

// Function to correct typos in user input
function correctTypos(text) {
  let corrected = text.toLowerCase();
  for (const [typo, correction] of Object.entries(TYPO_CORRECTIONS)) {
    // Use word boundary-aware replacement
    const regex = new RegExp(typo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    corrected = corrected.replace(regex, correction);
  }
  return corrected;
}

// ==================== INTENT DETECTION SYSTEM ====================
// Manual high-priority intent mappings (action + topic → knowledge base key)
const MANUAL_INTENT_MAPPINGS = {
  // PMI removal
  pmi_removal: {
    actions: ['cancel', 'remove', 'stop', 'get rid', 'eliminate', 'drop', 'end'],
    topics: ['pmi', 'private mortgage insurance', 'mortgage insurance']
  },
  // Refinancing
  refinance: {
    actions: ['refinance', 'refi', 'lower', 'reduce'],
    topics: ['rate', 'payment', 'interest']
  },
  // 203k renovation loans
  fha_203k: {
    actions: ['renovate', 'fix', 'repair', 'rehab', 'upgrade', 'improve'],
    topics: ['home', 'house', 'property', 'loan', 'financing', 'fixer']
  },
  // Value Assurance / competing with cash
  value_assurance: {
    actions: ['compete', 'beat', 'win', 'against'],
    topics: ['cash', 'offer', 'bidding', 'buyer']
  },
  // Assumable mortgages
  assumable_mortgage: {
    actions: ['assume', 'take over', 'inherit', 'transfer'],
    topics: ['mortgage', 'loan', 'seller']
  },
  // State assistance programs
  pa_assistance: {
    actions: ['help', 'assistance', 'program', 'grant'],
    topics: ['pennsylvania', 'pa', 'keystone', 'phfa']
  },
  nj_assistance: {
    actions: ['help', 'assistance', 'program', 'grant'],
    topics: ['new jersey', 'nj', 'njhmfa', 'jersey']
  },
  // Tax benefits
  tax_benefits: {
    actions: ['deduct', 'save', 'write off', 'claim'],
    topics: ['tax', 'taxes', '1098', 'deduction']
  },
  // College home buying
  college_home: {
    actions: ['buy', 'purchase', 'invest'],
    topics: ['college', 'student', 'university', 'dorm', 'kid', 'child']
  }
};

// Common question phrases that indicate informational intent
const QUESTION_PHRASES = [
  'what is', 'what are', 'what\'s', 'tell me about', 'explain', 'how does',
  'how do i', 'how can i', 'how to', 'ways to', 'can i', 'do you have',
  'info on', 'information about', 'learn about', 'details on'
];

// Stop words to ignore when extracting keywords
const STOP_WORDS = new Set([
  'what', 'how', 'can', 'does', 'the', 'for', 'with', 'about', 'your', 'have',
  'this', 'that', 'from', 'they', 'would', 'there', 'their', 'will', 'when',
  'make', 'like', 'just', 'over', 'such', 'into', 'other', 'than', 'then',
  'more', 'some', 'could', 'them', 'these', 'also', 'been', 'being', 'which',
  'were', 'said', 'each', 'she', 'her', 'him', 'his', 'has', 'had', 'may',
  'after', 'know', 'need', 'want', 'tell', 'get', 'got', 'are', 'was', 'is'
]);

// Extract meaningful keywords from text (for auto-learning)
function extractKeywords(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 3 && !STOP_WORDS.has(word));
}

// AUTO-LEARNING: Generate intent score by matching keywords against patterns
function getAutoIntentScore(text, knowledgeBase) {
  const keywords = extractKeywords(text);
  if (keywords.length === 0) return {};

  const scores = {};

  for (const [key, data] of Object.entries(knowledgeBase)) {
    let score = 0;

    for (const keyword of keywords) {
      for (const pattern of data.patterns) {
        // Direct pattern match
        if (pattern.includes(keyword)) {
          score += keyword.length * 2;
        }
        // Partial word match (e.g., "renovation" matches "renovate")
        const patternWords = pattern.split(/\s+/);
        for (const pWord of patternWords) {
          if (pWord.startsWith(keyword) || keyword.startsWith(pWord)) {
            score += Math.min(keyword.length, pWord.length);
          }
        }
      }
    }

    if (score > 0) {
      scores[key] = score;
    }
  }

  return scores;
}

// Main intent detection function (combines manual + auto-learning)
function checkIntent(text, knowledgeBase) {
  const lower = text.toLowerCase();

  // 1. First check manual high-priority mappings
  for (const [key, config] of Object.entries(MANUAL_INTENT_MAPPINGS)) {
    const hasAction = config.actions.some(action => lower.includes(action));
    const hasTopic = config.topics.some(topic => lower.includes(topic));

    if (hasAction && hasTopic) {
      return { key, score: 100, source: 'manual' }; // High priority
    }
  }

  // 2. Check if it's a question and use auto-learning
  const isQuestion = QUESTION_PHRASES.some(phrase => lower.includes(phrase));
  const autoScores = getAutoIntentScore(lower, knowledgeBase);

  // Find the best auto-match
  let bestKey = null;
  let bestScore = 0;

  for (const [key, score] of Object.entries(autoScores)) {
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }

  // Only return if score is significant enough
  if (bestKey && bestScore >= 6) {
    return {
      key: bestKey,
      score: isQuestion ? bestScore + 20 : bestScore,
      source: 'auto'
    };
  }

  return null;
}

// Function to check for negations and return alternative response
function checkNegation(text) {
  const lower = text.toLowerCase();

  // Check if text contains a negation pattern
  const hasNegation = NEGATION_PATTERNS.some(neg => lower.includes(neg));
  if (!hasNegation) return null;

  // Check each negation response category
  for (const [key, config] of Object.entries(NEGATION_RESPONSES)) {
    for (const trigger of config.triggers) {
      if (lower.includes(trigger)) {
        return {
          type: 'negation',
          data: {
            response: config.response,
            quickReplies: config.quickReplies
          }
        };
      }
    }
  }

  return null;
}

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

// Comprehensive Knowledge Base - Legacy Mortgage Division
const KNOWLEDGE_BASE = {
  // ==================== COMPANY INFO ====================
  about: {
    patterns: ['about you', 'about legacy', 'about luminate', 'who are you', 'your company', 'tell me about you', 'tell me about legacy'],
    response: "Legacy Mortgage Division is part of Luminate Bank — a Top 25 Retail Mortgage Lender nationwide! 🏆\n\n✓ 700+ mortgage professionals\n✓ 25+ years of experience\n✓ FDIC-insured institution\n✓ Licensed in all 50 states\n✓ Specializing in NJ, NY, FL & PA\n\nWe combine big-bank security with personalized service!",
    quickReplies: ['Loan options', 'Service areas', 'Get pre-approved']
  },

  service_areas: {
    patterns: ['where do you', 'service area', 'what states', 'locations', 'new jersey', 'new york', 'florida', 'pennsylvania', 'nj', 'ny', 'fl', 'pa'],
    response: "We're licensed in all 50 states! 🇺🇸\n\nOur specialty areas:\n• New Jersey (HQ in Little Falls)\n• New York\n• Florida (Gulf Coast & Tampa Bay)\n• Pennsylvania\n\nWith 700+ mortgage professionals nationwide, we have local experts in your area!",
    quickReplies: ['Branch locations', 'Contact us', 'Get pre-approved']
  },

  branch_locations: {
    patterns: ['branch', 'branches', 'office location', 'offices', 'where are you located', 'nearest office', 'local office', 'visit'],
    response: "📍 **Our Locations:**\n\n🏢 **New Jersey HQ (Little Falls)**\n219 Paterson Ave\nLittle Falls, NJ 07424\n\n🏢 **Corporate HQ (Minneapolis)**\n2523 S. Wayzata Blvd. #100\nMinneapolis, MN 55405\n\n🌴 **Florida**\nSarasota & Gulf Coast region\nTampa Bay area\n\n📞 We have loan production offices across the country! With 700+ professionals in every U.S. time zone, there's always someone local to help.\n\nWant to connect with a loan officer in your area?",
    quickReplies: ['Talk to a specialist', 'Service areas', 'Get pre-approved']
  },

  contact: {
    patterns: ['contact', 'phone', 'email', 'address', 'reach', 'call', 'little falls'],
    response: "📍 **Legacy Mortgage Division**\n219 Paterson Ave\nLittle Falls, NJ 07424\n\n🌐 legacymortgagedivision.com\n\n📞 We have loan officers across the country ready to help! Whether you're in NJ, NY, FL, PA, or anywhere else — we've got you covered.\n\nReady to get started? I can connect you with a specialist in your area!",
    quickReplies: ['Talk to a specialist', 'Branch locations', 'Get pre-approved']
  },

  // ==================== LOAN PRODUCTS ====================
  down_payment: {
    patterns: ['down payment', 'downpayment', 'how much down', 'money down', 'upfront'],
    response: "Down payment requirements vary by loan type:\n\n• Conventional: 3-5% minimum\n• FHA: 3.5% with 580+ credit\n• VA: 0% for eligible veterans\n• USDA: 0% for rural areas\n• Jumbo: As low as 10% with NO PMI!\n\nWe also have down payment assistance programs available!",
    quickReplies: ['Jumbo loans', 'FHA loans', 'VA loans']
  },

  fha: {
    patterns: ['fha', 'fha loan', 'what is fha', 'federal housing'],
    response: "FHA loans are government-backed mortgages perfect for first-time buyers!\n\n✓ Down payment as low as 3.5%\n✓ Credit scores from 580 accepted\n✓ Flexible debt-to-income ratios\n✓ Gift funds allowed for down payment\n✓ Lower credit? We have options!\n\nFHA is great for buyers with moderate income or less-than-perfect credit.",
    quickReplies: ['FHA vs Conventional', 'First-time buyer', 'Get pre-approved']
  },

  va: {
    patterns: ['va loan', 'va ', 'veteran', 'military', 'service member', 'surviving spouse'],
    response: "Thank you for your service! 🎖️ VA loans offer incredible benefits:\n\n✓ NO down payment required\n✓ NO PMI ever!\n✓ Competitive interest rates\n✓ Limited closing costs\n✓ Flexible credit guidelines\n\nEligible: Active duty, veterans, National Guard, reserves, and surviving spouses.",
    quickReplies: ['Check VA eligibility', 'Down payment options', 'Get pre-approved']
  },

  jumbo: {
    patterns: ['jumbo', 'jumbo loan', 'high balance', 'over limit', 'large loan', 'expensive home'],
    response: "Need financing for a high-value property? Our Jumbo loans are exceptional!\n\n✓ Finance up to 90% of property value\n✓ As little as 10% down\n✓ NO PMI required!\n✓ Competitive rates\n✓ Loan amounts above $766,550\n\nPerfect for luxury homes and high-cost areas.",
    quickReplies: ['Check jumbo rates', 'Down payment options', 'Talk to a specialist']
  },

  usda: {
    patterns: ['usda', 'rural', 'rural development', 'rural area'],
    response: "USDA loans offer 0% down for eligible rural and suburban areas!\n\n✓ No down payment required\n✓ Lower mortgage insurance than FHA\n✓ Competitive rates\n✓ Income limits apply\n\nMany areas just outside cities qualify — you might be surprised! Let's check your address.",
    quickReplies: ['Check my eligibility', 'Down payment options', 'Talk to a specialist']
  },

  conventional: {
    patterns: ['conventional', 'conforming', 'traditional loan', 'regular mortgage'],
    response: "Conventional loans are traditional mortgages with great flexibility:\n\n✓ Down payments from 3-5%\n✓ PMI drops off at 20% equity\n✓ Multiple property types eligible\n✓ Primary, second home, or investment\n✓ Higher loan limits available\n\nRequires: 620+ credit, stable income, manageable debt.",
    quickReplies: ['FHA vs Conventional', 'Down payment options', 'Get pre-approved']
  },

  // ==================== SPECIALTY PRODUCTS ====================
  non_qm: {
    patterns: ['non-qm', 'non qm', 'nonqm', 'alternative', 'non-traditional', 'alternative income'],
    response: "Non-QM loans are perfect for borrowers who don't fit traditional guidelines!\n\n✓ Self-employed borrowers\n✓ Bank statement income verification\n✓ Asset-based qualification\n✓ Recent credit events OK\n✓ Foreign nationals\n✓ Investment property investors\n\nWe're a Top Non-QM Lender — we specialize in finding solutions!",
    quickReplies: ['Bank statement loans', 'Self-employed options', 'Talk to a specialist']
  },

  bank_statement: {
    patterns: ['bank statement', 'bank statements', 'no tax return', 'stated income', '12 month', '24 month'],
    response: "Bank Statement Loans are ideal for self-employed borrowers!\n\nHow it works:\n• Use 12-24 months of bank deposits\n• No tax returns required\n• Personal OR business accounts\n• Calculate income from deposits\n• Flexible DTI guidelines\n• Up to 40-year terms available!\n\nPerfect if tax write-offs reduce your qualifying income.",
    quickReplies: ['Self-employed options', 'Non-QM loans', 'Talk to a specialist']
  },

  self_employed: {
    patterns: ['self employed', 'self-employed', 'own business', 'business owner', '1099', 'freelance', 'contractor', 'entrepreneur', 'gig'],
    response: "Self-employed? We specialize in helping business owners! 💼\n\nOptions available:\n• Traditional: 2 years tax returns\n• Bank Statement: 12-24 months deposits\n• Asset Depletion: Use savings to qualify\n• P&L Only programs\n\nYour tax write-offs shouldn't prevent homeownership. Let's find the right fit!",
    quickReplies: ['Bank statement loans', 'Non-QM loans', 'Talk to a specialist']
  },

  bridge_loan: {
    patterns: ['bridge', 'bridge loan', 'buy before sell', 'contingency', 'need to sell'],
    response: "Need to buy before you sell? Our Bridge Loans help!\n\n✓ Access equity in your current home\n✓ Use for down payment on new home\n✓ Cover closing costs\n✓ No contingency needed\n✓ Competitive terms\n\nDon't miss your dream home because your current one hasn't sold yet!",
    quickReplies: ['Home Sale Assured', 'Talk to a specialist', 'How it works']
  },

  home_sale_assured: {
    patterns: ['home sale assured', 'guaranteed', 'backup contract', 'sell my home', 'gbc'],
    response: "Home Sale Assured is our unique program! 🏡\n\n✓ Guaranteed Backup Contract (GBC)\n✓ Your home stays under contract\n✓ Still accept higher offers\n✓ Eliminates selling stress\n✓ Confidence to buy your next home\n\nBuy with confidence knowing your home WILL sell!",
    quickReplies: ['Bridge loans', 'Talk to a specialist', 'Get pre-approved']
  },

  reverse_mortgage: {
    patterns: ['reverse', 'reverse mortgage', 'hecm', 'senior', '62', 'retirement', 'equity access'],
    response: "Reverse Mortgages (HECM) for homeowners 62+:\n\n✓ Access home equity tax-free\n✓ No monthly mortgage payments\n✓ Stay in your home\n✓ FHA-insured protection\n✓ Multiple disbursement options\n\nUse funds for retirement, healthcare, home improvements, or anything you need!",
    quickReplies: ['How it works', 'Eligibility', 'Talk to a specialist']
  },

  arm: {
    patterns: ['arm', 'adjustable', 'adjustable rate', '5/1', '7/1', '10/1', 'variable'],
    response: "Adjustable Rate Mortgages start with lower rates:\n\n• 3/1 ARM: Fixed 3 years, then adjusts\n• 5/1 ARM: Fixed 5 years\n• 7/1 ARM: Fixed 7 years\n• 10/1 ARM: Fixed 10 years\n\nBest for: Short-term ownership, relocating soon, or expecting income increases. Rate caps protect you from major jumps!",
    quickReplies: ['ARM vs Fixed', 'Current rates', 'Talk to a specialist']
  },

  non_warrantable_condo: {
    patterns: ['condo', 'non-warrantable', 'warrantable', 'hoa', 'condo financing'],
    response: "Non-Warrantable Condo Financing available!\n\nWe can help when others can't:\n✓ High investor concentration\n✓ Single-entity ownership issues\n✓ Pending litigation\n✓ Commercial space concerns\n✓ New construction\n\nDon't let condo restrictions stop your purchase!",
    quickReplies: ['Talk to a specialist', 'Down payment options', 'Get pre-approved']
  },

  // ==================== ASSISTANCE PROGRAMS ====================
  ny_assistance: {
    patterns: ['new york program', 'ny program', 'new york assistance', 'sonyma', 'new york help'],
    response: "New York Mortgage Assistance Programs available!\n\n• SONYMA programs\n• Down payment assistance\n• First-time buyer grants\n• Low-interest options\n• Income-based programs\n\nWe know NY programs inside and out. Let us find the right fit for you!",
    quickReplies: ['First-time buyer', 'Down payment help', 'Talk to a specialist']
  },

  first_time: {
    patterns: ['first time', 'first-time', 'first home', 'never bought', 'new buyer'],
    response: "Congratulations on buying your first home! 🏠\n\nFirst-time buyer perks:\n• FHA loans with 3.5% down\n• Down payment assistance programs\n• State-specific grants (like NY SONYMA)\n• Gift funds allowed\n• Lower PMI rates\n\nYou may qualify even if you owned 3+ years ago!",
    quickReplies: ['FHA loans', 'Down payment help', 'NY programs']
  },

  // ==================== PROCESS & GENERAL ====================
  pre_approval: {
    patterns: ['pre-approval', 'preapproval', 'pre approved', 'preapproved', 'get approved', 'qualify', 'how much can i'],
    response: "Getting pre-approved is your smart first step!\n\nBenefits:\n✓ Know your exact budget\n✓ Sellers take you seriously\n✓ Faster closing process\n✓ Lock in your rate\n\nTypically 24-48 hours. We'll guide you through every document needed!",
    quickReplies: ['Start pre-approval', 'Documents needed', 'Talk to a specialist']
  },

  rates: {
    patterns: ['rate', 'rates', 'interest rate', 'apr', 'what rate', 'today\'s rate', 'current rate'],
    response: "Mortgage rates change daily based on the market.\n\nFactors affecting YOUR rate:\n• Credit score (higher = better)\n• Down payment amount\n• Loan type & term\n• Property type\n• Occupancy type\n\nThe best way to know your rate is to get pre-approved. It's free!",
    quickReplies: ['Get my rate', 'Improve my credit', 'Get pre-approved']
  },

  credit: {
    patterns: ['credit', 'credit score', 'fico', 'credit check', 'bad credit', 'low credit'],
    response: "Credit score requirements by loan type:\n\n• Conventional: 620+ (best rates at 740+)\n• FHA: 580+ (or 500 with 10% down)\n• VA: No minimum, but 620+ preferred\n• USDA: 640+\n• Non-QM: Options for lower scores!\n\nLower score? We specialize in finding solutions!",
    quickReplies: ['Non-QM loans', 'FHA loans', 'Talk to a specialist']
  },

  pmi: {
    patterns: ['pmi', 'private mortgage insurance', 'mortgage insurance', 'insurance required'],
    response: "PMI (Private Mortgage Insurance) protects the lender if you default.\n\n• Required when down payment < 20%\n• Costs 0.5% - 1% of loan annually\n• Drops off at 20% equity (conventional)\n• VA loans = NO PMI!\n• Our Jumbo loans = NO PMI with 10% down!\n\nWe have multiple ways to avoid PMI!",
    quickReplies: ['VA loans', 'Jumbo loans', 'Down payment options']
  },

  refinance: {
    patterns: ['refinance', 'refi', 'refinancing', 'lower payment', 'cash out', 'cash-out'],
    response: "Refinancing can save money or unlock equity!\n\nReasons to refi:\n• Lower your interest rate\n• Reduce monthly payment\n• Switch ARM to fixed\n• Cash out home equity\n• Remove PMI\n• Consolidate debt\n\nRule of thumb: Refi if you can drop 0.5%+ on your rate!",
    quickReplies: ['Cash-out options', 'Check refi rates', 'Talk to a specialist']
  },

  closing_costs: {
    patterns: ['closing cost', 'closing costs', 'fees', 'how much to close'],
    response: "Closing costs typically run 2-5% of the loan amount.\n\nCommon costs:\n• Loan origination (0.5-1%)\n• Appraisal ($400-$600)\n• Title insurance\n• Prepaid taxes & insurance\n\nGood news: We offer appraisal waiver options on eligible loans!",
    quickReplies: ['Appraisal waiver', 'Get an estimate', 'Talk to a specialist']
  },

  appraisal: {
    patterns: ['appraisal', 'home value', 'appraised', 'worth', 'appraisal waiver'],
    response: "Appraisals determine your home's fair market value.\n\n✓ Licensed appraiser visits property\n✓ Compares to recent similar sales\n✓ Costs $400-$600 typically\n\n🌟 We offer Appraisal Waiver options where the appraised value has zero effect on your mortgage terms — ask us about it!",
    quickReplies: ['Appraisal waiver info', 'Closing costs', 'Talk to a specialist']
  },

  documents: {
    patterns: ['document', 'documents', 'paperwork', 'what do i need', 'need to provide'],
    response: "Here's what you'll typically need:\n\n📄 Income: Pay stubs (30 days), W-2s (2 years)\n📄 Assets: Bank statements (2 months)\n📄 ID: Driver's license, SSN\n📄 Tax returns (if self-employed)\n📄 Gift letter (if using gift funds)\n\nSelf-employed? We have flexible documentation options!",
    quickReplies: ['Self-employed docs', 'Bank statement loans', 'Talk to a specialist']
  },

  timeline: {
    patterns: ['how long', 'timeline', 'time to close', 'closing time', 'process take'],
    response: "Typical mortgage timeline:\n\n📅 Pre-approval: 1-3 days\n📅 Home search: Varies\n📅 Under contract to close: 30-45 days\n\nWith 25+ years experience, we often close faster! Rate locks typically last 30-60 days.",
    quickReplies: ['Start pre-approval', 'What to expect', 'Talk to a specialist']
  },

  investment: {
    patterns: ['investment', 'rental', 'rental property', 'investment property', 'second home', 'vacation home', 'income property'],
    response: "Looking to invest in real estate? Great choice!\n\nInvestment property loans:\n• 15-25% down payment typical\n• Rental income can help qualify\n• 1-4 unit properties\n• DSCR loans available\n\nSecond/vacation homes have easier requirements!",
    quickReplies: ['Investment rates', 'Non-QM options', 'Talk to a specialist']
  },

  dti: {
    patterns: ['dti', 'debt to income', 'debt-to-income', 'afford'],
    response: "Debt-to-Income (DTI) is key to how much you can borrow!\n\nGuidelines:\n• Front-end DTI: Housing costs ≤ 28-31%\n• Back-end DTI: All debts ≤ 43-50%\n• Non-QM: Higher DTI options available!\n\nLower DTI = easier approval & better rates.",
    quickReplies: ['Non-QM loans', 'Improve my chances', 'Get pre-approved']
  },

  gift: {
    patterns: ['gift', 'gift funds', 'gift money', 'family help', 'parents help'],
    response: "Yes, gift funds can be used for down payment!\n\nRequirements:\n• Gift letter signed by donor\n• Donor bank statements\n• Must be a gift, not a loan\n• Typically from family\n\nFHA, VA, and Conventional all allow gifts. Some programs allow 100% gift funds!",
    quickReplies: ['FHA loans', 'Down payment options', 'Talk to a specialist']
  },

  apply: {
    patterns: ['apply', 'application', 'start application', 'begin', 'get started', 'ready to'],
    response: "Ready to get started? Awesome! 🎉\n\nYou can:\n1️⃣ Apply online at legacymortgagedivision.com/apply\n2️⃣ Talk to a loan officer now\n3️⃣ Get pre-approved first\n\nOur average team member has 10+ years experience — you're in great hands!",
    quickReplies: ['Talk to a specialist', 'Get pre-approved', 'What documents needed']
  },

  // ==================== BLOG TOPICS ====================
  fha_203k: {
    patterns: ['203k', '203(k)', 'renovation loan', 'rehab loan', 'fixer upper', 'needs work', 'renovation financing'],
    response: "FHA 203(k) loans let you finance renovations into your mortgage! 🔨\n\n✓ Roll renovation costs into your loan\n✓ Avoid credit card debt for repairs\n✓ Limited 203(k) for smaller projects\n✓ Standard 203(k) for major renovations\n✓ Can help with appraisal gaps!\n\nPerfect for homes that need TLC. Contractors agree to fixed pricing and timelines!",
    quickReplies: ['How it works', 'FHA loans', 'Talk to a specialist']
  },

  value_assurance: {
    patterns: ['value assurance', 'compete with cash', 'cash offer', 'waive appraisal', 'appraisal contingency', 'bidding war'],
    response: "Our Value Assurance Program helps you compete with cash buyers! 💪\n\n✓ Guaranteed property value for underwriting\n✓ Uses Automated Valuation Model (AVM)\n✓ Bid with confidence above asking price\n✓ If appraisal comes low, we honor AVM value\n✓ Beat cash offers without extra risk!\n\nAvailable for conforming & high-balance loans on single-family homes & condos.",
    quickReplies: ['How to qualify', 'Get pre-approved', 'Talk to a specialist']
  },

  pa_assistance: {
    patterns: ['pennsylvania', 'pa program', 'keystone', 'phfa', 'pa assistance', 'pa down payment'],
    response: "Pennsylvania has great assistance programs! 🏠\n\n💰 Keystone Advantage:\n• 4% or up to $6,000 assistance\n• 0% interest, 10-year repayment\n• Min 660 credit score\n\n💰 K-FIT Program:\n• 5% of purchase price\n• Forgiven over 10 years!\n• Min 660 credit score\n\n💰 PHFA $500 Grant:\n• No repayment required!\n\nThese can combine with FHA, VA, Conventional!",
    quickReplies: ['NJ programs', 'Down payment help', 'Talk to a specialist']
  },

  nj_assistance: {
    patterns: ['new jersey program', 'njhmfa', 'sonyma', 'your home program', 'nj assistance', 'smart start'],
    response: "New Jersey offers fantastic homebuyer programs! 🏡\n\n💰 YOUR Home Program:\n• Below-market interest rates\n• As little as 5% down\n• No first-time buyer requirement!\n• No PMI options available\n\n💰 Smart Start DPA:\n• Up to $15,000 in select counties!\n• $10,000 in other NJ counties\n• Pairs with NJHMFA first mortgage\n\nEligible counties: Bergen, Essex, Hudson, Mercer, Middlesex, Monmouth, Morris, Ocean, Passaic, Somerset, Union!",
    quickReplies: ['PA programs', 'First-time buyer', 'Talk to a specialist']
  },

  pmi_removal: {
    patterns: ['remove pmi', 'cancel pmi', 'get rid of pmi', 'stop pmi', 'pmi cancellation', 'drop pmi', 'cancel my pmi', 'remove my pmi', 'stop paying pmi', 'eliminate pmi', 'pmi removal', 'get off pmi', 'end pmi'],
    response: "3 ways to cancel PMI on conventional loans! 📉\n\n1️⃣ Automatic (78% LTV):\n• PMI auto-cancels at 78% loan-to-value\n• Based on original home value\n\n2️⃣ Request at 80% LTV:\n• You request cancellation\n• Based on original value\n• Must be current on payments\n\n3️⃣ Based on Current Value:\n• At 75% LTV after 2 years\n• At 80% LTV after 5 years\n• Home improvements can help!\n\n🗽 NY special rule: Based on appraised value at 75% LTV!",
    quickReplies: ['PMI info', 'Refinance options', 'Talk to a specialist']
  },

  assumable_mortgage: {
    patterns: ['assumable', 'assume mortgage', 'take over mortgage', 'mortgage assumption', 'assume loan'],
    response: "Assumable mortgages let you take over a seller's loan! 🔑\n\n✓ Eligible loans: FHA, VA, USDA\n✓ Keep seller's lower interest rate\n✓ No new appraisal needed\n\n⚠️ Considerations:\n• Need cash for equity difference\n• Example: $650K home, $500K loan = $150K needed\n• Must qualify with the lender\n• VA loans: 620+ credit, 0.5% funding fee\n\nGreat in high-rate environments if you find one!",
    quickReplies: ['FHA loans', 'VA loans', 'Talk to a specialist']
  },

  college_home: {
    patterns: ['college', 'student', 'college town', 'dorm', 'room and board', 'university'],
    response: "Buying a home for your college student can be smart! 🎓\n\n💡 Benefits:\n• Potential appreciation in college towns\n• Steady rental demand from students\n• Tax benefits (mortgage interest, repairs)\n• May help qualify for in-state tuition\n• Rent rooms to offset costs\n\n📊 Comparison:\n• On-campus: ~$12,000/year\n• Off-campus rent: ~$27,000/year\n• 4 years = $48,000-$108,000!\n\nTurn housing costs into an investment!",
    quickReplies: ['Investment properties', 'Tax benefits', 'Talk to a specialist']
  },

  tax_benefits: {
    patterns: ['tax', 'taxes', 'deduction', 'deductions', 'tax benefit', 'write off', '1098', 'tax season'],
    response: "Homeowner tax benefits you should know! 💰\n\n📄 Form 1098 (Mortgage Interest):\n• Deduct interest up to $750K mortgage\n• Get this from your lender\n\n🏠 Property Tax Deduction:\n• Up to $10,000 combined with state taxes\n• Keep your tax bills!\n\n🔐 PMI Deduction:\n• If you put less than 20% down\n• Income limits apply\n\n🏢 Home Office (Self-Employed):\n• Form 8829 for exclusive workspace\n• Deduct portion of home expenses\n\nAlways consult your tax professional!",
    quickReplies: ['Self-employed options', 'Documents needed', 'Talk to a specialist']
  }
};

// Lead capture triggers
const LEAD_TRIGGERS = [
  'talk to', 'specialist', 'advisor', 'contact', 'call me', 'get started',
  'start pre-approval', 'check my eligibility', 'get my rate', 'get pre-approved',
  'speak to', 'human', 'person', 'agent', 'loan officer', 'apply now'
];

// Default quick replies
const DEFAULT_QUICK_REPLIES = ['Loan options', 'Self-employed?', 'First-time buyer', 'Get pre-approved'];

function findMatch(text) {
  const lower = text.toLowerCase();

  // Check for lead capture triggers first
  for (const trigger of LEAD_TRIGGERS) {
    if (lower.includes(trigger)) {
      return { type: 'lead_capture' };
    }
  }

  // Check for negation patterns BEFORE regular matching
  // This handles cases like "I don't have 20% down"
  const negationMatch = checkNegation(lower);
  if (negationMatch) {
    return negationMatch;
  }

  // Correct typos before pattern matching
  const corrected = correctTypos(lower);

  // Check for intent (action + topic combinations) - uses both manual and auto-learning
  const intentMatch = checkIntent(lower, KNOWLEDGE_BASE);

  // Scoring-based matching for better accuracy
  let bestMatch = null;
  let bestKey = null;
  let bestScore = 0;

  for (const [key, data] of Object.entries(KNOWLEDGE_BASE)) {
    let score = 0;
    let matchedPatterns = 0;

    // Bonus if intent detection matched this key
    // Manual mappings get higher priority (100), auto-learning gets variable score
    if (intentMatch && intentMatch.key === key) {
      score += intentMatch.score;
    }

    for (const pattern of data.patterns) {
      // Check both original and corrected text
      if (corrected.includes(pattern) || lower.includes(pattern)) {
        matchedPatterns++;
        // Longer patterns are more specific = higher score
        score += pattern.length * 2;
        // Bonus for exact word boundaries (not partial matches)
        const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(corrected) || regex.test(lower)) {
          score += 10;
        }
      }
    }

    // Bonus for multiple pattern matches (topic is very relevant)
    if (matchedPatterns > 1) {
      score += matchedPatterns * 5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = data;
      bestKey = key;
    }
  }

  if (bestMatch) {
    return { type: 'knowledge', data: bestMatch, key: bestKey };
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
  // Conversation memory - tracks context for follow-up questions
  const [conversationContext, setConversationContext] = useState({
    lastTopic: null,      // Last knowledge base key matched
    lastTopicName: null,  // Human-readable topic name
    messageCount: 0       // Messages on current topic
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Check if user is asking a follow-up question
  const isFollowUp = (text) => {
    const lower = text.toLowerCase();
    return FOLLOW_UP_PHRASES.some(phrase => lower.includes(phrase));
  };

  // Get follow-up response for a topic
  const getFollowUpResponse = (topicKey) => {
    if (FOLLOW_UP_RESPONSES[topicKey]) {
      return FOLLOW_UP_RESPONSES[topicKey];
    }
    return FOLLOW_UP_RESPONSES.default;
  };

  // Initialize with welcome message
  useEffect(() => {
    setTimeout(() => {
      dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: {
          content: "Hey there! 👋 I'm your Legacy Mortgage assistant. With 25+ years of experience and Top 25 Lender status, we make home financing easy.\n\nHow can I help you today?",
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
        response = "I'd love to connect you with one of our mortgage specialists! Our team averages 10+ years of experience.\n\nWhat's your name?";
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
        response = `Perfect, ${newData.name}! ✅\n\nOne of our experienced loan officers will reach out within 24 hours at:\n📞 ${newData.phone}\n📧 ${newData.email}\n\nIn the meantime, is there anything else I can help you with?`;
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

    // Check if this is a follow-up question about the previous topic
    if (isFollowUp(text) && conversationContext.lastTopic) {
      const followUp = getFollowUpResponse(conversationContext.lastTopic);
      // Add closing push if this is 2nd+ message on topic
      const response = conversationContext.messageCount >= 1
        ? followUp.response + CLOSING_PUSH
        : followUp.response;

      addBotMessage(response, followUp.quickReplies);

      // Update context
      setConversationContext(prev => ({
        ...prev,
        messageCount: prev.messageCount + 1
      }));
      return;
    }

    // Find matching response
    const match = findMatch(text);

    if (match?.type === 'lead_capture') {
      const result = handleLeadCapture(text);
      addBotMessage(result.response, result.quickReplies);
      // Reset context when entering lead capture
      setConversationContext({ lastTopic: null, lastTopicName: null, messageCount: 0 });
    } else if (match?.type === 'negation') {
      // Handle negation responses (e.g., "I don't have 20% down")
      addBotMessage(match.data.response, match.data.quickReplies);
      setConversationContext({ lastTopic: 'negation', lastTopicName: 'alternatives', messageCount: 1 });
    } else if (match?.type === 'knowledge') {
      addBotMessage(match.data.response, match.data.quickReplies);
      // Store the topic for follow-up questions
      setConversationContext({
        lastTopic: match.key || null,
        lastTopicName: match.key || null,
        messageCount: 1
      });
    } else {
      addBotMessage(
        "I can help with lots of mortgage topics!\n\n• Loan types: FHA, VA, Conventional, Jumbo\n• Self-employed & Non-QM loans\n• First-time buyer programs\n• Refinancing & cash-out\n• Bridge loans & more!\n\nOr I can connect you with a specialist!",
        ['Loan options', 'Self-employed?', 'First-time buyer', 'Talk to a specialist']
      );
      // Reset context on fallback
      setConversationContext({ lastTopic: null, lastTopicName: null, messageCount: 0 });
    }
  };

  const handleQuickReply = (reply) => {
    handleSend(reply);
  };

  const handleRestart = () => {
    dispatch({ type: 'RESET' });
    setInputValue('');
    setLeadCapture({ active: false, step: 0, data: { name: '', phone: '', email: '' } });
    setConversationContext({ lastTopic: null, lastTopicName: null, messageCount: 0 });

    setTimeout(() => {
      dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: {
          content: "Hey there! 👋 I'm your Legacy Mortgage assistant. How can I help you today?",
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
              <h3 className="text-white font-semibold">Legacy Mortgage</h3>
              <p className="text-xs text-[#96DAF8]">A Luminate Bank Division · v{VERSION}</p>
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
            Legacy Mortgage Division · Luminate Bank · NMLS #1281698
          </p>
        </div>
      </div>
    </div>
  );
}
