/**
 * Admin AI Assistant functionality for Luxe Hair Collection
 * Provides an interface for admin users to interact with the AI business agent
 */

document.addEventListener('DOMContentLoaded', function() {
    // Chat elements
    const adminChatMessages = document.getElementById('admin-chat-messages');
    const adminChatForm = document.getElementById('admin-chat-form');
    const adminChatInput = document.getElementById('admin-chat-input');
    const adminChatButton = document.getElementById('admin-chat-button');
    
    // Quick action buttons
    const analyzeInventoryBtn = document.getElementById('analyze-inventory-btn');
    const customerInsightsBtn = document.getElementById('customer-insights-btn');
    const salesForecastBtn = document.getElementById('sales-forecast-btn');
    const marketingSuggestionsBtn = document.getElementById('marketing-suggestions-btn');
    
    // Report form
    const newReportForm = document.getElementById('new-report-form');
    
    // Initialize chat if elements exist
    if (adminChatMessages && adminChatForm && adminChatInput && adminChatButton) {
        // Handle chat form submission
        adminChatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const message = adminChatInput.value.trim();
            if (message === '') return;
            
            // Display admin message
            appendAdminMessage(message);
            
            // Clear input
            adminChatInput.value = '';
            
            // Show typing indicator
            showTypingIndicator();
            
            // Send message to server
            sendAdminQuery(message);
        });
    }
    
    // Function to send admin query to server
    function sendAdminQuery(query, includeBusinessData = true) {
        fetch('/admin/ai-query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                includeBusinessData: includeBusinessData
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server returned an error');
            }
            return response.json();
        })
        .then(data => {
            // Hide typing indicator
            hideTypingIndicator();
            
            // Display AI response
            appendAiMessage(data.response);
            
            // Scroll to bottom
            scrollToBottom();
        })
        .catch(error => {
            console.error('Error in admin AI query:', error);
            hideTypingIndicator();
            appendAiMessage("I'm sorry, I encountered an error processing your request. Please try again.");
            scrollToBottom();
        });
    }
    
    // Function to append admin message
    function appendAdminMessage(message) {
        if (!adminChatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message user-message';
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${escapeHtml(message)}</p>
                <span class="message-time">${getCurrentTime()}</span>
            </div>
        `;
        adminChatMessages.appendChild(messageElement);
        scrollToBottom();
    }
    
    // Function to append AI message
    function appendAiMessage(message) {
        if (!adminChatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message bot-message';
        messageElement.innerHTML = `
            <div class="avatar">
                <img src="/static/images/ai-assistant.png" alt="AI">
            </div>
            <div class="message-content">
                <p>${formatAiResponse(message)}</p>
                <span class="message-time">${getCurrentTime()}</span>
            </div>
        `;
        adminChatMessages.appendChild(messageElement);
        scrollToBottom();
    }
    
    // Function to show typing indicator
    function showTypingIndicator() {
        if (!adminChatMessages) return;
        
        const typingElement = document.createElement('div');
        typingElement.className = 'chat-message bot-message typing-indicator';
        typingElement.id = 'admin-typing-indicator';
        typingElement.innerHTML = `
            <div class="avatar">
                <img src="/static/images/ai-assistant.png" alt="AI">
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        adminChatMessages.appendChild(typingElement);
        scrollToBottom();
    }
    
    // Function to hide typing indicator
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('admin-typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Function to scroll chat to bottom
    function scrollToBottom() {
        if (adminChatMessages) {
            adminChatMessages.scrollTop = adminChatMessages.scrollHeight;
        }
    }
    
    // Setup quick action buttons
    if (analyzeInventoryBtn) {
        analyzeInventoryBtn.addEventListener('click', function() {
            if (adminChatInput) {
                adminChatInput.value = "Analyze our current inventory levels and identify which products need restocking";
                appendAdminMessage(adminChatInput.value);
                adminChatInput.value = '';
                showTypingIndicator();
                sendAdminQuery("Analyze our current inventory levels and identify which products need restocking");
            }
        });
    }
    
    if (customerInsightsBtn) {
        customerInsightsBtn.addEventListener('click', function() {
            if (adminChatInput) {
                adminChatInput.value = "Analyze our customer data and provide insights on purchasing patterns";
                appendAdminMessage(adminChatInput.value);
                adminChatInput.value = '';
                showTypingIndicator();
                sendAdminQuery("Analyze our customer data and provide insights on purchasing patterns");
            }
        });
    }
    
    if (salesForecastBtn) {
        salesForecastBtn.addEventListener('click', function() {
            if (adminChatInput) {
                adminChatInput.value = "Generate a sales forecast for the next 30 days based on historical data";
                appendAdminMessage(adminChatInput.value);
                adminChatInput.value = '';
                showTypingIndicator();
                sendAdminQuery("Generate a sales forecast for the next 30 days based on historical data");
            }
        });
    }
    
    if (marketingSuggestionsBtn) {
        marketingSuggestionsBtn.addEventListener('click', function() {
            if (adminChatInput) {
                adminChatInput.value = "Suggest marketing strategies to boost sales of our premium hair collections";
                appendAdminMessage(adminChatInput.value);
                adminChatInput.value = '';
                showTypingIndicator();
                sendAdminQuery("Suggest marketing strategies to boost sales of our premium hair collections");
            }
        });
    }
    
    // Handle report generation form
    if (newReportForm) {
        newReportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const reportType = document.getElementById('report-type')?.value;
            if (!reportType) {
                showToast('Please select a report type', 'danger');
                return;
            }
            
            // Show processing notification
            showToast('Generating report... This may take a moment.', 'info');
            
            // This would normally submit to a server endpoint
            // For now, we're just simulating the report generation
            setTimeout(() => {
                showToast('Report generated successfully!', 'success');
            }, 3000);
        });
    }
    
    // Helper function to show toast notification
    function showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast
        const toastId = `toast-${Date.now()}`;
        const toastHtml = `
            <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header bg-${type} text-white">
                    <strong class="me-auto">Luxe AI</strong>
                    <small>${getCurrentTime()}</small>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${escapeHtml(message)}
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        
        // Initialize and show the toast
        const toastEl = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
        
        // Remove toast after it's hidden
        toastEl.addEventListener('hidden.bs.toast', function() {
            toastEl.remove();
        });
    }
    
    // Function to get current time in HH:MM format
    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    // Helper function to format AI response with markdown-like syntax
    function formatAiResponse(response) {
        if (!response) return '<div class="alert alert-warning">No response received</div>';
        
        let formatted = escapeHtml(response);
        
        // Headers
        formatted = formatted.replace(/^# (.*?)$/gm, '<h5>$1</h5>');
        formatted = formatted.replace(/^## (.*?)$/gm, '<h6>$1</h6>');
        
        // Bold
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Lists
        formatted = formatted.replace(/^- (.*?)$/gm, '<li>$1</li>');
        formatted = formatted.replace(/(<li>.*?<\/li>)(?:\s*<li>)/g, '<ul>$1<li>');
        formatted = formatted.replace(/(<li>.*?<\/li>)(?!\s*<li>)/g, '$1</ul>');
        
        // Links
        formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Line breaks
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }
    
    // Helper function to escape HTML
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
