// Class to manage the sections of the site and handle transitions between them
class SiteSectionManager {
    // Initialize the manager with section definitions and state
    constructor() {
        // Object containing all sections of the site with their properties
        this.sections = {
            hero: {
                element: document.getElementById('hero-container'),
                isComplete: false,
                next: 'info'  // Points to the next section in sequence
            },
            info: {
                element: document.querySelector('.info-container'),
                isComplete: false,
                next: 'mixes'
            },
            mixes: {
                element: document.querySelector('.mixes-container'),
                isComplete: false,
                next: 'footer'
            },
            footer: {
                element: document.querySelector('.site-footer'),
                isComplete: false,
                next: null  // No next section after footer
            }
        };
        
        // Track which section is currently active
        this.currentSection = 'hero';
        
        // State object for managing progress through sections
        this.progressState = {
            current: 0,      // Current progress value
            max: 100,        // Maximum progress value
            rate: 25,        // Progress increase rate per second
            scrollIncrement: 15  // How much progress is added per scroll
        };
        
        // Start initialization
        this.initialize();
    }
    
    // Set up initial state and event listeners
    initialize() {
        // Ensure page starts at the top
        history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        
        // Set up all event handlers and start countdown
        this.setupEventListeners();
        this.startCountdownTimer();
    }
    
    // Set up all event listeners for the site
    setupEventListeners() {
        // Allow clicking the hero section to proceed
        this.sections.hero.element.addEventListener('click', () => {
            this.proceedToSection('info');
        });
        
        // Scroll handling with throttle to prevent too many events
        let lastScrollTime = 0;
        const scrollCooldown = 200;  // Milliseconds between scroll events
        
        // Handle mouse wheel events
        window.addEventListener('wheel', (e) => {
            const now = Date.now();
            
            // Handle initial scroll from hero section
            if (this.currentSection === 'hero' && e.deltaY > 0) {
                e.preventDefault();
                this.proceedToSection('info');
                return;
            }
            
            // Handle scrolling within info section
            if (this.currentSection === 'info' && !this.sections.info.isComplete) {
                e.preventDefault();
                if (now - lastScrollTime > scrollCooldown) {
                    this.updateProgress(this.progressState.current + this.progressState.scrollIncrement);
                    lastScrollTime = now;
                }
            }
            
            // Handle transition from info to mixes section
            if (this.sections.info.isComplete && this.currentSection === 'info' && e.deltaY > 0) {
                e.preventDefault();
                this.proceedToSection('mixes');
            }
        }, { passive: false });
        
        // Set up audio player controls for mix items
        const mixItems = document.querySelectorAll('.mix-item');
        const audioPlayer = document.getElementById('mixPlayer');
        
        // Add click handlers to each mix item
        mixItems.forEach(mixItem => {
            const button = mixItem.querySelector('.play-mix');
            button.addEventListener('click', () => {
                audioPlayer.src = mixItem.getAttribute('data-src');
                audioPlayer.play();
                this.sections.footer.element.classList.remove('hidden');
                this.currentSection = 'footer';
            });
        });
        
        // Watch for scrolling to bottom to reveal footer
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY + window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            if (scrollPosition >= documentHeight - 50) {
                this.sections.footer.element.classList.remove('hidden');
                this.currentSection = 'footer';
            }
        });
    }
    
    // Handle transition to a new section
    proceedToSection(sectionName) {
        const section = this.sections[sectionName];
        if (!section) return;
        
        // Modified: Changed scroll behavior to align with top of section
        section.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Update current section tracking
        this.currentSection = sectionName;
        
        // Start progress timer when entering info section
        if (sectionName === 'info') {
            this.startProgressTimer();
            this.showScrollIndicator();
        }
        
        // Handle section-specific transitions
        if (sectionName === 'mixes') {
            this.sections.mixes.element.classList.add('visible');
            this.sections.info.isComplete = true;
        } else if (sectionName === 'footer') {
            this.sections.footer.element.classList.remove('hidden');
        }
    }
    
    // Update progress through the info section
    updateProgress(newProgress) {
        // Ensure progress doesn't exceed maximum
        this.progressState.current = Math.min(newProgress, this.progressState.max);
        
        // Show grid rows based on current progress
        const infoRows = document.querySelectorAll('.grid-row');
        const rowsToShow = Math.floor((this.progressState.current / this.progressState.max) * infoRows.length);
        
        // Update visibility of rows
        infoRows.forEach((row, index) => {
            if (index < rowsToShow) {
                row.classList.add('visible');
            }
        });
        
        // Check if section is complete
        if (this.progressState.current >= this.progressState.max) {
            this.sections.info.isComplete = true;
            this.hideScrollIndicator();
            this.enableMixesSection();
        }
    }
    
    // Start timer for automatic progress
    startProgressTimer() {
        if (this._progressTimer) return;
        
        // Update progress every 100ms
        this._progressTimer = setInterval(() => {
            if (this.progressState.current < this.progressState.max) {
                this.updateProgress(this.progressState.current + this.progressState.rate/10);
            } else {
                clearInterval(this._progressTimer);
            }
        }, 100);
    }
    
    // Enable and animate the mixes section
    enableMixesSection() {
        this.sections.mixes.element.classList.add('visible');
        const pastVoyages = document.querySelector('.past-voyages');
        // Add flash effect
        pastVoyages.classList.add('flash');
        setTimeout(() => {
            pastVoyages.classList.remove('flash');
        }, 1000);
    }
    
    // Start the countdown timer for next broadcast
    startCountdownTimer() {
        const updateCountdown = () => {
            const now = new Date();
            const nextFriday = this.getNextFriday10PM();
            const countdownElement = document.getElementById('countdown');
            
            // Check if broadcast is currently active
            if (now.getDay() === 5 && now.getHours() === 22) {
                countdownElement.textContent = 'BASS STATION ACTIVE';
                countdownElement.style.color = '#ff0000';
            } else {
                // Calculate time until next broadcast
                const diff = nextFriday - now;
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                
                countdownElement.textContent = `${days}D ${hours}H ${minutes}M ${seconds}S`;
                countdownElement.style.color = 'rgba(239, 36, 170, 1)';
            }
        };
        
        // Update countdown every second
        setInterval(updateCountdown, 1000);
        updateCountdown();
    }
    
    // Calculate the next Friday at 10 PM
    getNextFriday10PM() {
        const now = new Date();
        const nextFriday = new Date();
        // Calculate days until next Friday
        nextFriday.setDate(now.getDate() + ((7 - now.getDay() + 5) % 7));
        nextFriday.setHours(22, 0, 0, 0);
        
        // If it's already past this Friday at 10 PM, get next week
        if (nextFriday <= now) {
            nextFriday.setDate(nextFriday.getDate() + 7);
        }
        
        return nextFriday;
    }
}

// Initialize the site manager when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const siteManager = new SiteSectionManager();
});