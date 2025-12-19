/**
 * Legacy Mortgage Division Chatbot (Luminate Bank)
 * Version: 1.0.19
 *
 * CHANGELOG:
 * v1.0.19 - Lead capture validation & bug fixes
 *         - Added validation: full name required (first + last)
 *         - Phone must be 10+ digits
 *         - Email must contain @ and .
 *         - CTA buttons disabled during lead capture flow
 *         - Fixed bug where CTA clicks used as form data
 * v1.0.18 - Persistent CTA buttons
 *         - Added "Apply Now" and "Speak with Loan Officer" buttons
 *         - Always visible below the input area
 *         - Triggers pre-approval and lead capture flows
 * v1.0.17 - Down payment assistance flow
 *         - Added general down_payment_assistance topic
 *         - Asks which state before showing state-specific programs
 *         - Updated state patterns (NJ, PA, NY) to match quick replies
 *         - Added other_state topic for users in other states
 * v1.0.16 - Loan options overview
 *         - Added loan_options topic for "Loan options" quick reply
 *         - Shows all loan types: FHA, VA, USDA, Conventional, Jumbo, Non-QM, etc.
 * v1.0.15 - Complete branch location database
 *         - Added all 12 branch locations with full addresses
 *         - NJ: Little Falls (HQ), Pompton Plains, Ho-Ho-Kus, Shrewsbury, Edison, Toms River, Northfield
 *         - PA: Newtown
 *         - NY: Syosset, Smithtown, Hampton Bays
 *         - FL: Tampa
 * v1.0.14 - Expanded loan product knowledge base
 *         - Enhanced FHA, VA, USDA, Jumbo, Non-QM entries
 *         - Added FHA 203K Renovation & Interest-Only topics
 *         - Updated pre_approval with 3 levels (Pre-Qual, Pre-Approval, Home Buyer's Edge)
 *         - Enhanced Reverse Mortgage, ARM, Non-Warrantable Condo content
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
import { Send, Home, RotateCcw, FileText, Phone } from 'lucide-react';

const VERSION = '1.0.19';

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
    patterns: ['branch', 'branches', 'office location', 'offices', 'where are you located', 'nearest office', 'local office', 'visit', 'little falls', 'pompton plains', 'ho-ho-kus', 'hohokus', 'shrewsbury', 'edison', 'toms river', 'northfield', 'newtown', 'syosset', 'smithtown', 'hampton bays', 'tampa'],
    response: "📍 **Our Branch Locations:**\n\n**NEW JERSEY:**\n🏢 Little Falls (HQ): 219 Paterson Ave, 07424\n🏢 Pompton Plains: 142 Route 23 North, 07444\n🏢 Ho-Ho-Kus: 24 Sheridan Ave, 07423\n🏢 Shrewsbury: 39 Avenue at the Common, Ste 101, 07702\n🏢 Edison: 505 Thornall St, Ste 303, 08837\n🏢 Toms River: 1848 Hooper Ave, Unit B, 08753\n🏢 Northfield: 2312 New Road, Ste 105, 08225\n\n**PENNSYLVANIA:**\n🏢 Newtown: 223 N. Sycamore St, Unit 3, 18940\n\n**NEW YORK:**\n🏢 Syosset: 6851 Jericho Tpke, Ste 135, 11791\n🏢 Smithtown: 11 Redwood Lane, 11787\n🏢 Hampton Bays: 67 W. Montauk Hwy, 11946\n\n**FLORIDA:**\n🏢 Tampa: 1205 N. Franklin St, Ste 106, 33602\n\nAll offices are by appointment. Want to connect with a loan officer near you?",
    quickReplies: ['Talk to a specialist', 'Get pre-approved', 'Contact us']
  },

  contact: {
    patterns: ['contact', 'phone', 'email', 'address', 'reach', 'call', 'little falls'],
    response: "📍 **Legacy Mortgage Division**\n219 Paterson Ave\nLittle Falls, NJ 07424\n\n🌐 legacymortgagedivision.com\n\n📞 We have loan officers across the country ready to help! Whether you're in NJ, NY, FL, PA, or anywhere else — we've got you covered.\n\nReady to get started? I can connect you with a specialist in your area!",
    quickReplies: ['Talk to a specialist', 'Branch locations', 'Get pre-approved']
  },

  // ==================== LOAN PRODUCTS ====================
  loan_options: {
    patterns: ['loan options', 'loan types', 'types of loans', 'what loans', 'loan programs', 'mortgage options', 'mortgage types', 'what kind of loans', 'which loan'],
    response: "We offer a full range of mortgage solutions! 🏠\n\n**Government Loans:**\n• **FHA** — 3.5% down, flexible credit (580+)\n• **VA** — 0% down for veterans, NO PMI!\n• **USDA** — 0% down for rural areas\n\n**Conventional Loans:**\n• **Conforming** — 3-5% down, PMI drops at 20%\n• **Jumbo** — High-value homes, 10% down, NO PMI!\n\n**Specialty Programs:**\n• **Non-QM** — Self-employed, bank statements\n• **FHA 203K** — Renovation financing\n• **ARM** — Lower initial rates\n• **Reverse** — For homeowners 62+\n• **Bridge Loans** — Buy before you sell\n\nWhich type interests you most?",
    quickReplies: ['FHA loans', 'VA loans', 'Self-employed options', 'First-time buyer']
  },

  down_payment: {
    patterns: ['down payment', 'downpayment', 'how much down', 'money down', 'upfront'],
    response: "Down payment requirements vary by loan type:\n\n💰 **Zero Down:**\n• VA: $0 (veterans/military)\n• USDA: $0 (eligible rural areas)\n\n💰 **Low Down:**\n• FHA: 3.5%\n• Conventional: 3-5%\n• Jumbo: 10% (NO PMI!)\n\nLooking for assistance programs? We have options in multiple states!",
    quickReplies: ['Down payment assistance', 'FHA loans', 'VA loans']
  },

  down_payment_assistance: {
    patterns: ['down payment assistance', 'down payment help', 'assistance program', 'dpa', 'grant', 'help with down payment', 'state program', 'state programs'],
    response: "Great news — we offer down payment assistance in multiple states! 🎁\n\n**Programs Available:**\n• **New Jersey:** Smart Start (up to $15,000!)\n• **Pennsylvania:** Keystone, K-FIT (up to $6,000)\n• **New York:** SONYMA programs\n• **Other States:** Various local programs\n\nWhich state are you buying in?",
    quickReplies: ['New Jersey', 'Pennsylvania', 'New York', 'Other state']
  },

  fha: {
    patterns: ['fha', 'fha loan', 'what is fha', 'federal housing', 'federal housing administration'],
    response: "FHA loans are government-insured mortgages designed to make homeownership accessible! 🏛️\n\n**Key Benefits:**\n✓ Down payments as low as **3.5%**\n✓ Credit scores from **580** accepted\n✓ Flexible debt-to-income ratios\n✓ Gift funds allowed for down payment\n✓ Loan is **guaranteed by the government**\n\n**FHA Loan Options:**\n• Purchase loans (primary residence)\n• Refinance options\n• Energy-efficient mortgages\n• FHA 203K renovation loans\n• Reverse mortgages (HECM)\n\n💡 Created in 1934, FHA loans stimulate economic development and help more Americans achieve homeownership!\n\nReady to see if you qualify? It's easier than ever!",
    quickReplies: ['Get pre-qualified', 'FHA 203K Renovation', 'First-time buyer']
  },

  va: {
    patterns: ['va loan', 'va ', 'veteran', 'military', 'service member', 'surviving spouse', 'certificate of eligibility', 'coe'],
    response: "Thank you for your service! 🎖️ VA loans offer incredible benefits:\n\n**Key Benefits:**\n✓ **NO down payment** required\n✓ **NO PMI** — ever!\n✓ Competitive interest rates\n✓ No penalty for early payoff\n✓ VA assistance if payment issues arise\n\n**Who's Eligible:**\n• Active-duty military\n• Veterans\n• Reservists & National Guard\n• Some surviving spouses\n\n📋 **Certificate of Eligibility (COE):**\nYou'll need a COE to verify eligibility — we can help you get this online, by mail, or through us directly!\n\nLet one of our experienced VA financing professionals help you!",
    quickReplies: ['Check VA eligibility', 'Get pre-qualified', 'Talk to VA specialist']
  },

  jumbo: {
    patterns: ['jumbo', 'jumbo loan', 'high balance', 'over limit', 'large loan', 'expensive home', 'non-conforming', 'luxury home'],
    response: "Need financing for a high-value property? Our Jumbo loans are exceptional! 💎\n\n**Key Benefits:**\n✓ Exceeds conforming loan limits\n✓ As little as **10% down**\n✓ **NO PMI** required!\n✓ Competitive rates\n✓ Rapidly builds credit!\n\n**Two Options:**\n• **Fixed-Rate Jumbo:** Consistent payments, easier budgeting\n• **Adjustable-Rate Jumbo:** Lower initial payments, great if relocating\n\n**Perfect For:**\n• Luxury & high-value homes\n• High-cost areas (NYC, NJ, FL)\n• Buyers anticipating income growth\n\nTalking to a licensed loan officer is the first step. We offer greater flexibility and competitive rates!",
    quickReplies: ['Check jumbo rates', 'Fixed vs ARM', 'Talk to a specialist']
  },

  usda: {
    patterns: ['usda', 'rural', 'rural development', 'rural area', 'rural housing', 'guaranteed rural'],
    response: "USDA Guaranteed Rural Housing Loans offer amazing benefits! 🌾\n\n**Key Benefits:**\n✓ **100% financing** — NO down payment!\n✓ Better terms than FHA or conventional\n✓ Great interest rates\n✓ 30-year fixed term\n\n**Eligibility Requirements:**\n• Property must be in USDA-defined rural area\n• Must be owner-occupied (primary residence)\n• Income up to 115% of area median\n• Meet credit and income requirements\n\n💡 Many suburban areas just outside cities qualify — you might be surprised!\n\nLet our experienced USDA financing professional help you navigate the process!",
    quickReplies: ['Check USDA eligibility', 'Zero down options', 'Talk to a specialist']
  },

  conventional: {
    patterns: ['conventional', 'conforming', 'traditional loan', 'regular mortgage'],
    response: "Conventional loans are traditional mortgages with great flexibility:\n\n✓ Down payments from 3-5%\n✓ PMI drops off at 20% equity\n✓ Multiple property types eligible\n✓ Primary, second home, or investment\n✓ Higher loan limits available\n\nRequires: 620+ credit, stable income, manageable debt.",
    quickReplies: ['FHA vs Conventional', 'Down payment options', 'Get pre-approved']
  },

  // ==================== SPECIALTY PRODUCTS ====================
  non_qm: {
    patterns: ['non-qm', 'non qm', 'nonqm', 'alternative', 'non-traditional', 'alternative income', 'non qualified mortgage'],
    response: "Non-QM loans are perfect for borrowers who don't fit traditional guidelines! 📋\n\n**Who Benefits from Non-QM:**\n• Self-employed borrowers\n• Real estate investors\n• Foreign nationals\n• Prime & near-prime borrowers\n• Those with significant assets\n• Recent credit events\n\n**Verification Options:**\n• Full documentation\n• 1-year tax return program\n• Bank statement program (6 or 12 months)\n• Asset depletion/qualification\n\n**Use For:**\n• Purchases\n• Rate-and-term refinances\n• Cash-out refinances\n• Owner-occupied, second homes, or investment\n\n🏆 We're a **Top Non-QM Lender** — not every lender offers this. We specialize in finding solutions!",
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
    patterns: ['reverse', 'reverse mortgage', 'hecm', 'senior', '62', 'retirement', 'equity access', 'over 62'],
    response: "We're a **leading Reverse Mortgage lender**! 🏡\n\n**How It Works:**\n• NO monthly payments required\n• Receive payments from your equity instead!\n• Retain ownership and title\n• Loan repaid when home sells or you move\n\n**Why Seniors Love It:**\n• Cover living expenses\n• Pay medical bills\n• Home improvements\n• Travel & enjoy retirement!\n\n**Eligibility:**\n• Must be 62+ years old\n• Primary residence\n• Single-family, 2-4 unit, townhome, or approved condo\n\n💰 **Proceeds are NOT subject to income tax!**\n\nOur loan officers are trained on the latest trends. Call 1-800-908-0005!",
    quickReplies: ['HECM eligibility', 'How much can I get?', 'Talk to a specialist']
  },

  arm: {
    patterns: ['arm', 'adjustable', 'adjustable rate', '5/1', '7/1', '10/1', 'variable', '3/1', 'sofr'],
    response: "Adjustable Rate Mortgages (ARMs) offer **lower initial rates**! 📊\n\n**How ARMs Work:**\n• Rate is fixed for 3-10 years initially\n• Then adjusts based on market index (SOFR)\n• Lower initial payments than fixed-rate!\n\n**Common Options:**\n• 3/1 ARM: Fixed 3 years, then adjusts yearly\n• 5/1 ARM: Fixed 5 years\n• 7/1 ARM: Fixed 7 years\n• 10/1 ARM: Fixed 10 years\n\n**Rate Caps Protect You:**\n• Periodic cap: Limits each adjustment\n• Lifetime cap: Limits total increase over loan life\n\n✅ **Best For:**\n• Planning to move/relocate\n• Expecting income to increase\n• Short-term homeownership\n\nLet us help you find the right ARM structure!",
    quickReplies: ['ARM vs Fixed', 'Current rates', 'Talk to a specialist']
  },

  non_warrantable_condo: {
    patterns: ['condo', 'non-warrantable', 'warrantable', 'hoa', 'condo financing', 'condominium'],
    response: "Non-Warrantable Condo Financing — we help when others can't! 🏢\n\n**A condo may be non-warrantable if:**\n• Single entity owns 10%+ of units\n• Project not yet completed\n• Developer hasn't transferred HOA control\n• Short-term rentals allowed\n• Majority of units are rented\n• HOA involved in litigation\n• Commercial space exceeds 25%\n\n**Warrantable condo requirements:**\n✓ No entity owns >10% of units\n✓ 51%+ owner-occupied\n✓ <15% units behind on HOA dues\n✓ No HOA lawsuits\n\n💡 **Important:** Ask about warrantability BEFORE making an offer!\n\nWe specialize in finding solutions for non-warrantable condos!",
    quickReplies: ['Talk to a specialist', 'Condo eligibility', 'Get pre-approved']
  },

  fha_203k: {
    patterns: ['203k', '203(k)', 'renovation loan', 'rehab loan', 'fixer upper', 'fixer-upper', 'needs work', 'renovate', 'rehabilitation'],
    response: "FHA 203K Renovation Loans — turn a fixer-upper into your dream home! 🔨\n\n**Benefits:**\n✓ Finance purchase + renovations in ONE loan\n✓ Down payment as low as **3.5%**\n✓ 30-year fixed rate\n✓ Flexible FHA underwriting\n✓ Potential value appreciation!\n\n**Two Types:**\n• **Standard 203K:** Structural repairs, additions, room expansions\n• **Streamlined 203K:** Non-structural (up to $35,000) — paint, appliances, flooring\n\n**What's Covered:**\n✓ Kitchen & bathroom remodels\n✓ Plumbing, HVAC, flooring\n✓ Additions & second stories\n✓ New siding, patios, decks\n✓ Even new well & septic!\n\n🏠 We have 30+ years experience with 203K loans. Let's make your vision a reality!",
    quickReplies: ['203K eligibility', 'How much can I borrow?', 'Talk to a specialist']
  },

  interest_only: {
    patterns: ['interest only', 'interest-only', 'io loan', 'interest only mortgage', 'lower payment'],
    response: "Interest-Only Mortgages offer **flexibility** for the right borrower! 💵\n\n**How It Works:**\n• Pay only interest for first 5-10 years\n• Principal stays unchanged initially\n• Lower payments early in the loan\n• Then begin paying principal + interest\n\n**Great For:**\n• First-time homeowners adjusting to costs\n• Freelancers/commission workers with variable income\n• Ready to buy high-value now, income increasing later\n• Investors prioritizing cash flow\n• Diverting income to investments/college/retirement\n\n⚠️ **Consider:** Payments increase after interest-only period.\n\nWant to see if this strategy fits your financial goals?",
    quickReplies: ['Compare loan options', 'Talk to a specialist', 'Get pre-approved']
  },

  // ==================== ASSISTANCE PROGRAMS ====================
  ny_assistance: {
    patterns: ['new york', 'ny program', 'new york assistance', 'sonyma', 'new york help'],
    response: "New York Mortgage Assistance Programs available! 🗽\n\n💰 **SONYMA Programs:**\n• Down payment assistance loans\n• Low-interest rate options\n• First-time buyer grants\n\n💰 **Additional Options:**\n• Income-based programs\n• NYC-specific programs\n• County assistance programs\n\nWe know NY programs inside and out. Let us find the right fit for you!",
    quickReplies: ['Get pre-qualified', 'Talk to a specialist']
  },

  first_time: {
    patterns: ['first time', 'first-time', 'first home', 'never bought', 'new buyer', 'buying first', 'first house'],
    response: "Buying your first home is an exciting milestone! 🏠\n\n**Step 1:** Understand how much house you can afford\n**Step 2:** Explore loan programs for first-time buyers\n**Step 3:** Customize your loan to fit YOUR needs\n\n🎁 **First-Time Buyer Perks:**\n• FHA loans with just 3.5% down\n• Down payment assistance programs\n• State-specific grants (NY SONYMA, NJ Smart Start)\n• Gift funds allowed for down payment\n• Lower PMI rates\n\n💡 You may qualify even if you owned a home 3+ years ago!\n\nReady to take the first step? Get pre-qualified — it's FREE!",
    quickReplies: ['Get pre-qualified', 'FHA loans', 'Down payment help']
  },

  // ==================== PROCESS & GENERAL ====================
  pre_approval: {
    patterns: ['pre-approval', 'preapproval', 'pre approved', 'preapproved', 'get approved', 'qualify', 'how much can i', 'pre-qualification', 'prequalification', 'pre qualified', 'prequalified', 'credit approval'],
    response: "Getting pre-approved is your smart first step! We offer **3 levels** of approval:\n\n📋 **1. Pre-Qualification** (Fastest)\n• Quick estimate of buying power\n• Basic credit & income review\n• Great starting point!\n\n✅ **2. Pre-Approval** (Most Common)\n• Verified income & assets\n• Credit report pulled\n• Strong offer position\n\n🏆 **3. Credit Approval with Home Buyer's Edge**\n• Full underwriting completed BEFORE you shop\n• Strongest possible offer\n• Close faster than competition!\n\n💡 **All consultations are FREE** — no cost, no obligation.\n\nWhich level works best for your timeline?",
    quickReplies: ['Get pre-qualified FREE', 'Home Buyer\'s Edge', 'Talk to a specialist']
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
    patterns: ['pennsylvania', 'pa program', 'keystone', 'phfa', 'pa assistance', 'k-fit'],
    response: "Pennsylvania has great assistance programs! 🏠\n\n💰 **Keystone Advantage:**\n• 4% or up to $6,000 assistance\n• 0% interest, 10-year repayment\n• Min 660 credit score\n\n💰 **K-FIT Program:**\n• 5% of purchase price\n• **Forgiven over 10 years!**\n• Min 660 credit score\n\n💰 **PHFA $500 Grant:**\n• No repayment required!\n\nThese can combine with FHA, VA, Conventional!",
    quickReplies: ['Get pre-qualified', 'Talk to a specialist']
  },

  nj_assistance: {
    patterns: ['new jersey', 'nj program', 'njhmfa', 'your home program', 'nj assistance', 'smart start'],
    response: "New Jersey offers fantastic homebuyer programs! 🏡\n\n💰 **Smart Start DPA:**\n• Up to **$15,000** in select counties!\n• $10,000 in other NJ counties\n• Pairs with NJHMFA first mortgage\n\n💰 **YOUR Home Program:**\n• Below-market interest rates\n• As little as 5% down\n• No first-time buyer requirement!\n\n**Eligible Counties for $15K:**\nBergen, Essex, Hudson, Mercer, Middlesex, Monmouth, Morris, Ocean, Passaic, Somerset, Union!\n\nWant to see if you qualify?",
    quickReplies: ['Get pre-qualified', 'Talk to a specialist']
  },

  other_state: {
    patterns: ['other state', 'different state', 'not listed', 'another state'],
    response: "We're licensed in all 50 states and can help find programs in your area! 🇺🇸\n\nMany states and counties offer:\n• Down payment assistance\n• First-time buyer grants\n• Low-interest programs\n• Employer assistance programs\n\nTell us where you're buying and we'll research available programs for you!",
    quickReplies: ['Talk to a specialist', 'Get pre-qualified']
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

  // Validation helpers
  const isValidFullName = (name) => {
    const trimmed = name.trim();
    const parts = trimmed.split(/\s+/);
    return parts.length >= 2 && parts.every(part => part.length >= 1);
  };

  const isValidPhone = (phone) => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  };

  const isValidEmail = (email) => {
    return email.includes('@') && email.includes('.');
  };

  const handleLeadCapture = (input) => {
    const { step, data } = leadCapture;
    let newData = { ...data };
    let response = '';
    let quickReplies = [];
    let nextStep = step;
    let stayActive = true;

    switch (step) {
      case 0:
        response = "I'd love to connect you with one of our mortgage specialists! Our team averages 10+ years of experience.\n\nWhat's your full name (first and last)?";
        nextStep = 1;
        break;
      case 1:
        if (!isValidFullName(input)) {
          response = "Please enter your full name (first and last name):";
          nextStep = 1; // Stay on same step
          break;
        }
        newData.name = input;
        response = `Nice to meet you, ${input}! What's the best phone number to reach you?`;
        nextStep = 2;
        break;
      case 2:
        if (!isValidPhone(input)) {
          response = "Please enter a valid phone number (10 digits):";
          nextStep = 2; // Stay on same step
          break;
        }
        newData.phone = input;
        response = "Great! And what's your email address?";
        nextStep = 3;
        break;
      case 3:
        if (!isValidEmail(input)) {
          response = "Please enter a valid email address (must include @ symbol):";
          nextStep = 3; // Stay on same step
          break;
        }
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

        {/* CTA Buttons */}
        <div className="flex gap-2 px-4 py-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => !leadCapture.active && handleSend('Get pre-approved')}
            disabled={leadCapture.active}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              leadCapture.active
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#0D1834] text-white hover:bg-[#1a2d4d]'
            }`}
          >
            <FileText className="w-4 h-4" />
            Apply Now
          </button>
          <button
            onClick={() => !leadCapture.active && handleSend('Talk to a specialist')}
            disabled={leadCapture.active}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              leadCapture.active
                ? 'bg-gray-100 text-gray-400 border-2 border-gray-300 cursor-not-allowed'
                : 'bg-white text-[#0D1834] border-2 border-[#0D1834] hover:bg-[#0D1834] hover:text-white'
            }`}
          >
            <Phone className="w-4 h-4" />
            Speak with Loan Officer
          </button>
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
