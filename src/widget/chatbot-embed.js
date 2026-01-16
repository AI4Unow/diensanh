/**
 * Diên Sanh Chatbot - Embeddable Widget
 *
 * Usage: Add this script to your website:
 * <script src="https://your-domain.com/widget/chatbot-embed.js" data-api="https://your-api.com"></script>
 *
 * Or configure manually:
 * <script>
 *   window.DIENSANH_CHATBOT_CONFIG = { apiUrl: 'https://your-api.com' };
 * </script>
 * <script src="chatbot-embed.js"></script>
 */

(function() {
    'use strict';

    // Configuration
    const config = window.DIENSANH_CHATBOT_CONFIG || {};
    const scriptTag = document.currentScript;
    const API_URL = config.apiUrl || scriptTag?.dataset?.api || 'http://localhost:8000';

    // Styles
    const styles = `
        #ds-chatbot-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        #ds-chatbot-toggle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #1a5f2a 0%, #2e7d32 100%);
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s, box-shadow 0.3s;
        }

        #ds-chatbot-toggle:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 25px rgba(0,0,0,0.35);
        }

        #ds-chatbot-toggle svg {
            width: 28px;
            height: 28px;
            fill: white;
        }

        #ds-chatbot-container {
            position: absolute;
            bottom: 70px;
            right: 0;
            width: 380px;
            height: 520px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            display: none;
            flex-direction: column;
            overflow: hidden;
            animation: ds-slide-up 0.3s ease;
        }

        @keyframes ds-slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        #ds-chatbot-container.open {
            display: flex;
        }

        .ds-header {
            background: linear-gradient(135deg, #1a5f2a 0%, #2e7d32 100%);
            color: white;
            padding: 14px 16px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .ds-header .avatar {
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }

        .ds-header .info h3 {
            font-size: 14px;
            font-weight: 600;
            margin: 0;
        }

        .ds-header .info p {
            font-size: 11px;
            margin: 2px 0 0;
            opacity: 0.9;
        }

        .ds-header .close {
            margin-left: auto;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 4px;
            opacity: 0.8;
        }

        .ds-header .close:hover {
            opacity: 1;
        }

        .ds-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            background: #f5f7f9;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .ds-msg {
            max-width: 85%;
            padding: 10px 14px;
            border-radius: 14px;
            font-size: 13px;
            line-height: 1.5;
        }

        .ds-msg.bot {
            background: white;
            color: #333;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }

        .ds-msg.user {
            background: #1a5f2a;
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }

        .ds-msg.error {
            background: #ffebee;
            color: #c62828;
        }

        .ds-typing {
            display: flex;
            gap: 4px;
            padding: 10px 14px;
            background: white;
            border-radius: 14px;
            align-self: flex-start;
        }

        .ds-typing span {
            width: 6px;
            height: 6px;
            background: #1a5f2a;
            border-radius: 50%;
            animation: ds-bounce 1.4s infinite ease-in-out;
        }

        .ds-typing span:nth-child(2) { animation-delay: 0.2s; }
        .ds-typing span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes ds-bounce {
            0%, 80%, 100% { transform: scale(0.6); }
            40% { transform: scale(1); }
        }

        .ds-input-area {
            padding: 12px;
            background: white;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 8px;
        }

        .ds-input-area input {
            flex: 1;
            padding: 10px 14px;
            border: 1px solid #e0e0e0;
            border-radius: 20px;
            font-size: 13px;
            outline: none;
        }

        .ds-input-area input:focus {
            border-color: #1a5f2a;
        }

        .ds-input-area button {
            width: 38px;
            height: 38px;
            background: #1a5f2a;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
        }

        .ds-input-area button:disabled {
            background: #ccc;
        }

        @media (max-width: 420px) {
            #ds-chatbot-container {
                width: calc(100vw - 40px);
                height: calc(100vh - 100px);
                bottom: 70px;
                right: 0;
            }
        }
    `;

    // HTML template
    const widgetHTML = `
        <button id="ds-chatbot-toggle" aria-label="Mở chatbot">
            <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        </button>
        <div id="ds-chatbot-container">
            <div class="ds-header">
                <div class="avatar">🏛️</div>
                <div class="info">
                    <h3>Trợ lý ảo xã Diên Sanh</h3>
                    <p>Hỗ trợ thủ tục hành chính</p>
                </div>
                <button class="close" aria-label="Đóng">✕</button>
            </div>
            <div class="ds-messages" id="ds-messages">
                <div class="ds-msg bot">Xin chào! Tôi có thể giúp bạn tìm hiểu về thủ tục hành chính tại xã Diên Sanh. Bạn cần hỗ trợ gì?</div>
            </div>
            <div class="ds-input-area">
                <input type="text" id="ds-input" placeholder="Nhập câu hỏi..." />
                <button id="ds-send">➤</button>
            </div>
        </div>
    `;

    // Initialize widget
    function init() {
        // Add styles
        const styleEl = document.createElement('style');
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);

        // Add widget HTML
        const widgetEl = document.createElement('div');
        widgetEl.id = 'ds-chatbot-widget';
        widgetEl.innerHTML = widgetHTML;
        document.body.appendChild(widgetEl);

        // Elements
        const toggle = document.getElementById('ds-chatbot-toggle');
        const container = document.getElementById('ds-chatbot-container');
        const closeBtn = container.querySelector('.close');
        const messages = document.getElementById('ds-messages');
        const input = document.getElementById('ds-input');
        const sendBtn = document.getElementById('ds-send');

        // Toggle chat
        toggle.addEventListener('click', () => {
            container.classList.toggle('open');
            if (container.classList.contains('open')) {
                input.focus();
            }
        });

        closeBtn.addEventListener('click', () => {
            container.classList.remove('open');
        });

        // Send message
        async function send() {
            const text = input.value.trim();
            if (!text) return;

            // Add user message
            addMsg(text, 'user');
            input.value = '';
            sendBtn.disabled = true;

            // Show typing
            const typing = document.createElement('div');
            typing.className = 'ds-typing';
            typing.innerHTML = '<span></span><span></span><span></span>';
            messages.appendChild(typing);
            messages.scrollTop = messages.scrollHeight;

            try {
                const res = await fetch(`${API_URL}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text, include_sources: false })
                });

                typing.remove();

                if (!res.ok) throw new Error('API error');

                const data = await res.json();
                addMsg(data.response, 'bot');
            } catch (e) {
                typing.remove();
                addMsg('Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại.', 'error');
            }

            sendBtn.disabled = false;
        }

        function addMsg(text, type) {
            const msg = document.createElement('div');
            msg.className = `ds-msg ${type}`;
            msg.textContent = text;
            messages.appendChild(msg);
            messages.scrollTop = messages.scrollHeight;
        }

        sendBtn.addEventListener('click', send);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') send();
        });
    }

    // Initialize when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
