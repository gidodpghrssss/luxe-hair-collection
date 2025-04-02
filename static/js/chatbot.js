/**
 * Chatbot functionality for Luxe Hair Collection
 * Handles customer interaction with the AI-powered chatbot
 */

document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.getElementById('chat-container');
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatButton = document.getElementById('chat-button');
    
    // If any elements are missing, don't initialize the chatbot
    if (!chatContainer || !chatMessages || !chatForm || !chatInput || !chatButton) {
        console.error('Chatbot elements not found on page');
        return;
    }
    
    // Initialize chatbot with welcome message
    appendBotMessage("Hello! I'm Luxe Assistant. How can I help you with our hair products today?");
    
    // Handle form submission
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const message = chatInput.value.trim();
        if (message === '') return;
        
        // Display user message
        appendUserMessage(message);
        
        // Clear input
        chatInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Send message to server
        sendMessage(message);
    });
    
    // Function to send message to the server
    function sendMessage(message) {
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Hide typing indicator
            hideTypingIndicator();
            
            // Display bot response
            appendBotMessage(data.response);
            
            // Scroll to bottom
            scrollToBottom();
        })
        .catch(error => {
            console.error('Error sending message:', error);
            hideTypingIndicator();
            appendBotMessage("I'm sorry, I encountered an error. Please try again later.");
            scrollToBottom();
        });
    }
    
    // Function to append user message
    function appendUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message user-message';
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${escapeHtml(message)}</p>
                <span class="message-time">${getCurrentTime()}</span>
            </div>
        `;
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }
    
    // Function to append bot message
    function appendBotMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message bot-message';
        messageElement.innerHTML = `
            <div class="avatar">
                <img src="/static/images/bot-avatar.png" alt="Luxe Assistant">
            </div>
            <div class="message-content">
                <p>${formatBotMessage(message)}</p>
                <span class="message-time">${getCurrentTime()}</span>
            </div>
        `;
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }
    
    // Function to show typing indicator
    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'chat-message bot-message typing-indicator';
        typingElement.id = 'typing-indicator';
        typingElement.innerHTML = `
            <div class="avatar">
                <img src="/static/images/bot-avatar.png" alt="Luxe Assistant">
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingElement);
        scrollToBottom();
    }
    
    // Function to hide typing indicator
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Function to scroll chat to bottom
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to get current time in HH:MM format
    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    // Function to format bot message (convert markdown to HTML)
    function formatBotMessage(message) {
        // Simple markdown-like formatting
        let formattedMessage = escapeHtml(message);
        
        // Bold text
        formattedMessage = formattedMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic text
        formattedMessage = formattedMessage.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Bullet points
        formattedMessage = formattedMessage.replace(/- (.*?)(?:\n|$)/g, '<li>$1</li>');
        formattedMessage = formattedMessage.replace(/<li>(.*?)<\/li>(?:\s*<li>)/g, '<ul><li>$1</li><li>');
        formattedMessage = formattedMessage.replace(/<li>(.*?)<\/li>(?!\s*<li>)/g, '<li>$1</li></ul>');
        
        // Line breaks
        formattedMessage = formattedMessage.replace(/\n/g, '<br>');
        
        return formattedMessage;
    }
    
    // Function to escape HTML to prevent XSS
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Initialize product recommendations
    const recommendationButton = document.getElementById('recommendation-button');
    if (recommendationButton) {
        recommendationButton.addEventListener('click', function() {
            // Get user preferences from form or predefined values
            const preferences = {
                hairType: document.getElementById('hairType')?.value || 'All',
                texture: document.getElementById('texture')?.value || 'All',
                length: document.getElementById('length')?.value || 'All',
                color: document.getElementById('color')?.value || 'Natural black'
            };
            
            // Show loading state
            recommendationButton.disabled = true;
            recommendationButton.textContent = 'Getting recommendations...';
            
            // Send request to get recommendations
            fetch('/product-recommendation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ preferences: preferences }),
            })
            .then(response => response.json())
            .then(data => {
                // Display recommendations in chat
                appendBotMessage(`Based on your preferences, here are my recommendations:\n\n${data.recommendations}`);
                
                // Reset button
                recommendationButton.disabled = false;
                recommendationButton.textContent = 'Get Product Recommendations';
            })
            .catch(error => {
                console.error('Error getting recommendations:', error);
                appendBotMessage("I'm sorry, I couldn't get recommendations at this time. Please try again later.");
                
                // Reset button
                recommendationButton.disabled = false;
                recommendationButton.textContent = 'Get Product Recommendations';
            });
        });
    }
});
