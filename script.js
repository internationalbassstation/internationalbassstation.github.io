class SiteSectionManager {
    constructor() {
        this.sections = {
            hero: {
                element: document.getElementById('hero-container'),
                isComplete: false,
                next: 'info'
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
                next: null
            }
        };
        
        this.currentSection = 'hero';
        this.progressState = {
            current: 0,
            max: 100,
            rate: 25, // per second
            scrollIncrement: 15
        };
        
        this.initialize();
    }
    
    initialize() {
        // Reset scroll position
        history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        
        // Set up event listeners
        this.setupEventListeners();
        this.startCountdownTimer();
    }
    
    setupEventListeners() {
        // Hero click handler
        this.sections.hero.element.addEventListener('click', () => {
            this.proceedToSection('info');
        });
        
        // Scroll handling with throttle
        let lastScrollTime = 0;
        const scrollCooldown = 200;
        
        window.addEventListener('wheel', (e) => {
            const now = Date.now();
            
            // Initial scroll from hero
            if (this.currentSection === 'hero' && e.deltaY > 0) {
                e.preventDefault();
                this.proceedToSection('info');
                return;
            }
            
            // Handle info section progression
            if (this.currentSection === 'info' && !this.sections.info.isComplete) {
                e.preventDefault();
                if (now - lastScrollTime > scrollCooldown) {
                    this.updateProgress(this.progressState.current + this.progressState.scrollIncrement);
                    lastScrollTime = now;
                }
            }
            
            // Handle scroll to mixes section
            if (this.sections.info.isComplete && this.currentSection === 'info' && e.deltaY > 0) {
                e.preventDefault();
                this.proceedToSection('mixes');
            }
        }, { passive: false });
        
        // Mix selection handlers
        const mixItems = document.querySelectorAll('.mix-item');
        const audioPlayer = document.getElementById('mixPlayer');
        
        mixItems.forEach(mixItem => {
            const button = mixItem.querySelector('.play-mix');
            button.addEventListener('click', () => {
                audioPlayer.src = mixItem.getAttribute('data-src');
                audioPlayer.play();
                this.sections.footer.element.classList.remove('hidden');
                this.currentSection = 'footer';
            });
        });
        
        // Watch for scroll to bottom to show footer
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY + window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            if (scrollPosition >= documentHeight - 50) {
                this.sections.footer.element.classList.remove('hidden');
                this.currentSection = 'footer';
            }
        });
    }
    
    proceedToSection(sectionName) {
        const section = this.sections[sectionName];
        if (!section) return;
        
        // Scroll to section
        section.element.scrollIntoView({ behavior: 'smooth' });
        
        // Update current section
        this.currentSection = sectionName;
        
        // Start progress timer if entering info section
        if (sectionName === 'info') {
            this.startProgressTimer();
            this.showScrollIndicator();
        }
        
        // Handle section-specific visibility
        if (sectionName === 'mixes') {
            this.sections.mixes.element.classList.add('visible');
            this.sections.info.isComplete = true;
        } else if (sectionName === 'footer') {
            this.sections.footer.element.classList.remove('hidden');
        }
    }
    
    updateProgress(newProgress) {
        this.progressState.current = Math.min(newProgress, this.progressState.max);
        
        // Calculate visible sections based on progress
        const infoRows = document.querySelectorAll('.grid-row');
        const rowsToShow = Math.floor((this.progressState.current / this.progressState.max) * infoRows.length);
        
        infoRows.forEach((row, index) => {
            if (index < rowsToShow) {
                row.classList.add('visible');
            }
        });
        
        // Check for section completion
        if (this.progressState.current >= this.progressState.max) {
            this.sections.info.isComplete = true;
            this.hideScrollIndicator();
            this.enableMixesSection();
        }
    }
    
    startProgressTimer() {
        if (this._progressTimer) return;
        
        this._progressTimer = setInterval(() => {
            if (this.progressState.current < this.progressState.max) {
                this.updateProgress(this.progressState.current + this.progressState.rate/10);
            } else {
                clearInterval(this._progressTimer);
            }
        }, 100);
    }
    
    enableMixesSection() {
        this.sections.mixes.element.classList.add('visible');
        const pastVoyages = document.querySelector('.past-voyages');
        pastVoyages.classList.add('flash');
        setTimeout(() => {
            pastVoyages.classList.remove('flash');
        }, 1000);
    }
    
    showScrollIndicator() {
        document.querySelector('.scroll-indicator').classList.add('visible');
    }
    
    hideScrollIndicator() {
        document.querySelector('.scroll-indicator').classList.remove('visible');
    }
    
    startCountdownTimer() {
        const updateCountdown = () => {
            const now = new Date();
            const nextFriday = this.getNextFriday10PM();
            const countdownElement = document.getElementById('countdown');
            
            if (now.getDay() === 5 && now.getHours() === 22) {
                countdownElement.textContent = 'BASS STATION ACTIVE';
                countdownElement.style.color = '#ff0000';
            } else {
                const diff = nextFriday - now;
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                
                countdownElement.textContent = `${days}D ${hours}H ${minutes}M ${seconds}S`;
                countdownElement.style.color = 'rgba(239, 36, 170, 1)';
            }
        };
        
        setInterval(updateCountdown, 1000);
        updateCountdown();
    }
    
    getNextFriday10PM() {
        const now = new Date();
        const nextFriday = new Date();
        nextFriday.setDate(now.getDate() + ((7 - now.getDay() + 5) % 7));
        nextFriday.setHours(22, 0, 0, 0);
        
        if (nextFriday <= now) {
            nextFriday.setDate(nextFriday.getDate() + 7);
        }
        
        return nextFriday;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const siteManager = new SiteSectionManager();
});