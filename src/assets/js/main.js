
// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const authButtons = document.querySelector('.auth-buttons');
const chatToggle = document.getElementById('chat-toggle');
const chatbotContainer = document.getElementById('chatbot-container');
const closeChat = document.getElementById('close-chat');
const chatInput = document.getElementById('chat-input');
const sendMessage = document.getElementById('send-message');
const chatMessages = document.getElementById('chatbot-messages');
const loginBtn = document.querySelector('.login-btn');
const signupBtn = document.querySelector('.signup-btn');
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const closeModals = document.querySelectorAll('.close-modal');
const loginLink = document.getElementById('login-link');
const signupLink = document.getElementById('signup-link');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const newsletterForm = document.getElementById('newsletter-form');
const sliderDots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const testimonialSlider = document.querySelector('.testimonials-slider');

// Mobile Navigation
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        authButtons.classList.toggle('active');
    });
}

// Chatbot Toggle
if (chatToggle && chatbotContainer) {
    chatToggle.addEventListener('click', (e) => {
        e.preventDefault();
        chatbotContainer.classList.toggle('active');
    });
}

// Close Chatbot
if (closeChat && chatbotContainer) {
    closeChat.addEventListener('click', () => {
        chatbotContainer.classList.remove('active');
    });
}

// Send Chat Message
if (sendMessage && chatInput) {
    sendMessage.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
}

// Function to send chat message
function sendChatMessage() {
    if (chatInput.value.trim() === '') return;
    
    // Add user message to chat
    addMessageToChat(chatInput.value, 'user');
    
    // Get response from Groq API
    getGroqResponse(chatInput.value);
    
    // Clear input
    chatInput.value = '';
}

// Function to add message to chat
function addMessageToChat(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    
    const messageText = document.createElement('p');
    messageText.textContent = message;
    
    messageContent.appendChild(messageText);
    messageElement.appendChild(messageContent);
    
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Modal Functionality
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        loginModal.classList.add('active');
    });
}

if (signupBtn) {
    signupBtn.addEventListener('click', () => {
        signupModal.classList.add('active');
    });
}

if (closeModals) {
    closeModals.forEach(closeModal => {
        closeModal.addEventListener('click', () => {
            loginModal.classList.remove('active');
            signupModal.classList.remove('active');
        });
    });
}

if (loginLink) {
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupModal.classList.remove('active');
        loginModal.classList.add('active');
    });
}

if (signupLink) {
    signupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.remove('active');
        signupModal.classList.add('active');
    });
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.classList.remove('active');
    }
    if (e.target === signupModal) {
        signupModal.classList.remove('active');
    }
});

// Form Submissions
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            await signInUser(email, password);
            loginModal.classList.remove('active');
            showNotification('Logged in successfully!', 'success');
                setTimeout(() => { window.location.reload(); }, 500);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        try {
            await signUpUser(email, password, name);
            signupModal.classList.remove('active');
            showNotification('Account created successfully!', 'success');
                setTimeout(() => { window.location.reload(); }, 500);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
}

if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        
        try {
            await subscribeToNewsletter(email);
            showNotification('Subscribed to newsletter!', 'success');
            newsletterForm.reset();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
}

// Testimonial Slider
let currentSlide = 0;

function showSlide(index) {
    if (!testimonialSlider) return;
    
    const slides = document.querySelectorAll('.testimonial-card');
    if (slides.length === 0) return;
    
    if (index >= slides.length) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = slides.length - 1;
    } else {
        currentSlide = index;
    }
    
    const offset = currentSlide * -100;
    testimonialSlider.style.transform = `translateX(${offset}%)`;
    
    // Update dots
    sliderDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
    });
}

if (sliderDots) {
    sliderDots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            showSlide(i);
        });
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`);
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: var(--border-radius-md);
        color: white;
        font-weight: 500;
        z-index: 9999;
        opacity: 0;
        transform: translateY(-20px);
        transition: opacity 0.3s ease, transform 0.3s ease;
        box-shadow: var(--shadow-md);
    }
    
    .notification.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .notification-success {
        background-color: var(--success-color);
    }
    
    .notification-error {
        background-color: var(--danger-color);
    }
    
    .notification-info {
        background-color: var(--primary-color);
    }
    
    .notification-warning {
        background-color: var(--warning-color);
    }
`;
document.head.appendChild(notificationStyles);

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize testimonial slider
    showSlide(0);
    
    try {
        // Initialize Supabase tables first
        await initializeSupabaseTables();
        
        // Check if user is logged in
        checkAuthState();
        
    // Homepage now loads all articles dynamically
        
        
    } catch (error) {
        console.error('Initialization error:', error);
        // Continue with the app even if there's an error
        // This allows the static content to be displayed
    }
});

// Removed featured articles function; homepage now shows all articles

