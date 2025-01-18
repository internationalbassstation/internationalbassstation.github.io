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
            rate: 25,
            interactionIncrement: 15
        };
        
        this.interactionState = {
            startY: 0,
            lastInteractionTime: 0,
            isTouching: false,
            cooldownPeriod: 200,
            interactionThreshold: 10
        };

        this.touchState = {
            lastTouchTime: 0,
            touchDelay: 300,
            startY: 0,
            startX: 0,
            minSwipeDistance: 50,
            isScrolling: false
        };
        
        this.initialize();
    }
    
    initialize() {
        history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        
        this.setupEventListeners();
        this.startCountdownTimer();
    }

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
        
        // Determine if this is a deliberate vertical swipe
        if (Math.abs(deltaY) > Math.abs(deltaX) && 
            Math.abs(deltaY) > this.touchState.minSwipeDistance) {
            this.touchState.lastTouchTime = now;
            this.touchState.isScrolling = true;
            return true;
        }
        
        return false;
    }
    
    setupEventListeners() {
        // Handle hero section scrolling
        this.sections.hero.element.addEventListener('wheel', (e) => {
            if (this.currentSection === 'hero' && e.deltaY > 0) {
                e.preventDefault();
                this.handleHeroScroll();
            }
        }, { passive: false });

        // Handle hero section touch events
        this.sections.hero.element.addEventListener('touchstart', (e) => {
            if (this.currentSection === 'hero') {
                this.handleTouchEvent(e, 'start');
            }
        }, { passive: true });

        this.sections.hero.element.addEventListener('touchmove', (e) => {
            if (this.currentSection === 'hero' && 
                this.handleTouchEvent(e, 'move')) {
                e.preventDefault();
                this.handleHeroScroll();
            }
        }, { passive: false });

        // Universal click handler for hero section
        this.sections.hero.element.addEventListener('click', () => {
            if (this.currentSection === 'hero') {
                this.handleHeroScroll();
            }
        });

        // Handle all types of interactions in info section
        this.setupInfoSectionInteractions();

        // Setup Past Voyages interactions
        this.setupPastVoyagesInteractions();
        
        // Setup audio player controls
        this.setupAudioControls();
        
        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseProgressTimer();
            } else if (this.currentSection === 'info' && !this.sections.info.isComplete) {
                this.startProgressTimer();
            }
        });

        // Handle scrolling after info section is complete
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY + window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            if (scrollPosition >= documentHeight - 50) {
                this.sections.footer.element.classList.remove('hidden');
                this.currentSection = 'footer';
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
                // Reset transform after transition
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
            // Reset transform after transition
            setTimeout(() => {
                pastVoyages.style.transition = 'none';
                pastVoyages.style.transform = 'none';
            }, 800);
        }, 400);
    }
    
    setupInfoSectionInteractions() {
        const infoSection = this.sections.info.element;
        
        infoSection.addEventListener('touchstart', (e) => {
            if (this.currentSection === 'info' && !this.sections.info.isComplete) {
                this.handleTouchEvent(e, 'start');
            }
        }, { passive: true });
        
        infoSection.addEventListener('touchmove', (e) => {
            if (!this.sections.info.isComplete && 
                this.handleTouchEvent(e, 'move')) {
                this.handleInteraction(true);
            }
        }, { passive: true });
        
        infoSection.addEventListener('touchend', () => {
            this.interactionState.isTouching = false;
        });
        
        // Mouse wheel
        infoSection.addEventListener('wheel', (e) => {
            if (this.currentSection === 'info' && !this.sections.info.isComplete) {
                e.preventDefault();
                this.handleInteraction(e.deltaY > 0);
            }
        }, { passive: false });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.currentSection === 'info' && !this.sections.info.isComplete) {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.handleInteraction(e.key === 'ArrowDown');
                }
            }
        });
    }

    setupPastVoyagesInteractions() {
        const pastVoyages = document.querySelector('.past-voyages');
        let touchStartTime = 0;
        let touchStartY = 0;
        let isLongPress = false;
        const longPressThreshold = 500; // ms

        // Touch events
        pastVoyages.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartY = e.touches[0].clientY;
            isLongPress = false;

            // Set a timer for long press
            setTimeout(() => {
                isLongPress = true;
            }, longPressThreshold);
        }, { passive: true });

        pastVoyages.addEventListener('touchend', (e) => {
            const touchDuration = Date.now() - touchStartTime;
            const touchEndY = e.changedTouches[0].clientY;
            const touchDistance = Math.abs(touchEndY - touchStartY);

            // Only trigger if it was a deliberate press and not a scroll attempt
            if (!isLongPress && touchDistance < 10) {
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
    
    handleInteraction(isForward) {
        const now = Date.now();
        if (now - this.interactionState.lastInteractionTime < this.interactionState.cooldownPeriod) {
            return;
        }
        
        // Check if we're on mobile
        const isMobile = window.innerWidth <= 768;
        
        if (isForward && !this.sections.info.isComplete) {
            // Use smaller increment on mobile
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
                
                // Only play if it was a short tap and not a scroll
                if (touchDuration < 200 && !isTouchMove) {
                    audioPlayer.src = mixItem.getAttribute('data-src');
                    audioPlayer.play().catch(() => {});
                    this.sections.footer.element.classList.remove('hidden');
                    this.currentSection = 'footer';
                }
            });
            
            // Keep the click handler for desktop
            button.addEventListener('click', (e) => {
                if (e.pointerType === 'mouse') {
                    audioPlayer.src = mixItem.getAttribute('data-src');
                    audioPlayer.play().catch(() => {});
                    this.sections.footer.element.classList.remove('hidden');
                    this.currentSection = 'footer';
                }
            });
        });
        
        // Add media session API support for better mobile controls
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