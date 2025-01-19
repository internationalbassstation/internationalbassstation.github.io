class SiteSectionManager {
    constructor() {
        // Define the main sections of the site and their relationships
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
        
        // Track the current section being viewed
        this.currentSection = 'hero';
        
        // Progress state for the info section's reveal animation
        this.progressState = {
            current: 0,
            max: 100,
            rate: 25,               // Base rate of progress increase
            interactionIncrement: 15 // How much progress increases per interaction
        };
        
        // State management for user interactions
        this.interactionState = {
            startY: 0,
            lastInteractionTime: 0,
            isTouching: false,
            cooldownPeriod: 200,     // Prevents rapid-fire interactions
            interactionThreshold: 10  // Minimum distance for touch interactions
        };

        // Specific touch event handling state
        this.touchState = {
            lastTouchTime: 0,
            touchDelay: 300,         // Minimum time between touch events
            startY: 0,
            startX: 0,
            minSwipeDistance: 50,    // Minimum distance for a swipe
            isScrolling: false
        };
        
        this.initialize();
    }
    
    initialize() {
        // Ensure page starts at the top
        history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        
        this.setupEventListeners();
        this.startCountdownTimer();
    }

    // Handle touch events with improved gesture detection
    handleTouchEvent(e, eventType) {
        const now = Date.now();
        
        if (eventType === 'start') {
            this.touchState.startY = e.touches[0].clientY;
            this.touchState.startX = e.touches[0].clientX;
            this.touchState.isScrolling = false;
            return true;
        }
        
        // Prevent rapid touch events
        if (now - this.touchState.lastTouchTime < this.touchState.touchDelay) {
            return false;
        }
        
        const deltaY = this.touchState.startY - e.touches[0].clientY;
        const deltaX = this.touchState.startX - e.touches[0].clientX;
        
        // Only trigger for vertical swipes
        if (Math.abs(deltaY) > Math.abs(deltaX) && 
            Math.abs(deltaY) > this.touchState.minSwipeDistance) {
            this.touchState.lastTouchTime = now;
            this.touchState.isScrolling = true;
            return true;
        }
        
        return false;
    }
    
    setupEventListeners() {
        // Hero section event listeners
        this.setupHeroListeners();

        // Info section event listeners
        this.setupInfoSectionListeners();

        // Past Voyages section listeners
        this.setupPastVoyagesListeners();
        
        // Audio player setup
        this.setupAudioControls();
        
        // Handle tab/window visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseProgressTimer();
            } else if (this.currentSection === 'info' && !this.sections.info.isComplete) {
                this.startProgressTimer();
            }
        });

        // Add scroll detection for footer reveal
        window.addEventListener('scroll', () => {
            // Show footer when near bottom of page
            const scrollPosition = window.scrollY + window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            if (scrollPosition >= documentHeight - 50) {
                this.sections.footer.element.classList.remove('hidden');
                this.currentSection = 'footer';
            }
        });
    }

    setupHeroListeners() {
        const heroElement = this.sections.hero.element;

        // Handle mouse wheel on hero
        heroElement.addEventListener('wheel', (e) => {
            if (this.currentSection === 'hero' && e.deltaY > 0) {
                e.preventDefault();
                this.handleHeroScroll();
            }
        }, { passive: false });

        // Handle touch events on hero
        heroElement.addEventListener('touchstart', (e) => {
            if (this.currentSection === 'hero') {
                this.handleTouchEvent(e, 'start');
            }
        }, { passive: true });

        heroElement.addEventListener('touchmove', (e) => {
            if (this.currentSection === 'hero' && 
                this.handleTouchEvent(e, 'move')) {
                e.preventDefault();
                this.handleHeroScroll();
            }
        }, { passive: false });

        // Handle clicks on hero
        heroElement.addEventListener('click', () => {
            if (this.currentSection === 'hero') {
                this.handleHeroScroll();
            }
        });
    }

