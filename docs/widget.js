/**
 * Legacy Mortgage Chatbot Widget
 * Version: 1.0.20
 *
 * Usage: <script src="https://[your-github-username].github.io/Legacy-Chat-Bot/widget.js"></script>
 *
 * Optional configuration (before loading script):
 * window.LMCConfig = {
 *   autoOpen: true,
 *   autoOpenDelay: 2000,
 *   autoOpenOnce: true,
 *   webhookUrl: 'https://hooks.zapier.com/hooks/catch/YOUR_ID/YOUR_HOOK/'
 * };
 */
(function() {
  'use strict';

  // ============ CONFIGURATION ============
  var defaultConfig = {
    loName: 'Legacy Mortgage',
    loId: 'default',
    siteId: window.location.hostname,
    autoOpen: true,
    autoOpenDelay: 2000,
    autoOpenOnce: true,
    webhookUrl: null // Zapier webhook URL for lead capture
  };

  var CONFIG = Object.assign({}, defaultConfig, window.LMCConfig || {});

  // ============ INJECT STYLES ============
  var styles = `
    #lmc-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    }
    #lmc-btn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #0D1834;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(13, 24, 52, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    #lmc-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(13, 24, 52, 0.5);
    }
    #lmc-window {
      display: none;
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 400px;
      height: 600px;
      background: #f9fafb;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      flex-direction: column;
      overflow: hidden;
    }
    #lmc-window.open {
      display: flex;
      animation: lmc-slideUp 0.3s ease;
    }
    @keyframes lmc-slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    #lmc-header {
      background: #0D1834;
      color: white;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #lmc-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    #lmc-avatar {
      width: 40px;
      height: 40px;
      background: #96DAF8;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #lmc-avatar svg { fill: #0D1834; }
    #lmc-title {
      font-weight: 600;
      font-size: 18px;
    }
    #lmc-subtitle {
      font-size: 12px;
      color: #96DAF8;
      margin-top: 2px;
    }
    #lmc-restart-btn {
      background: transparent;
      border: none;
      color: #96DAF8;
      padding: 8px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    #lmc-restart-btn:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }
    #lmc-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .lmc-msg {
      max-width: 85%;
      padding: 14px 18px;
      border-radius: 18px;
      line-height: 1.5;
      font-size: 14px;
      animation: lmc-fadeIn 0.3s ease;
    }
    @keyframes lmc-fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .lmc-msg.bot {
      background: #ffffff;
      align-self: flex-start;
      border-bottom-left-radius: 6px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      border: 1px solid #e5e7eb;
      color: #1f2937;
    }
    .lmc-msg.user {
      background: #0D1834;
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 6px;
    }
    .lmc-msg strong { color: #0D1834; }
    .lmc-msg.user strong { color: white; }
    #lmc-quick-replies {
      padding: 0 20px 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .lmc-qr {
      background: #ffffff;
      border: 1px solid #96DAF8;
      color: #0D1834;
      padding: 8px 16px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .lmc-qr:hover {
      background: rgba(150, 218, 248, 0.2);
    }
    #lmc-input-area {
      padding: 16px 20px;
      background: #ffffff;
      display: flex;
      gap: 12px;
      border-top: 1px solid #e5e7eb;
    }
    #lmc-input {
      flex: 1;
      border: 2px solid #e5e7eb;
      border-radius: 25px;
      padding: 12px 18px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    #lmc-input:focus {
      border-color: #0D1834;
    }
    #lmc-send {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #0D1834;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      color: white;
    }
    #lmc-send:hover {
      background: #1a2d4d;
    }
    #lmc-cta-bar {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    .lmc-cta-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }
    .lmc-cta-primary {
      background: #0D1834;
      color: white;
    }
    .lmc-cta-primary:hover {
      background: #1a2d4d;
    }
    .lmc-cta-secondary {
      background: #ffffff;
      color: #0D1834;
      border: 2px solid #0D1834;
    }
    .lmc-cta-secondary:hover {
      background: #0D1834;
      color: white;
    }
    #lmc-footer {
      padding: 8px;
      text-align: center;
      font-size: 11px;
      color: #6b7280;
      background: #ffffff;
      border-top: 1px solid #e5e7eb;
    }
    .lmc-lead-form {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      padding: 16px;
      border-radius: 14px;
      margin-top: 8px;
    }
    .lmc-lead-form input {
      width: 100%;
      padding: 12px 14px;
      margin: 6px 0;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 14px;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .lmc-lead-form input:focus {
      outline: none;
      border-color: #0D1834;
    }
    .lmc-lead-form button {
      width: 100%;
      padding: 14px;
      margin-top: 12px;
      background: #0D1834;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .lmc-lead-form button:hover {
      background: #1a2d4d;
    }
    @media (max-width: 480px) {
      #lmc-window {
        width: calc(100vw - 32px);
        height: calc(100vh - 100px);
        bottom: 80px;
        right: -8px;
        border-radius: 16px;
      }
    }
  `;

  var styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // ============ INJECT HTML ============
  var html = `
    <div id="lmc-widget">
      <button id="lmc-btn">
        <svg id="lmc-icon-open" viewBox="0 0 24 24" width="28" height="28" fill="white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
        <svg id="lmc-icon-close" viewBox="0 0 24 24" width="28" height="28" fill="white" style="display:none">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
      <div id="lmc-window">
        <div id="lmc-header">
          <div id="lmc-header-info">
            <div id="lmc-avatar">
              <svg viewBox="0 0 24 24" width="24" height="24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            </div>
            <div>
              <div id="lmc-title">Legacy Mortgage</div>
              <div id="lmc-subtitle">A Luminate Bank Division · v1.0.23</div>
            </div>
          </div>
          <button id="lmc-restart-btn" title="Start over">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </button>
        </div>
        <div id="lmc-messages"></div>
        <div id="lmc-quick-replies"></div>
        <div id="lmc-input-area">
          <input type="text" id="lmc-input" placeholder="Ask me anything about mortgages...">
          <button id="lmc-send">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        <div id="lmc-cta-bar">
          <button class="lmc-cta-btn lmc-cta-primary" id="lmc-apply-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            Apply Now
          </button>
          <button class="lmc-cta-btn lmc-cta-secondary" id="lmc-speak-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 00-1.02.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1A11.36 11.36 0 018.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>
            </svg>
            Speak with Loan Officer
          </button>
        </div>
        <div id="lmc-footer">Legacy Mortgage Division · Luminate Bank · NMLS #1281698</div>
      </div>
    </div>
  `;

  var container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container.firstElementChild);

  // ============ CONVERSATION MEMORY ============
  var conversationContext = {
    lastTopic: null,
    lastTopicName: null,
    messageCount: 0
  };

  var FOLLOW_UP_PHRASES = [
    'tell me more', 'more about', 'more info', 'more information',
    'explain more', 'go on', 'continue', 'what else',
    'these loans', 'those loans', 'that loan', 'this loan',
    'that option', 'those options', 'these options',
    'how does that work', 'how do they work', 'how does it work',
    'sounds good', 'sounds interesting', 'interested',
    'yes', 'yeah', 'yep', 'sure', 'ok tell me', 'and', 'what about'
  ];

  var FOLLOW_UP_RESPONSES = {
    self_employed: { response: "Let me break down your best options as a self-employed borrower:\n\n<strong>Bank Statement Loans:</strong>\n• We average your deposits over 12-24 months\n• Personal OR business accounts work\n• No tax returns needed!\n\n<strong>Asset Depletion:</strong>\n• Use retirement/investment accounts\n• Perfect for high net worth borrowers\n\nA quick call with our specialists can identify which option saves you the most!", quickReplies: ['Talk to a specialist', 'Get pre-approved'] },
    fha: { response: "FHA is fantastic for many buyers — here's the full picture:\n\n<strong>Pros:</strong>\n• 3.5% down (gift funds OK!)\n• 580 credit score minimum\n• Higher DTI allowed (up to 50%+)\n• Seller can pay up to 6% closing costs\n\n<strong>Considerations:</strong>\n• Mortgage insurance for life of loan\n• Property must meet FHA standards\n\n<strong>Pro Tip:</strong> Refinance to conventional later and drop MI!", quickReplies: ['Get pre-approved', 'Talk to a specialist'] },
    va: { response: "VA loans are the best deal in mortgages:\n\n<strong>Unbeatable Benefits:</strong>\n• TRUE 0% down payment\n• ZERO PMI — ever!\n• Lower rates than conventional\n• No prepayment penalties\n\n<strong>Eligibility:</strong>\n• 90+ days active duty (wartime)\n• 181+ days active duty (peacetime)\n• 6+ years National Guard/Reserves\n• Surviving spouses may qualify\n\nThank you for your service! Let's get you home.", quickReplies: ['Check eligibility', 'Get pre-approved'] },
    jumbo: { response: "Our Jumbo loans are industry-leading:\n\n<strong>Key Advantages:</strong>\n• 10% down with NO PMI!\n• Loan amounts $766,550+\n• Up to $3M+ available\n• Competitive rates\n\n<strong>Requirements:</strong>\n• 700+ credit score ideal\n• 6-12 months reserves\n• Stable income history\n\nHigh-value properties need specialized handling!", quickReplies: ['Talk to a specialist', 'Get pre-approved'] },
    pre_approval: { response: "Pre-approval is your secret weapon:\n\n<strong>Benefits:</strong>\n• Know your EXACT budget\n• Sellers take you seriously\n• Beat other buyers to offers\n• Lock your rate early\n\n<strong>What We Need:</strong>\n• ID & Social Security\n• Pay stubs (30 days)\n• W-2s or tax returns (2 years)\n• Bank statements (2 months)\n\nUsually 24-48 hours! No cost, no obligation.", quickReplies: ['Start pre-approval', 'Talk to a specialist'] },
    default: { response: "I'd love to give you more specific details!\n\nThe best way to get personalized information is a quick conversation with one of our loan specialists. They can:\n\n• Answer your specific questions\n• Run scenarios for your situation\n• Show you exact rates and payments\n\nNo pressure, no obligation!", quickReplies: ['Talk to a specialist', 'Get pre-approved'] }
  };

  // ============ KNOWLEDGE BASE ============
  var KNOWLEDGE = {
    about: { patterns: ['about you', 'about legacy', 'about luminate', 'who are you', 'your company'], response: "Legacy Mortgage Division is part of Luminate Bank — a <strong>Top 25 Retail Mortgage Lender</strong> nationwide!\n\n• 700+ mortgage professionals\n• 25+ years of experience\n• FDIC-insured institution\n• Licensed in all 50 states\n• Specializing in NJ, NY, FL & PA\n\nWe combine big-bank security with personalized service!", quickReplies: ['Loan options', 'Get pre-approved', 'Branch locations'] },

    service_areas: { patterns: ['where do you', 'service area', 'what states', 'locations'], response: "We're licensed in all 50 states!\n\nOur specialty areas:\n• New Jersey (HQ in Little Falls)\n• New York\n• Florida (Gulf Coast & Tampa Bay)\n• Pennsylvania\n\nWith 700+ mortgage professionals nationwide, we have local experts in your area!", quickReplies: ['Branch locations', 'Contact us', 'Get pre-approved'] },

    branch_locations: { patterns: ['branch', 'branches', 'office', 'little falls', 'pompton plains', 'ho-ho-kus', 'shrewsbury', 'edison', 'toms river', 'northfield', 'newtown', 'syosset', 'smithtown', 'hampton bays', 'tampa'], response: "<strong>Our Branch Locations:</strong>\n\n<strong>NEW JERSEY:</strong>\n• Little Falls (HQ): 219 Paterson Ave\n• Pompton Plains: 142 Route 23 North\n• Ho-Ho-Kus: 24 Sheridan Ave\n• Shrewsbury: 39 Avenue at the Common\n• Edison: 505 Thornall St\n• Toms River: 1848 Hooper Ave\n• Northfield: 2312 New Road\n\n<strong>PA:</strong> Newtown: 223 N. Sycamore St\n\n<strong>NY:</strong> Syosset | Smithtown | Hampton Bays\n\n<strong>FL:</strong> Tampa: 1205 N. Franklin St\n\nAll offices by appointment!", quickReplies: ['Talk to a specialist', 'Get pre-approved'] },

    contact: { patterns: ['contact', 'phone', 'email', 'call', 'reach', 'speak', 'talk to', 'specialist', 'human', 'person'], response: "I'd love to connect you with a specialist!\n\nPlease share your info and we'll reach out shortly:", quickReplies: [], showLeadForm: true },

    loan_options: { patterns: ['loan options', 'loan types', 'types of loans', 'what loans', 'mortgage options', 'what kind'], response: "We offer a full range of mortgage solutions!\n\n<strong>Government Loans:</strong>\n• <strong>FHA</strong> — 3.5% down, flexible credit (580+)\n• <strong>VA</strong> — 0% down for veterans, NO PMI!\n• <strong>USDA</strong> — 0% down for rural areas\n\n<strong>Conventional Loans:</strong>\n• <strong>Conforming</strong> — 3-5% down, PMI drops at 20%\n• <strong>Jumbo</strong> — High-value homes, 10% down, NO PMI!\n\n<strong>Specialty Programs:</strong>\n• <strong>Non-QM</strong> — Self-employed, bank statements\n• <strong>FHA 203K</strong> — Renovation financing\n• <strong>Reverse</strong> — For homeowners 62+\n\nWhich type interests you most?", quickReplies: ['FHA loans', 'VA loans', 'Self-employed', 'First-time buyer'] },

    fha: { patterns: ['fha', 'fha loan', 'federal housing'], response: "FHA loans are government-insured mortgages!\n\n<strong>Key Benefits:</strong>\n• Down payments as low as <strong>3.5%</strong>\n• Credit scores from <strong>580</strong> accepted\n• Flexible debt-to-income ratios\n• Gift funds allowed for down payment\n• Guaranteed by the government\n\n<strong>FHA Loan Options:</strong>\n• Purchase loans\n• Refinance options\n• FHA 203K renovation loans\n• Reverse mortgages (HECM)\n\nReady to see if you qualify?", quickReplies: ['Get pre-qualified', 'FHA 203K', 'First-time buyer'] },

    va: { patterns: ['va loan', 'va ', 'veteran', 'military', 'service member'], response: "Thank you for your service! VA loans offer incredible benefits:\n\n<strong>Key Benefits:</strong>\n• <strong>NO down payment</strong> required\n• <strong>NO PMI</strong> — ever!\n• Competitive interest rates\n• No penalty for early payoff\n\n<strong>Who's Eligible:</strong>\n• Active-duty military\n• Veterans\n• Reservists & National Guard\n• Some surviving spouses\n\nYou'll need a Certificate of Eligibility (COE) — we can help you get this!\n\nLet one of our VA specialists help you!", quickReplies: ['Check VA eligibility', 'Get pre-qualified', 'Talk to specialist'] },

    jumbo: { patterns: ['jumbo', 'jumbo loan', 'high balance', 'large loan', 'expensive home', 'luxury'], response: "Need financing for a high-value property? Our Jumbo loans are exceptional!\n\n<strong>Key Benefits:</strong>\n• Exceeds conforming loan limits\n• As little as <strong>10% down</strong>\n• <strong>NO PMI</strong> required!\n• Competitive rates\n\n<strong>Two Options:</strong>\n• <strong>Fixed-Rate Jumbo:</strong> Consistent payments\n• <strong>Adjustable-Rate Jumbo:</strong> Lower initial payments\n\n<strong>Perfect For:</strong>\n• Luxury & high-value homes\n• High-cost areas (NYC, NJ, FL)\n\nWe offer greater flexibility and competitive rates!", quickReplies: ['Check rates', 'Talk to a specialist'] },

    usda: { patterns: ['usda', 'rural', 'rural area'], response: "USDA Guaranteed Rural Housing Loans offer amazing benefits!\n\n<strong>Key Benefits:</strong>\n• <strong>100% financing</strong> — NO down payment!\n• Better terms than FHA or conventional\n• Great interest rates\n• 30-year fixed term\n\n<strong>Eligibility:</strong>\n• Property in USDA-defined rural area\n• Owner-occupied primary residence\n• Income up to 115% of area median\n\nMany suburban areas qualify — you might be surprised!", quickReplies: ['Check eligibility', 'Zero down options', 'Talk to specialist'] },

    conventional: { patterns: ['conventional', 'conforming', 'traditional loan'], response: "Conventional loans are traditional mortgages with great flexibility:\n\n• Down payments from 3-5%\n• PMI drops off at 20% equity\n• Multiple property types eligible\n• Primary, second home, or investment\n• Higher loan limits available\n\nRequires: 620+ credit, stable income, manageable debt.", quickReplies: ['FHA vs Conventional', 'Down payment options', 'Get pre-approved'] },

    non_qm: { patterns: ['non-qm', 'non qm', 'nonqm', 'alternative', 'non-traditional'], response: "Non-QM loans are perfect for borrowers who don't fit traditional guidelines!\n\n<strong>Who Benefits:</strong>\n• Self-employed borrowers\n• Real estate investors\n• Foreign nationals\n• Recent credit events\n• Those with significant assets\n\n<strong>Verification Options:</strong>\n• Full documentation\n• 1-year tax return program\n• Bank statement program (6 or 12 months)\n• Asset depletion\n\nWe're a <strong>Top Non-QM Lender</strong> — we specialize in finding solutions!", quickReplies: ['Bank statement loans', 'Self-employed options', 'Talk to specialist'] },

    bank_statement: { patterns: ['bank statement', 'bank statements', 'no tax return', '12 month', '24 month'], response: "Bank Statement Loans are ideal for self-employed borrowers!\n\n<strong>How it works:</strong>\n• Use 12-24 months of bank deposits\n• No tax returns required\n• Personal OR business accounts\n• Calculate income from deposits\n• Flexible DTI guidelines\n• Up to 40-year terms available!\n\nPerfect if tax write-offs reduce your qualifying income.", quickReplies: ['Self-employed options', 'Get pre-qualified', 'Talk to specialist'] },

    self_employed: { patterns: ['self employed', 'self-employed', 'own business', 'business owner', '1099', 'freelance', 'contractor', 'entrepreneur'], response: "Self-employed? We specialize in helping business owners!\n\n<strong>Options available:</strong>\n• Traditional: 2 years tax returns\n• Bank Statement: 12-24 months deposits\n• Asset Depletion: Use savings to qualify\n• P&L Only programs\n\nYour tax write-offs shouldn't prevent homeownership. Let's find the right fit!", quickReplies: ['Bank statement loans', 'Non-QM loans', 'Talk to specialist'] },

    first_time: { patterns: ['first time', 'first-time', 'first home', 'never bought', 'new buyer', 'first house'], response: "Buying your first home is an exciting milestone!\n\n<strong>Step 1:</strong> Understand how much house you can afford\n<strong>Step 2:</strong> Explore loan programs for first-time buyers\n<strong>Step 3:</strong> Customize your loan to fit YOUR needs\n\n<strong>First-Time Buyer Perks:</strong>\n• FHA loans with just 3.5% down\n• Down payment assistance programs\n• State-specific grants (NY SONYMA, NJ Smart Start)\n• Gift funds allowed\n\nYou may qualify even if you owned a home 3+ years ago!\n\nGet pre-qualified — it's FREE!", quickReplies: ['Get pre-qualified', 'FHA loans', 'Down payment help'] },

    pre_approval: { patterns: ['pre-approval', 'preapproval', 'pre approved', 'preapproved', 'get approved', 'qualify', 'how much can i', 'pre-qualified', 'prequalified'], response: "Getting pre-approved is your smart first step! We offer <strong>3 levels</strong>:\n\n<strong>1. Pre-Qualification</strong> (Fastest)\n• Quick estimate of buying power\n• Basic credit & income review\n\n<strong>2. Pre-Approval</strong> (Most Common)\n• Verified income & assets\n• Credit report pulled\n• Strong offer position\n\n<strong>3. Credit Approval with Home Buyer's Edge</strong>\n• Full underwriting BEFORE you shop\n• Strongest possible offer\n• Close faster than competition!\n\n<strong>All consultations are FREE!</strong>", quickReplies: ['Get pre-qualified FREE', 'Talk to specialist'] },

    down_payment: { patterns: ['down payment', 'downpayment', 'how much down', 'money down'], response: "Down payment requirements vary by loan type:\n\n<strong>Zero Down:</strong>\n• VA: $0 (veterans/military)\n• USDA: $0 (eligible rural areas)\n\n<strong>Low Down:</strong>\n• FHA: 3.5%\n• Conventional: 3-5%\n• Jumbo: 10% (NO PMI!)\n\nLooking for assistance programs? We have options in multiple states!", quickReplies: ['Down payment assistance', 'FHA loans', 'VA loans'] },

    down_payment_assistance: { patterns: ['down payment assistance', 'down payment help', 'assistance program', 'dpa', 'grant', 'help with down payment', 'state program', 'state programs'], response: "Great news — we offer down payment assistance in multiple states!\n\n<strong>Programs Available:</strong>\n• <strong>New Jersey:</strong> Smart Start (up to $15,000!)\n• <strong>Pennsylvania:</strong> Keystone, K-FIT (up to $6,000)\n• <strong>New York:</strong> SONYMA programs\n• <strong>Other States:</strong> Various local programs\n\nWhich state are you buying in?", quickReplies: ['New Jersey', 'Pennsylvania', 'New York', 'Other state'] },

    nj_assistance: { patterns: ['new jersey', 'nj program', 'njhmfa', 'smart start', 'nj assistance'], response: "New Jersey offers fantastic homebuyer programs!\n\n<strong>Smart Start DPA:</strong>\n• Up to <strong>$15,000</strong> in select counties!\n• $10,000 in other NJ counties\n• Pairs with NJHMFA first mortgage\n\n<strong>YOUR Home Program:</strong>\n• Below-market interest rates\n• As little as 5% down\n• No first-time buyer requirement!\n\n<strong>Eligible Counties for $15K:</strong>\nBergen, Essex, Hudson, Mercer, Middlesex, Monmouth, Morris, Ocean, Passaic, Somerset, Union!\n\nWant to see if you qualify?", quickReplies: ['Get pre-qualified', 'Talk to specialist'] },

    pa_assistance: { patterns: ['pennsylvania', 'pa program', 'keystone', 'phfa', 'pa assistance', 'k-fit'], response: "Pennsylvania has great assistance programs!\n\n<strong>Keystone Advantage:</strong>\n• 4% or up to $6,000 assistance\n• 0% interest, 10-year repayment\n• Min 660 credit score\n\n<strong>K-FIT Program:</strong>\n• 5% of purchase price\n• <strong>Forgiven over 10 years!</strong>\n• Min 660 credit score\n\n<strong>PHFA $500 Grant:</strong>\n• No repayment required!\n\nThese can combine with FHA, VA, Conventional!", quickReplies: ['Get pre-qualified', 'Talk to specialist'] },

    ny_assistance: { patterns: ['new york', 'ny program', 'sonyma', 'ny assistance'], response: "New York Mortgage Assistance Programs available!\n\n<strong>SONYMA Programs:</strong>\n• Down payment assistance loans\n• Low-interest rate options\n• First-time buyer grants\n\n<strong>Additional Options:</strong>\n• Income-based programs\n• NYC-specific programs\n• County assistance programs\n\nWe know NY programs inside and out. Let us find the right fit for you!", quickReplies: ['Get pre-qualified', 'Talk to specialist'] },

    other_state: { patterns: ['other state', 'different state', 'not listed'], response: "We're licensed in all 50 states and can help find programs in your area!\n\nMany states and counties offer:\n• Down payment assistance\n• First-time buyer grants\n• Low-interest programs\n• Employer assistance programs\n\nTell us where you're buying and we'll research available programs for you!", quickReplies: ['Talk to specialist', 'Get pre-qualified'] },

    refinance: { patterns: ['refinance', 'refi', 'refinancing', 'lower rate', 'cash out'], response: "Refinancing can save money or unlock equity!\n\n<strong>Good reasons to refi:</strong>\n• Lower your interest rate\n• Reduce monthly payment\n• Switch ARM to fixed\n• Cash out home equity\n• Remove PMI\n• Consolidate debt\n\n<strong>Cash-Out Options:</strong>\n• Up to 80% LTV conventional\n• Up to 85% LTV FHA\n• Up to 100% LTV VA!\n\nRule of thumb: Refi if you can drop 0.5%+ on your rate!", quickReplies: ['Cash-out options', 'Check rates', 'Talk to specialist'] },

    reverse_mortgage: { patterns: ['reverse', 'reverse mortgage', 'hecm', 'senior', '62', 'retirement'], response: "We're a <strong>leading Reverse Mortgage lender</strong>!\n\n<strong>How It Works:</strong>\n• NO monthly payments required\n• Receive payments from your equity instead!\n• Retain ownership and title\n• Loan repaid when home sells or you move\n\n<strong>Why Seniors Love It:</strong>\n• Cover living expenses\n• Pay medical bills\n• Home improvements\n• Travel & enjoy retirement!\n\n<strong>Eligibility:</strong>\n• Must be 62+ years old\n• Primary residence\n\nProceeds are NOT subject to income tax!", quickReplies: ['How much can I get?', 'Talk to specialist'] },

    fha_203k: { patterns: ['203k', '203(k)', 'renovation loan', 'rehab loan', 'fixer upper', 'fixer-upper'], response: "FHA 203K Renovation Loans — turn a fixer-upper into your dream home!\n\n<strong>Benefits:</strong>\n• Finance purchase + renovations in ONE loan\n• Down payment as low as <strong>3.5%</strong>\n• 30-year fixed rate\n\n<strong>Two Types:</strong>\n• <strong>Standard 203K:</strong> Structural repairs, additions\n• <strong>Streamlined 203K:</strong> Up to $35,000 for non-structural\n\n<strong>What's Covered:</strong>\n• Kitchen & bathroom remodels\n• Plumbing, HVAC, flooring\n• Additions & second stories\n\nWe have 30+ years experience with 203K loans!", quickReplies: ['How it works', 'Talk to specialist'] },

    rates: { patterns: ['rate', 'rates', 'interest rate', 'apr', 'today\'s rate', 'current rate'], response: "Mortgage rates change daily based on the market.\n\n<strong>Factors affecting YOUR rate:</strong>\n• Credit score (higher = better)\n• Down payment amount\n• Loan type & term\n• Property type\n• Occupancy type\n\nThe best way to know your rate is to get pre-approved. It's free!", quickReplies: ['Get my rate', 'Get pre-approved', 'Talk to specialist'] },

    credit: { patterns: ['credit', 'credit score', 'fico', 'bad credit', 'low credit'], response: "Credit score requirements by loan type:\n\n• Conventional: 620+ (best rates at 740+)\n• FHA: 580+ (or 500 with 10% down)\n• VA: No minimum, but 620+ preferred\n• USDA: 640+\n• Non-QM: Options for lower scores!\n\nLower score? We specialize in finding solutions!", quickReplies: ['Non-QM loans', 'FHA loans', 'Talk to specialist'] },

    pmi: { patterns: ['pmi', 'private mortgage insurance', 'mortgage insurance'], response: "PMI (Private Mortgage Insurance) protects the lender if you default.\n\n• Required when down payment < 20%\n• Costs 0.5% - 1% of loan annually\n• Drops off at 20% equity (conventional)\n• VA loans = NO PMI!\n• Our Jumbo loans = NO PMI with 10% down!\n\nWe have multiple ways to avoid PMI!", quickReplies: ['VA loans', 'Jumbo loans', 'Down payment options'] },

    pmi_removal: { patterns: ['remove pmi', 'cancel pmi', 'get rid of pmi', 'stop pmi', 'pmi cancellation', 'drop pmi', 'cancel my pmi', 'remove my pmi', 'stop paying pmi', 'eliminate pmi'], response: "3 ways to cancel PMI on conventional loans!\n\n<strong>1. Automatic (78% LTV):</strong>\n• PMI auto-cancels at 78% loan-to-value\n• Based on original home value\n\n<strong>2. Request at 80% LTV:</strong>\n• You request cancellation\n• Based on original value\n• Must be current on payments\n\n<strong>3. Based on Current Value:</strong>\n• At 75% LTV after 2 years\n• At 80% LTV after 5 years\n• Home improvements can help!\n\nNY special rule: Based on appraised value at 75% LTV!", quickReplies: ['PMI info', 'Refinance options', 'Talk to specialist'] },

    documents: { patterns: ['document', 'documents', 'paperwork', 'what do i need'], response: "Here's what you'll typically need:\n\n<strong>Income:</strong> Pay stubs (30 days), W-2s (2 years)\n<strong>Assets:</strong> Bank statements (2 months)\n<strong>ID:</strong> Driver's license, SSN\n• Tax returns (if self-employed)\n• Gift letter (if using gift funds)\n\nSelf-employed? We have flexible documentation options!", quickReplies: ['Self-employed docs', 'Bank statement loans', 'Talk to specialist'] },

    timeline: { patterns: ['how long', 'timeline', 'time to close', 'closing time'], response: "Typical mortgage timeline:\n\n• Pre-approval: 1-3 days\n• Home search: Varies\n• Under contract to close: 30-45 days\n\nWith 25+ years experience, we often close faster!", quickReplies: ['Start pre-approval', 'Talk to specialist'] },

    default: { response: "I can help with mortgage questions! Here are some topics:\n\n• Loan types (FHA, VA, Conventional, Jumbo)\n• First-time buyer programs\n• Self-employed options\n• Pre-approval process\n• Refinancing\n\nOr I can connect you with a specialist!", quickReplies: ['Loan options', 'First-time buyer', 'Self-employed', 'Talk to specialist'] }
  };

  // ============ WIDGET LOGIC ============
  var isOpen = false;
  var messageCount = 0;
  var conversationHistory = []; // Track full conversation

  var btn = document.getElementById('lmc-btn');
  var win = document.getElementById('lmc-window');
  var iconOpen = document.getElementById('lmc-icon-open');
  var iconClose = document.getElementById('lmc-icon-close');
  var messagesDiv = document.getElementById('lmc-messages');
  var qrDiv = document.getElementById('lmc-quick-replies');
  var input = document.getElementById('lmc-input');
  var sendBtn = document.getElementById('lmc-send');
  var restartBtn = document.getElementById('lmc-restart-btn');
  var applyBtn = document.getElementById('lmc-apply-btn');
  var speakBtn = document.getElementById('lmc-speak-btn');

  function toggle() {
    isOpen = !isOpen;
    win.classList.toggle('open', isOpen);
    iconOpen.style.display = isOpen ? 'none' : 'block';
    iconClose.style.display = isOpen ? 'block' : 'none';
    if (isOpen && messageCount === 0) showWelcome();
  }

  function showWelcome() {
    addMsg("Hey there! 👋 I'm your Legacy Mortgage assistant. With 25+ years of experience and Top 25 Lender status, we make home financing easy.\n\nHow can I help you today?", 'bot');
    showQR(['Loan options', 'Self-employed?', 'First-time buyer', 'Get pre-approved']);
  }

  function restart() {
    messagesDiv.innerHTML = '';
    qrDiv.innerHTML = '';
    messageCount = 0;
    conversationContext.lastTopic = null;
    conversationContext.messageCount = 0;
    showWelcome();
  }

  function addMsg(text, type) {
    var msg = document.createElement('div');
    msg.className = 'lmc-msg ' + type;
    msg.innerHTML = text.replace(/\n/g, '<br>');
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    messageCount++;

    // Store in conversation history
    conversationHistory.push({
      role: type === 'user' ? 'User' : 'Bot',
      message: text,
      timestamp: new Date().toISOString()
    });
  }

  function showQR(replies) {
    qrDiv.innerHTML = '';
    replies.forEach(function(r) {
      var b = document.createElement('button');
      b.className = 'lmc-qr';
      b.textContent = r;
      b.onclick = function() { handleInput(r); };
      qrDiv.appendChild(b);
    });
  }

  function showLeadForm() {
    leadCaptureActive = true;
    var html = '<div class="lmc-lead-form"><input type="text" id="lmc-name" placeholder="Full Name (First & Last)"><input type="tel" id="lmc-phone" placeholder="Phone Number (10 digits)"><input type="email" id="lmc-email" placeholder="Email Address"><button onclick="window.lmcSubmitLead()">Connect Me!</button></div>';
    var msg = document.createElement('div');
    msg.className = 'lmc-msg bot';
    msg.innerHTML = html;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    qrDiv.innerHTML = '';
  }

  window.lmcSubmitLead = function() {
    var name = document.getElementById('lmc-name').value.trim();
    var phone = document.getElementById('lmc-phone').value.trim();
    var email = document.getElementById('lmc-email').value.trim();

    // Validate full name (first and last)
    var nameParts = name.split(/\s+/);
    if (nameParts.length < 2 || nameParts.some(function(p) { return p.length < 1; })) {
      alert('Please enter your full name (first and last)');
      return;
    }

    // Validate phone (at least 10 digits)
    var phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      alert('Please enter a valid phone number (10 digits)');
      return;
    }

    // Validate email (must contain @ and .)
    if (!email.includes('@') || !email.includes('.')) {
      alert('Please enter a valid email address');
      return;
    }

    leadCaptureActive = false;

    // Helper to strip HTML tags and clean up text
    function stripHtml(html) {
      return html
        .replace(/<strong>/g, '')
        .replace(/<\/strong>/g, '')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ');
    }

    // Format conversation for readability
    var conversationText = conversationHistory.map(function(msg) {
      var role = msg.role === 'bot' ? 'BOT' : 'USER';
      return role + ': ' + stripHtml(msg.message);
    }).join('\n\n---\n\n');

    // Create formatted email body
    var submittedDate = new Date();
    var formattedDate = submittedDate.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });

    var emailBody = [
      '═══════════════════════════════════════',
      '         NEW MORTGAGE LEAD',
      '═══════════════════════════════════════',
      '',
      'CONTACT INFORMATION',
      '───────────────────────────────────────',
      'Name:    ' + name,
      'Phone:   ' + phone,
      'Email:   ' + email,
      '',
      'SOURCE DETAILS',
      '───────────────────────────────────────',
      'Page:    ' + window.location.href,
      'Date:    ' + formattedDate,
      '',
      'CONVERSATION HISTORY',
      '───────────────────────────────────────',
      '',
      conversationText,
      '',
      '═══════════════════════════════════════'
    ].join('\n');

    var lead = {
      name: name,
      phone: phone,
      email: email,
      loId: CONFIG.loId,
      siteId: CONFIG.siteId,
      pageUrl: window.location.href,
      timestamp: submittedDate.toISOString(),
      conversation: conversationText,
      emailBody: emailBody
    };

    console.log('LEAD CAPTURED:', lead);

    // Send to Zapier webhook if configured
    if (CONFIG.webhookUrl) {
      // Use form-urlencoded to avoid CORS preflight issues with Zapier
      var formData = new URLSearchParams();
      formData.append('name', lead.name);
      formData.append('phone', lead.phone);
      formData.append('email', lead.email);
      formData.append('loId', lead.loId || '');
      formData.append('siteId', lead.siteId || '');
      formData.append('pageUrl', lead.pageUrl);
      formData.append('timestamp', lead.timestamp);
      formData.append('conversation', lead.conversation);
      formData.append('emailBody', lead.emailBody);

      fetch(CONFIG.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      }).then(function(response) {
        console.log('Lead sent to webhook:', response.status);
      }).catch(function(error) {
        console.error('Webhook error:', error);
      });
    }

    addMsg("Thanks " + name + "! 🎉\n\nA loan specialist will reach out shortly at " + phone + ".\n\nFeel free to ask any other questions!", 'bot');
    showQR(['Loan options', 'First-time buyer', 'Self-employed']);
  };

  function isFollowUp(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < FOLLOW_UP_PHRASES.length; i++) {
      if (lower.includes(FOLLOW_UP_PHRASES[i])) return true;
    }
    return false;
  }

  function findMatch(text) {
    var lower = text.toLowerCase();
    var bestMatch = null;
    var bestScore = 0;
    var bestKey = null;

    for (var key in KNOWLEDGE) {
      if (key === 'default') continue;
      var topic = KNOWLEDGE[key];
      if (!topic.patterns) continue;
      for (var i = 0; i < topic.patterns.length; i++) {
        if (lower.includes(topic.patterns[i])) {
          var score = topic.patterns[i].length;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = topic;
            bestKey = key;
          }
        }
      }
    }

    return { match: bestMatch || KNOWLEDGE.default, key: bestKey };
  }

  function handleInput(text) {
    addMsg(text, 'user');

    if (isFollowUp(text) && conversationContext.lastTopic) {
      var followUp = FOLLOW_UP_RESPONSES[conversationContext.lastTopic] || FOLLOW_UP_RESPONSES.default;
      setTimeout(function() {
        addMsg(followUp.response, 'bot');
        showQR(followUp.quickReplies);
      }, 500);
      return;
    }

    var result = findMatch(text);
    var match = result.match;

    if (result.key) {
      conversationContext.lastTopic = result.key;
      conversationContext.messageCount++;
    }

    setTimeout(function() {
      addMsg(match.response, 'bot');
      if (match.showLeadForm) {
        showLeadForm();
      } else if (match.quickReplies && match.quickReplies.length > 0) {
        showQR(match.quickReplies);
      }
    }, 500);
  }

  function send() {
    var text = input.value.trim();
    if (text) { handleInput(text); input.value = ''; }
  }

  btn.addEventListener('click', toggle);
  restartBtn.addEventListener('click', restart);
  sendBtn.addEventListener('click', send);
  input.addEventListener('keypress', function(e) { if (e.key === 'Enter') send(); });

  // Track lead capture state
  var leadCaptureActive = false;

  applyBtn.addEventListener('click', function() {
    if (leadCaptureActive) return; // Ignore if already in lead capture
    handleInput('Get pre-approved');
  });

  speakBtn.addEventListener('click', function() {
    if (leadCaptureActive) return; // Ignore if already in lead capture
    handleInput('Talk to a specialist');
  });

  // Auto-open
  if (CONFIG.autoOpen) {
    var shouldOpen = !CONFIG.autoOpenOnce || !sessionStorage.getItem('lmc_opened');
    if (shouldOpen) {
      setTimeout(function() {
        if (!isOpen) { toggle(); sessionStorage.setItem('lmc_opened', 'true'); }
      }, CONFIG.autoOpenDelay);
    }
  }

  console.log('Legacy Mortgage Widget v1.0.23 loaded from CDN');
})();
