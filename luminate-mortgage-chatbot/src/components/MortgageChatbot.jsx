import { useState, useRef, useEffect } from 'react'
import { Send, Home, RotateCcw } from 'lucide-react'

// Mortgage FAQ Knowledge Base
const knowledgeBase = {
  'down payment': {
    response: "Great question! Down payment requirements vary by loan type:\n\n• **Conventional loans**: Typically 3-20% down\n• **FHA loans**: As low as 3.5% down\n• **VA loans**: 0% down for eligible veterans\n• **USDA loans**: 0% down in eligible rural areas\n\nWould you like to explore which option might work best for your situation?",
    quickReplies: ['Tell me about FHA loans', 'VA loan eligibility', 'What is PMI?']
  },
  'fha': {
    response: "**FHA Loans** are government-backed mortgages perfect for first-time buyers!\n\n**Key Benefits:**\n• Down payment as low as 3.5%\n• Credit scores as low as 580 accepted\n• More flexible debt-to-income ratios\n• Gift funds allowed for down payment\n\n**Requirements:**\n• Must be your primary residence\n• Property must meet FHA standards\n• Mortgage insurance required\n\nWould you like to see if you qualify?",
    quickReplies: ['Check my eligibility', 'What is PMI?', 'Conventional vs FHA']
  },
  'va': {
    response: "**VA Loans** offer incredible benefits for those who served!\n\n**Key Benefits:**\n• **No down payment** required\n• **No PMI** (Private Mortgage Insurance)\n• Competitive interest rates\n• Limited closing costs\n\n**Eligibility:**\n• Active duty service members\n• Veterans with qualifying service\n• Eligible surviving spouses\n\nThank you for your service! Want me to help check your VA eligibility?",
    quickReplies: ['Check VA eligibility', 'Down payment options', 'Get pre-approved']
  },
  'pmi': {
    response: "**PMI (Private Mortgage Insurance)** protects the lender if you default on your loan.\n\n**Key Facts:**\n• Required when down payment is less than 20%\n• Typically costs 0.5% - 1% of loan annually\n• Can be removed once you reach 20% equity\n• VA loans do NOT require PMI!\n\n**Ways to Avoid PMI:**\n• Put 20% or more down\n• Choose a VA loan (if eligible)\n• Look into lender-paid PMI options\n\nWant to explore your options?",
    quickReplies: ['Down payment options', 'VA loan benefits', 'Get pre-approved']
  },
  'self-employed': {
    response: "**Self-Employed? You can still get a mortgage!**\n\n**What You'll Need:**\n• 2 years of tax returns\n• Year-to-date profit & loss statement\n• Business license or CPA letter\n• Bank statements (personal & business)\n\n**Tips for Approval:**\n• Keep business & personal finances separate\n• Maintain consistent income records\n• Work with a lender experienced with self-employed borrowers\n\nWe specialize in helping self-employed buyers. Want to discuss your situation?",
    quickReplies: ['Talk to a specialist', 'Required documents', 'Get pre-approved']
  },
  'pre-approval': {
    response: "**Getting Pre-Approved** is a smart first step!\n\n**Benefits:**\n• Know your exact budget\n• Sellers take you seriously\n• Faster closing process\n• Lock in your rate\n\n**What You'll Need:**\n• Proof of income (pay stubs, W-2s)\n• Bank statements\n• ID and Social Security number\n• Employment verification\n\nPre-approval typically takes 24-48 hours. Ready to get started?",
    quickReplies: ['Start pre-approval', 'Required documents', 'Talk to an advisor']
  },
  'rates': {
    response: "**Mortgage rates** change daily based on market conditions.\n\n**Factors Affecting YOUR Rate:**\n• Credit score (higher = better rate)\n• Down payment amount\n• Loan type (conventional, FHA, VA)\n• Loan term (15 vs 30 year)\n• Property type\n\n**Current Tip:** Rates are unique to each borrower. The best way to know your rate is to get pre-approved!\n\nWant to see what rate you qualify for?",
    quickReplies: ['Get my rate', 'Improve my credit', 'Get pre-approved']
  },
  'credit': {
    response: "**Credit Score Requirements** by loan type:\n\n• **Conventional**: 620+ (best rates at 740+)\n• **FHA**: 580+ (or 500 with 10% down)\n• **VA**: No minimum (most lenders want 620+)\n• **USDA**: 640+\n\n**Quick Credit Tips:**\n• Pay bills on time\n• Keep credit utilization under 30%\n• Don't open new accounts before applying\n• Check your report for errors\n\nNot sure where you stand? We can help!",
    quickReplies: ['Check my eligibility', 'FHA loans', 'Talk to an advisor']
  },
  'closing costs': {
    response: "**Closing Costs** typically run 2-5% of the loan amount.\n\n**Common Costs Include:**\n• Loan origination fees\n• Appraisal fee ($300-$500)\n• Title insurance\n• Attorney fees\n• Prepaid taxes & insurance\n\n**Ways to Reduce Costs:**\n• Negotiate with the seller\n• Ask about lender credits\n• Compare loan estimates\n• Look for first-time buyer programs\n\nWant a personalized estimate?",
    quickReplies: ['Get an estimate', 'First-time buyer programs', 'Talk to an advisor']
  },
  'refinance': {
    response: "**Refinancing** can save you money or unlock equity!\n\n**Reasons to Refinance:**\n• Lower your interest rate\n• Reduce monthly payment\n• Switch from ARM to fixed rate\n• Cash out home equity\n• Remove PMI\n\n**Break-Even Rule:** Calculate how long to recoup closing costs. If you'll stay longer, refinancing makes sense!\n\nWant to see if refinancing is right for you?",
    quickReplies: ['Check refinance rates', 'Cash-out options', 'Talk to an advisor']
  }
}

