class SiteSectionManager {
    constructor() {
        // Define the main sections of the site and their relationships
        this.sections = {
            hero: {
                element: document.getElementById('hero-container'),
                nextSection: 'info'
            },
            info: {
                element: document.querySelector('.info-container'),
                nextSection: 'mixes',
                isComplete: false
            },
            mixes: {
                element: document.querySelector('.mixes-container'),
                nextSection: 'footer'
            },
            footer: {
                element: document.querySelector('.site-footer'),
                nextSection: null
            }
        };

        this.state = {
            currentSection: 'hero',         // Track the current section being viewed
            progress: {        // Progress state for the info section's reveal animation
                current: 0,
                max: 100,
                rate: 25,  // Base rate of progress increase
                interactionIncrement: 20, // How much progress increases per interaction
                isComplete: false
            },
            touchState: {         // Specific touch event handling state
                lastTouchTime: 0,
                touchDelay: 300,  // Minimum time between touch events
                startY: 0,
                startX: 0,
                minSwipeDistance: 50,  // Minimum distance for a swipe
                isScrolling: false
            },
            interactionState: {  // State management for user interactions
                startY: 0,
                lastInteractionTime: 0,
                isTouching: false,
                cooldownPeriod: 200,  // Prevents rapid-fire interactions
                interactionThreshold: 10 // Minimum distance for touch interactions
            }
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

    handleTouchEvent(e, eventType) {
        const now = Date.now();

        if (eventType === 'start') {
            this.state.touchState.startY = e.touches[0].clientY;
            this.state.touchState.startX = e.touches[0].clientX;
            this.state.touchState.isScrolling = false;
            return true;
        }

        if (now - this.state.touchState.lastTouchTime < this.state.touchState.touchDelay) {      // Prevent rapid touch events
            return false;
        }

        const deltaY = this.state.touchState.startY - e.touches[0].clientY;
        const deltaX = this.state.touchState.startX - e.touches[0].clientX;

        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > this.state.touchState.minSwipeDistance) {  // Only trigger for vertical swipes
            this.state.touchState.lastTouchTime = now;
            this.state.touchState.isScrolling = true;
            return true;
        }

        return false;
    }

    setupEventListeners() {
        this.setupHeroListeners();
        this.setupInfoSectionListeners();
        this.setupPastVoyagesListeners();
        this.setupAudioControls();

        document.addEventListener('visibilitychange', () => {  // Handle tab/window visibility changes
            if (document.hidden) {
                this.pauseProgressTimer();
            } else if (this.state.currentSection === 'info' && !this.sections.info.isComplete) {
                this.startProgressTimer();
            }
        });

        window.addEventListener('scroll', () => {         // Add scroll detection for footer reveal
            const scrollPosition = window.scrollY + window.innerHeight; 
            const documentHeight = document.documentElement.scrollHeight;

            if (scrollPosition >= documentHeight - 50) {
                this.state.currentSection = 'footer';
                this.sections.footer.element.classList.remove('hidden');       // Show footer when near bottom of page
            }
        });
    }

    setupHeroListeners() {
        const heroElement = this.sections.hero.element;

        heroElement.addEventListener('wheel', (e) => {       // Handle mouse wheel on hero
            if (this.state.currentSection === 'hero' && e.deltaY > 0) {
                e.preventDefault();
                this.handleHeroScroll();
            }
        }, { passive: false });

        heroElement.addEventListener('touchstart', (e) => {     // Handle touch events on hero
            if (this.state.currentSection === 'hero') {
                this.handleTouchEvent(e, 'start');
            }
        }, { passive: true });

        heroElement.addEventListener('touchmove', (e) => {
            if (this.state.currentSection === 'hero' && this.handleTouchEvent(e, 'move')) {
                e.preventDefault();
                this.handleHeroScroll();
            }
        }, { passive: false });

        heroElement.addEventListener('click', () => {     // Handle clicks on hero
            if (this.state.currentSection === 'hero') {
                this.handleHeroScroll();
            }
        });
    }

    setupInfoSectionListeners() {
        const infoSection = this.sections.info.element;
        let isAtInfoBottom = false;
        let scrollTimeout;

        const checkInfoBottom = () => {     // Function to check if we're at the bottom of info section
            const infoRect = infoSection.getBoundingClientRect();
            const tolerance = 5;
            return infoRect.bottom <= window.innerHeight + tolerance;
        };

        const handleScroll = (e) => {   // Prevent default scroll when at info bottom
            if (this.state.currentSection === 'info') {
                if (isAtInfoBottom && e.deltaY > 0) {
                    e.preventDefault();
                    this.handlePastVoyagesTransition();
                } else if (!this.sections.info.isComplete) {
                    this.handleInteraction(e.deltaY > 0);
                }
            }
        };

        const updateScrollState = () => {      // Update isAtInfoBottom state
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (this.state.currentSection === 'info') {
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

        window.addEventListener('scroll', updateScrollState, { passive: true });     // Add scroll event listeners
        infoSection.addEventListener('wheel', handleScroll, { passive: false });

        infoSection.addEventListener('touchstart', (e) => {    // Touch events for info section
            if (this.state.currentSection === 'info') {
                this.handleTouchEvent(e, 'start');
            }
        }, { passive: true });

        infoSection.addEventListener('touchmove', (e) => {
            if (this.state.currentSection === 'info') {
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

        const observer = new MutationObserver((mutations) => {   // Update isAtInfoBottom when content becomes visible
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

    handleHeroScroll() {
        if (this.state.currentSection === 'hero') {
            const heroBackground = this.sections.hero.element.querySelector('.hero__background');
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

    handlePastVoyagesTransition() { // Update handlePastVoyagesTransition() to ensure smooth transition
        const pastVoyages = document.querySelector('.past-voyages');
        const mixesSection = this.sections.mixes.element;

        pastVoyages.style.transition = 'transform 0.8s ease-out';
        pastVoyages.style.transform = 'scale(1.05)';

        mixesSection.style.opacity = '0';    // Ensure mixes section is ready for smooth scroll
        mixesSection.classList.add('visible');

        setTimeout(() => {        // Reset info section constraints
            this.sections.info.element.style.height = '';
            this.sections.info.element.style.overflow = '';

            mixesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });  // Smooth scroll to mixes section
            this.state.currentSection = 'mixes';

            setTimeout(() => {      // Fade in mixes section
                mixesSection.style.opacity = '1';

                pastVoyages.style.transition = 'none';       // Reset past voyages transform
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

        pastVoyages.addEventListener('touchstart', (e) => {         // Touch events for Past Voyages section
            touchConfig.startTime = Date.now();
            touchConfig.startY = e.touches[0].clientY;
        }, { passive: true });

        pastVoyages.addEventListener('touchend', (e) => {    // Click event for desktop
            const touchDuration = Date.now() - touchConfig.startTime;
            const touchEndY = e.changedTouches[0].clientY;
            const touchDistance = Math.abs(touchEndY - touchConfig.startY);

            if (touchDuration < touchConfig.longPressThreshold && touchDistance < touchConfig.moveThreshold) {
                this.handlePastVoyagesTransition();
            }
        });

        pastVoyages.addEventListener('click', () => {
            this.handlePastVoyagesTransition();
        });
    }

    handleInteraction(isForward) {
        const now = Date.now();
        if (now - this.state.interactionState.lastInteractionTime < this.state.interactionState.cooldownPeriod) {
            return;
        }

        const isMobile = window.innerWidth <= 768;

        if (isForward && !this.sections.info.isComplete) {
            const increment = isMobile ?
                this.state.progress.interactionIncrement / 2 :
                this.state.progress.interactionIncrement;

            this.updateProgress(this.state.progress.current + increment);
        }
        this.state.interactionState.lastInteractionTime = now;
    }

    proceedToSection(sectionName) {
        const section = this.sections[sectionName];
        if (!section) return;

        section.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.state.currentSection = sectionName;

        if (sectionName === 'info') {
            this.startProgressTimer();
        } else if (sectionName === 'mixes') {
            this.enableMixesSection();
        } else if (sectionName === 'footer') {
            this.sections.footer.element.classList.remove('hidden');
        }
    }

    updateProgress(newProgress) {
        this.state.progress.current = Math.min(newProgress, this.state.progress.max);

        const infoRows = document.querySelectorAll('.grid-row');
        const rowsToShow = Math.floor((this.state.progress.current / this.state.progress.max) * infoRows.length);

        infoRows.forEach((row, index) => {
            if (index < rowsToShow) {
                row.classList.add('visible');
            }
        });

        if (this.state.progress.current >= this.state.progress.max) {
            this.sections.info.isComplete = true;
            this.enableMixesSection();
        }
    }

    startProgressTimer() {
        if (this._progressTimer) return;

        this._progressTimer = setInterval(() => {
            if (this.state.progress.current < this.state.progress.max) {
                this.updateProgress(this.state.progress.current + this.state.progress.rate / 10);
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

            button.addEventListener('touchstart', (e) => {   // Touch event handling for mix buttons
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
                    this.state.currentSection = 'footer';
                }
            });

            button.addEventListener('click', () => {  // Click handling for desktop
                audioPlayer.src = mixItem.getAttribute('data-src');
                audioPlayer.play().catch(() => {});
                this.sections.footer.element.classList.remove('hidden');
                this.state.currentSection = 'footer';
            });
        });

        if ('mediaSession' in navigator) {    // Add media session API support
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