setupInfoSectionListeners() {
    const infoSection = this.sections.info.element;
    let isAtInfoBottom = false;
    let scrollTimeout;
    
    // Function to check if we're at the bottom of info section
    const checkInfoBottom = () => {
        const infoRect = infoSection.getBoundingClientRect();
        const tolerance = 5; // Small tolerance for rounding errors
        return (infoRect.bottom <= window.innerHeight + tolerance);
    };

    // Prevent default scroll when at info bottom
    const handleScroll = (e) => {
        if (this.currentSection === 'info') {
            if (isAtInfoBottom && e.deltaY > 0) {
                e.preventDefault();
                this.handlePastVoyagesTransition();
            } else if (!this.sections.info.isComplete) {
                this.handleInteraction(e.deltaY > 0);
            }
        }
    };

    // Update isAtInfoBottom state
    const updateScrollState = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (this.currentSection === 'info') {
                isAtInfoBottom = checkInfoBottom();
                
                // If we've scrolled to bottom and info section is complete,
                // prepare for next scroll to trigger transition
                if (isAtInfoBottom && this.sections.info.isComplete) {
                    infoSection.style.height = '100vh';
                    infoSection.style.overflow = 'hidden';
                }
            }
        }, 50);
    };

    // Add scroll event listeners
    window.addEventListener('scroll', updateScrollState, { passive: true });
    infoSection.addEventListener('wheel', handleScroll, { passive: false });
    
    // Touch events for info section
    infoSection.addEventListener('touchstart', (e) => {
        if (this.currentSection === 'info') {
            this.handleTouchEvent(e, 'start');
        }
    }, { passive: true });
    
    infoSection.addEventListener('touchmove', (e) => {
        if (this.currentSection === 'info') {
            if (isAtInfoBottom && this.sections.info.isComplete) {
                e.preventDefault();
                this.handlePastVoyagesTransition();
            } else if (!this.sections.info.isComplete) {
                if (this.handleTouchEvent(e, 'move')) {
                    this.handleInteraction(true);
                }
            }
        }
    }, { passive: false });
    
    // Update isAtInfoBottom when content becomes visible
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('visible')) {
                updateScrollState();
            }
        });
    });

    document.querySelectorAll('.grid-row').forEach(row => {
        observer.observe(row, { attributes: true });
    });
}