// Function to render articles
function renderArticles(articles) {
    const articlesGrid = document.querySelector('.articles-grid');
    if (!articlesGrid || !articles) return;
    
    // Clear existing articles
    articlesGrid.innerHTML = '';
    
    // Add articles to grid
    articles.forEach(article => {
        const articleCard = document.createElement('div');
        articleCard.classList.add('article-card');
        
        articleCard.innerHTML = `
            <div class="article-image">
                <img src="${article.image_url}" alt="${article.title}">
            </div>
            <div class="article-content">
                <div class="article-tag">${article.category}</div>
                <h3>${article.title}</h3>
                <p>${article.summary}</p>
                <a href="src/pages/article.html?id=${article.id}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
        `;
        
        articlesGrid.appendChild(articleCard);
    });
}

// Function to handle auth state changes
async function handleAuthStateChange(user) {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;
    
    if (user) {
        // User is logged in
        // Determine the correct path prefix based on current page
        const isInSubfolder = window.location.pathname.includes('/pages/');
        const pathPrefix = isInSubfolder ? '../' : 'src/';
        
        // Check if user is a writer
        const isWriterStatus = await isWriter(user.email);
        
        authButtons.innerHTML = `
            <div class="user-menu">
                <button class="user-button">
                    <span>${(user.user_metadata.name && user.user_metadata.name.length > 8) ? user.user_metadata.name.slice(0,8) + '...' : (user.user_metadata.name || user.email)}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="user-dropdown">
                    <a href="${pathPrefix}pages/profile.html">Profile</a>
                    <a href="${pathPrefix}pages/saved-articles.html">Saved Articles</a>
                    ${isWriterStatus ? `<a href="${pathPrefix}pages/writer-dashboard.html">Writer Dashboard</a>` : ''}
                    <a href="#" id="logout-btn">Log Out</a>
                </div>
            </div>
        `;
        
        // Add logout functionality
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    await signOutUser();
                    showNotification('Logged out successfully!', 'success');
                        setTimeout(() => { window.location.reload(); }, 500);
                } catch (error) {
                    showNotification(error.message, 'error');
                }
            });
        }
        
        // Add user dropdown toggle
        const userButton = document.querySelector('.user-button');
        const userDropdown = document.querySelector('.user-dropdown');
        
        if (userButton && userDropdown) {
            userButton.addEventListener('click', () => {
                userDropdown.classList.toggle('active');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userButton.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('active');
                }
            });
        }
        
        // Add user menu styles
        const userMenuStyles = document.createElement('style');
        userMenuStyles.textContent = `
            .user-menu {
                position: relative;
            }
            
            .user-button {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                background: var(--primary-gradient);
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: var(--border-radius-md);
                font-weight: 500;
                cursor: pointer;
                transition: var(--transition-fast);
            }
            
            .user-button:hover {
                background: var(--primary-gradient-hover);
            }
            
            .user-dropdown {
                position: absolute;
                top: calc(100% + 10px);
                right: 0;
                background-color: white;
                border-radius: var(--border-radius-md);
                box-shadow: var(--shadow-lg);
                padding: var(--spacing-md);
                min-width: 200px;
                display: none;
                flex-direction: column;
                gap: var(--spacing-sm);
                z-index: 100;
            }
            
            .user-dropdown.active {
                display: flex;
            }
            
            .user-dropdown a {
                color: var(--dark-color);
                padding: var(--spacing-sm);
                border-radius: var(--border-radius-sm);
                transition: var(--transition-fast);
            }
            
            .user-dropdown a:hover {
                background-color: var(--gray-light);
                color: var(--primary-color);
            }
        `;
        document.head.appendChild(userMenuStyles);
    } else {
        // User is not logged in
        authButtons.innerHTML = `
            <button class="btn btn-secondary login-btn">Log In</button>
            <button class="btn btn-primary signup-btn">Sign Up</button>
        `;
        
        // Re-add event listeners
        const loginBtn = document.querySelector('.login-btn');
        const signupBtn = document.querySelector('.signup-btn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                loginModal.classList.add('active');
            });
        }
        
        if (signupBtn) {
            signupBtn.addEventListener('click', () => {
                signupModal.classList.add('active');
            });
        }
        
        // Track user interactions
        function trackUserInteractions() {
            // Track button clicks
            document.addEventListener('click', (e) => {
                // Check if clicked element is a button or link
                if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' ||
                    e.target.parentElement.tagName === 'BUTTON' || e.target.parentElement.tagName === 'A') {
                    
                    // Get element text
                    let text = e.target.textContent || e.target.parentElement.textContent || 'Unknown';
                    text = text.trim();
                    
                    // Get element ID or class
                    const id = e.target.id || e.target.parentElement.id || '';
                    const className = e.target.className || e.target.parentElement.className || '';
                    
                }
            });
            
            // Track form submissions
            document.addEventListener('submit', (e) => {
                // Get form ID or class
                const id = e.target.id || '';
                const className = e.target.className || '';
                
            });
            
            // Track chatbot usage
            if (chatInput && sendMessage) {
                const originalSendChatMessage = sendChatMessage;
                
                // Override sendChatMessage function to track interactions
                sendChatMessage = function() {
                    if (chatInput.value.trim() === '') return;
                    
                    
                    // Call original function
                    originalSendChatMessage();
                };
            }
        }
    }
}