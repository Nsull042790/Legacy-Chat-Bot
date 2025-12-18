(function() {
  'use strict';

  // Configuration from script tag
  var script = document.currentScript;
  var config = {
    loId: script.getAttribute('data-lo-id') || 'default',
    loName: script.getAttribute('data-lo-name') || 'Legacy Mortgage',
    siteId: script.getAttribute('data-site-id') || window.location.hostname,
    position: script.getAttribute('data-position') || 'bottom-right',
    primaryColor: script.getAttribute('data-primary-color') || '#0056b3',
    autoOpen: script.getAttribute('data-auto-open') === 'true',
    greeting: script.getAttribute('data-greeting') || null
  };

  // Widget base URL - UPDATE THIS to your deployed URL
  var WIDGET_BASE_URL = script.getAttribute('data-widget-url') || 'https://nsull042790.github.io/Legacy-Chat-Bot';

  // Styles for the widget container
  var styles = `
    #legacy-mortgage-widget-container {
      position: fixed;
      ${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
      ${config.position.includes('top') ? 'top: 20px;' : 'bottom: 20px;'}
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    #legacy-mortgage-widget-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${config.primaryColor};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    #legacy-mortgage-widget-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }

    #legacy-mortgage-widget-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }

    #legacy-mortgage-widget-frame-container {
      display: none;
      position: absolute;
      ${config.position.includes('right') ? 'right: 0;' : 'left: 0;'}
      ${config.position.includes('top') ? 'top: 70px;' : 'bottom: 70px;'}
      width: 380px;
      height: 580px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      background: white;
    }

    #legacy-mortgage-widget-frame-container.open {
      display: block;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    #legacy-mortgage-widget-frame {
      width: 100%;
      height: 100%;
      border: none;
    }

    #legacy-mortgage-widget-close {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.1);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      transition: background 0.2s;
    }

    #legacy-mortgage-widget-close:hover {
      background: rgba(0, 0, 0, 0.2);
    }

    #legacy-mortgage-widget-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      width: 20px;
      height: 20px;
      background: #e74c3c;
      border-radius: 50%;
      display: none;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
    }

    @media (max-width: 480px) {
      #legacy-mortgage-widget-frame-container {
        width: calc(100vw - 40px);
        height: calc(100vh - 120px);
        ${config.position.includes('right') ? 'right: -10px;' : 'left: -10px;'}
      }
    }
  `;

  // Create and inject styles
  var styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create widget HTML
  var container = document.createElement('div');
  container.id = 'legacy-mortgage-widget-container';
  container.innerHTML = `
    <div id="legacy-mortgage-widget-frame-container">
      <button id="legacy-mortgage-widget-close">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1L13 13M1 13L13 1" stroke="#666" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <iframe
        id="legacy-mortgage-widget-frame"
        src="${WIDGET_BASE_URL}?embed=true&loId=${encodeURIComponent(config.loId)}&loName=${encodeURIComponent(config.loName)}&siteId=${encodeURIComponent(config.siteId)}"
        title="Legacy Mortgage Chat"
        allow="clipboard-write"
      ></iframe>
    </div>
    <button id="legacy-mortgage-widget-button" aria-label="Open chat">
      <span id="legacy-mortgage-widget-badge">1</span>
      <svg viewBox="0 0 24 24" id="legacy-mortgage-widget-icon-chat">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
      <svg viewBox="0 0 24 24" id="legacy-mortgage-widget-icon-close" style="display:none;">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>
  `;

  // Add to page
  document.body.appendChild(container);

  // Get elements
  var button = document.getElementById('legacy-mortgage-widget-button');
  var frameContainer = document.getElementById('legacy-mortgage-widget-frame-container');
  var closeBtn = document.getElementById('legacy-mortgage-widget-close');
  var iconChat = document.getElementById('legacy-mortgage-widget-icon-chat');
  var iconClose = document.getElementById('legacy-mortgage-widget-icon-close');
  var isOpen = false;

  // Toggle function
  function toggleWidget() {
    isOpen = !isOpen;
    frameContainer.classList.toggle('open', isOpen);
    iconChat.style.display = isOpen ? 'none' : 'block';
    iconClose.style.display = isOpen ? 'block' : 'none';

    // Track open event
    if (isOpen && window.legacyMortgageWidgetOnOpen) {
      window.legacyMortgageWidgetOnOpen(config);
    }
  }

  // Event listeners
  button.addEventListener('click', toggleWidget);
  closeBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (isOpen) toggleWidget();
  });

  // Listen for messages from iframe
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'LEGACY_MORTGAGE_LEAD') {
      // Lead captured - you can hook into this
      console.log('Lead captured:', event.data.lead);
      if (window.legacyMortgageWidgetOnLead) {
        window.legacyMortgageWidgetOnLead(event.data.lead, config);
      }
    }
    if (event.data && event.data.type === 'LEGACY_MORTGAGE_CLOSE') {
      if (isOpen) toggleWidget();
    }
  });

  // Auto-open if configured
  if (config.autoOpen) {
    setTimeout(toggleWidget, 2000);
  }

  // Expose API
  window.LegacyMortgageWidget = {
    open: function() { if (!isOpen) toggleWidget(); },
    close: function() { if (isOpen) toggleWidget(); },
    toggle: toggleWidget,
    config: config
  };

  console.log('Legacy Mortgage Widget loaded', config);
})();