// Update handlePastVoyagesTransition() to ensure smooth transition
handlePastVoyagesTransition() {
    const pastVoyages = document.querySelector('.past-voyages');
    const mixesSection = this.sections.mixes.element;
    
    pastVoyages.style.transition = 'transform 0.8s ease-out';
    pastVoyages.style.transform = 'scale(1.05)';
    
    // Ensure mixes section is ready for smooth scroll
    mixesSection.style.opacity = '0';
    mixesSection.classList.add('visible');
    
    setTimeout(() => {
        // Reset info section constraints
        this.sections.info.element.style.height = '';
        this.sections.info.element.style.overflow = '';
        
        // Smooth scroll to mixes section
        mixesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.currentSection = 'mixes';
        
        // Fade in mixes section
        setTimeout(() => {
            mixesSection.style.opacity = '1';
            
            // Reset past voyages transform
            pastVoyages.style.transition = 'none';
            pastVoyages.style.transform = 'none';
        }, 800);
    }, 400);
}    

    setupPastVoyagesListeners() {
        const pastVoyages = document.querySelector('.past-voyages');
        const touchConfig = {
            startTime: 0,
            startY: 0,
            longPressThreshold: 500,
            moveThreshold: 10
        };

        // Touch events for Past Voyages section
        pastVoyages.addEventListener('touchstart', (e) => {
            touchConfig.startTime = Date.now();
            touchConfig.startY = e.touches[0].clientY;
        }, { passive: true });

        pastVoyages.addEventListener('touchend', (e) => {
            const touchDuration = Date.now() - touchConfig.startTime;
            const touchEndY = e.changedTouches[0].clientY;
            const touchDistance = Math.abs(touchEndY - touchConfig.startY);

            if (touchDuration < touchConfig.longPressThreshold && 
                touchDistance < touchConfig.moveThreshold) {
                this.handlePastVoyagesTransition();
            }
        });

        // Click event for desktop
        pastVoyages.addEventListener('click', (e) => {
            if (e.pointerType === 'mouse' || !e.pointerType) {
                this.handlePastVoyagesTransition();
            }
        });
    }

    handleHeroScroll() {
        if (this.currentSection === 'hero') {
            const heroBackground = this.sections.hero.element.querySelector('.hero-background');
            heroBackground.style.transition = 'transform 0.8s ease-out';
            heroBackground.style.transform = 'scale(1.1) translateY(-5%)';
            
            setTimeout(() => {
                this.proceedToSection('info');
                setTimeout(() => {
                    heroBackground.style.transition = 'none';
                    heroBackground.style.transform = 'none';
                }, 800);
            }, 400);
        }
    }

    handlePastVoyagesTransition() {
        const pastVoyages = document.querySelector('.past-voyages');
        pastVoyages.style.transition = 'transform 0.8s ease-out';
        pastVoyages.style.transform = 'scale(1.05)';
        
        setTimeout(() => {
            this.proceedToSection('mixes');
            setTimeout(() => {
                pastVoyages.style.transition = 'none';
                pastVoyages.style.transform = 'none';
            }, 800);
        }, 400);
    }
    
    handleInteraction(isForward) {
        const now = Date.now();
        if (now - this.interactionState.lastInteractionTime < this.interactionState.cooldownPeriod) {
            return;
        }
        
        const isMobile = window.innerWidth <= 768;
        
        if (isForward && !this.sections.info.isComplete) {
            const increment = isMobile ? 
                this.progressState.interactionIncrement / 2 : 
                this.progressState.interactionIncrement;
                
            this.updateProgress(this.progressState.current + increment);
        }
        this.interactionState.lastInteractionTime = now;
    }
    
    proceedToSection(sectionName) {
        const section = this.sections[sectionName];
        if (!section) return;
        
        section.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.currentSection = sectionName;
        
        if (sectionName === 'info') {
            this.startProgressTimer();
        } else if (sectionName === 'mixes') {
            this.enableMixesSection();
        } else if (sectionName === 'footer') {
            this.sections.footer.element.classList.remove('hidden');
        }
    }
    
    updateProgress(newProgress) {
        this.progressState.current = Math.min(newProgress, this.progressState.max);
        
        const infoRows = document.querySelectorAll('.grid-row');
        const rowsToShow = Math.floor((this.progressState.current / this.progressState.max) * infoRows.length);
        
        infoRows.forEach((row, index) => {
            if (index < rowsToShow) {
                row.classList.add('visible');
            }
        });
        
        if (this.progressState.current >= this.progressState.max) {
            this.sections.info.isComplete = true;
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
    
    pauseProgressTimer() {
        if (this._progressTimer) {
            clearInterval(this._progressTimer);
            this._progressTimer = null;
        }
    }
    
    setupAudioControls() {
        const mixItems = document.querySelectorAll('.mix-item');
        const audioPlayer = document.getElementById('mixPlayer');
        
        mixItems.forEach(mixItem => {
            const button = mixItem.querySelector('.play-mix');
            let touchStartTime;
            let touchStartY;
            let isTouchMove = false;
            
            // Touch event handling for mix buttons
            button.addEventListener('touchstart', (e) => {
                touchStartTime = Date.now();
                touchStartY = e.touches[0].clientY;
                isTouchMove = false;
            }, { passive: true });
            
            button.addEventListener('touchmove', (e) => {
                const touchMoveY = e.touches[0].clientY;
                if (Math.abs(touchMoveY - touchStartY) > 10) {
                    isTouchMove = true;
                }
            }, { passive: true });
            
            button.addEventListener('touchend', (e) => {
                const touchDuration = Date.now() - touchStartTime;
                
                if (touchDuration < 200 && !isTouchMove) {
                    audioPlayer.src = mixItem.getAttribute('data-src');
                    audioPlayer.play().catch(() => {});
                    this.sections.footer.element.classList.remove('hidden');
                    this.currentSection = 'footer';
                }
            });
            
            // Click handling for desktop
            button.addEventListener('click', (e) => {
                if (e.pointerType === 'mouse') {
                    audioPlayer.src = mixItem.getAttribute('data-src');
                    audioPlayer.play().catch(() => {});
                    this.sections.footer.element.classList.remove('hidden');
                    this.currentSection = 'footer';
                }
            });
        });
        
        // Add media session API support
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => audioPlayer.play());
            navigator.mediaSession.setActionHandler('pause', () => audioPlayer.pause());
        }
    }
    
    enableMixesSection() {
        this.sections.mixes.element.classList.add('visible');
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

document.addEventListener('DOMContentLoaded', () => {
    try {
        const siteManager = new SiteSectionManager();
    } catch (error) {
        console.error('Failed to initialize site manager:', error);
    }
});