// Default quick replies
const defaultQuickReplies = [
  'Down payment options',
  'FHA loans',
  'VA loans',
  'Get pre-approved'
]

const MortgageChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm Luna, your Luminate mortgage assistant. I'm here to help you navigate your home financing journey. What would you like to know about?",
      quickReplies: defaultQuickReplies
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [leadCapture, setLeadCapture] = useState({
    active: false,
    step: 0,
    data: { name: '', phone: '', email: '' }
  })
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const findBestMatch = (input) => {
    const lowerInput = input.toLowerCase()

    // Check for lead capture triggers
    if (lowerInput.includes('talk to') || lowerInput.includes('specialist') ||
        lowerInput.includes('advisor') || lowerInput.includes('contact') ||
        lowerInput.includes('call me') || lowerInput.includes('get started') ||
        lowerInput.includes('start pre-approval') || lowerInput.includes('check my eligibility') ||
        lowerInput.includes('get my rate') || lowerInput.includes('get pre-approved')) {
      return 'lead_capture'
    }

    // Search knowledge base
    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (lowerInput.includes(key)) {
        return value
      }
    }

    // Additional keyword matching
    if (lowerInput.includes('first time') || lowerInput.includes('first-time')) {
      return knowledgeBase['fha']
    }
    if (lowerInput.includes('veteran') || lowerInput.includes('military')) {
      return knowledgeBase['va']
    }
    if (lowerInput.includes('insurance') && lowerInput.includes('mortgage')) {
      return knowledgeBase['pmi']
    }
    if (lowerInput.includes('interest') || lowerInput.includes('rate')) {
      return knowledgeBase['rates']
    }
    if (lowerInput.includes('score')) {
      return knowledgeBase['credit']
    }
    if (lowerInput.includes('document') || lowerInput.includes('paperwork')) {
      return knowledgeBase['pre-approval']
    }

    return null
  }

  const handleLeadCapture = (input) => {
    const { step, data } = leadCapture
    let newData = { ...data }
    let nextStep = step
    let botResponse = ''
    let quickReplies = []

    switch (step) {
      case 0:
        botResponse = "I'd love to connect you with one of our mortgage specialists! First, what's your name?"
        nextStep = 1
        break
      case 1:
        newData.name = input
        botResponse = `Nice to meet you, ${input}! What's the best phone number to reach you?`
        nextStep = 2
        break
      case 2:
        newData.phone = input
        botResponse = "Great! And what's your email address?"
        nextStep = 3
        break
      case 3:
        newData.email = input
        botResponse = `Thank you, ${newData.name}! One of our mortgage specialists will contact you within 24 hours at ${newData.phone} or ${newData.email}.\n\nIn the meantime, is there anything else I can help you with?`
        quickReplies = defaultQuickReplies
        // Reset lead capture
        setLeadCapture({ active: false, step: 0, data: { name: '', phone: '', email: '' } })
        console.log('Lead captured:', newData) // In production, send to CRM
        return { response: botResponse, quickReplies }
      default:
        break
    }

    setLeadCapture({ active: true, step: nextStep, data: newData })
    return { response: botResponse, quickReplies }
  }

  const addBotMessage = (text, quickReplies = []) => {
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        text,
        quickReplies
      }])
    }, 1000 + Math.random() * 500)
  }

  const handleSend = (text = inputValue) => {
    if (!text.trim()) return

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      text: text.trim()
    }])
    setInputValue('')

    // Handle lead capture flow
    if (leadCapture.active) {
      const result = handleLeadCapture(text.trim())
      addBotMessage(result.response, result.quickReplies)
      return
    }

    // Find response
    const match = findBestMatch(text)

    if (match === 'lead_capture') {
      const result = handleLeadCapture(text.trim())
      addBotMessage(result.response, result.quickReplies)
    } else if (match) {
      addBotMessage(match.response, match.quickReplies)
    } else {
      addBotMessage(
        "I'm not sure I understood that. I can help you with:\n\n• Down payment requirements\n• FHA, VA, and conventional loans\n• PMI and mortgage insurance\n• Pre-approval process\n• Self-employed mortgages\n• Refinancing options\n\nOr I can connect you with a mortgage specialist!",
        ['Down payment options', 'Loan types', 'Talk to a specialist']
      )
    }
  }

  const handleQuickReply = (reply) => {
    handleSend(reply)
  }

  const handleReset = () => {
    setMessages([{
      id: Date.now(),
      type: 'bot',
      text: "Hi! I'm Luna, your Luminate mortgage assistant. I'm here to help you navigate your home financing journey. What would you like to know about?",
      quickReplies: defaultQuickReplies
    }])
    setLeadCapture({ active: false, step: 0, data: { name: '', phone: '', email: '' } })
    setInputValue('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ height: '600px' }}>
      {/* Header */}
      <div className="bg-luminate-navy px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-luminate-blue rounded-full flex items-center justify-center">
            <Home className="w-5 h-5 text-luminate-navy" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">Luminate Mortgage</h1>
            <p className="text-luminate-blue text-xs">Your Home Financing Guide</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Start over"
        >
          <RotateCcw className="w-5 h-5 text-luminate-blue" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-messages bg-gray-50">
        {messages.map((message) => (
          <div key={message.id}>
            <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-luminate-navy text-white rounded-br-md'
                    : 'bg-white text-gray-800 shadow-md rounded-bl-md border border-gray-100'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed"
                   dangerouslySetInnerHTML={{
                     __html: message.text
                       .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                       .replace(/\n/g, '<br/>')
                   }}
                />
              </div>
            </div>

            {/* Quick Replies */}
            {message.type === 'bot' && message.quickReplies && message.quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 ml-2">
                {message.quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="px-3 py-1.5 text-sm bg-luminate-blue/20 text-luminate-navy
                             border border-luminate-blue rounded-full hover:bg-luminate-blue/40
                             transition-colors font-medium"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-md border border-gray-100">
              <div className="flex gap-1">
                <span className="typing-dot w-2 h-2 bg-luminate-navy rounded-full"></span>
                <span className="typing-dot w-2 h-2 bg-luminate-navy rounded-full"></span>
                <span className="typing-dot w-2 h-2 bg-luminate-navy rounded-full"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question..."
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm
                     focus:outline-none focus:ring-2 focus:ring-luminate-blue
                     placeholder-gray-400"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            className="p-2.5 bg-luminate-navy text-white rounded-full
                     hover:bg-luminate-navy/90 disabled:opacity-50
                     disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
        <p className="text-center text-xs text-gray-500">
          Luminate Home Loans Inc. | NMLS #1281698
        </p>
      </div>
    </div>
  )
}

export default MortgageChatbot
