class SectionManager {
    constructor() {
// DEFINE SECTIONS
        this.sections = {
            hero: {
                element: document.getElementById('hero-container'),
                nextSection: 'info',
            },
            info: {
                element: document.querySelector('.info-container'),
                nextSection: 'mixes',
            },
            mixes: {
                element: document.querySelector('.mix-container'),
                nextSection: 'footer',
            },
            footer: {
                element: document.querySelector('.site-footer'),
                nextSection: null,
            }
        };
// START AT HERO
        this.state = {
            currentSection: 'hero',
            isAudioPlaying: false
        };
// PREPARE FUNCTION
        this.initialize();
    }
// INITIALIZE STRUCTURE
    initialize() {
// FORCE PAGE TO TOP
        history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);    
// PREPARE SCRIPTS
        this.setupNavigationListeners();
        this.setupInitialVisibility();
        this.setupAudioPlayer();
        this.setupCountdown();
        this.handleScroll = this.handleScroll.bind(this);
        window.addEventListener('scroll', this.handleScroll);
    }
// SET UP INVISIBILITY
    setupInitialVisibility() {
// HIDE ALL BUT HERO SCREEN
        Object.keys(this.sections).forEach(sectionName => {
            if (sectionName !== 'hero') {
                this.sections[sectionName].element.classList.remove('visible');
                if (sectionName === 'footer') {
                    this.sections[sectionName].element.classList.add('hidden');
                }
            }
        });
    }
// SET UP LISTENERS


    // HANDLE SCROLL EVENTS

    handleScroll() {

        // Get scroll position

        const scrollPosition = window.scrollY + window.innerHeight;

        const documentHeight = document.documentElement.scrollHeight;

        

        // Show footer if near bottom (within 100px)

        const footer = this.sections.footer.element;

        if (scrollPosition > documentHeight - 100) {

            footer.classList.add('visible');

            footer.classList.remove('hidden');

        } else if (!this.state.isAudioPlaying) {

            // Only hide if we're not playing audio

            footer.classList.remove('visible');

            footer.classList.add('hidden');

        }

    }


    setupNavigationListeners() {
// CLICK (update for past voyages, only for hero right now)
        this.sections.hero.element.addEventListener('click', () => {
            if (this.state.currentSection === 'hero') {
                this.navigateToNextSection();
            }
        });
// KEYBOARD
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.code === 'Space') {
                e.preventDefault();
                this.navigateToNextSection();
            }
        });
// SCROLL
        let lastScrollTime = 0;
        const scrollThreshold = 500; // Minimum time between scroll triggers in ms

        document.addEventListener('wheel', (e) => {
            const currentTime = new Date().getTime();
            
            if (e.deltaY > 0 && // Scrolling down
                currentTime - lastScrollTime > scrollThreshold) { // Throttle scroll events
                
                lastScrollTime = currentTime;
                this.navigateToNextSection();
            }
        }, { passive: true });
// TAP + SWIPE
        let touchStartY = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const touchDiff = touchStartY - touchEndY;
            
            if (Math.abs(touchDiff) > 50 && touchDiff > 0) { // Swipe up
                this.navigateToNextSection();
            }
        });
    }
// SET UP AUDIO PLAYER
    setupAudioPlayer() {
        const mixItems = document.querySelectorAll('.mix-item');
        const audioPlayer = document.getElementById('mixPlayer');
        const footer = this.sections.footer.element;

        mixItems.forEach(mixItem => {
            mixItem.addEventListener('click', () => {
                audioPlayer.src = mixItem.getAttribute('data-src');
                audioPlayer.play().catch(error => {
                    console.error('Error playing audio:', error);
                    footer.querySelector('.audio-player-container').classList.add('error');
                });
                
                this.state.isAudioPlaying = true;

                footer.classList.add('visible');
                footer.classList.remove('hidden');
                this.navigateToSection('footer');
            });
        });
    }
// SET UP COUNTDOWN
        setupCountdown() {
            const countdownElement = document.getElementById('countdown');
            function updateCountdown() {
                const now = new Date();
                const estOffset = -5; // EST offset from UTC
                // Convert current time to EST
                const estTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (estOffset * 3600000));
                // Find next Friday 10 PM
                const nextFriday = new Date(estTime);
                nextFriday.setDate(nextFriday.getDate() + ((7 - nextFriday.getDay() + 5) % 7)); // Get to Friday
                nextFriday.setHours(22, 0, 0, 0); // Set to 10 PM
                // If it's already past Friday 10 PM, move to next week
                if (estTime > nextFriday) {
                    nextFriday.setDate(nextFriday.getDate() + 7);
                }
                // Calculate difference
                const diff = nextFriday - estTime;
                // Convert to days, hours, minutes, seconds
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                // Update countdown display
                countdownElement.textContent = `${days}D ${hours}H ${minutes}M ${seconds}S`;
            }
            // Update immediately and then every second
            updateCountdown();
            setInterval(updateCountdown, 1000);
        }
// SCRIPT TO SCROLL AUTOMATICALLY
    navigateToNextSection() {
        const currentSection = this.sections[this.state.currentSection];
        if (currentSection && currentSection.nextSection) {
            this.navigateToSection(currentSection.nextSection);
        }
    }
    navigateToSection(sectionName) {
        const targetSection = this.sections[sectionName];
        if (!targetSection) return;
// UPDATE CURRENT SECTION
        this.state.currentSection = sectionName;
// ADD VISIBILITY
        targetSection.element.classList.add('visible');
// SCROLL TO SECTION
        targetSection.element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}
// FUNCTION TO ENSURE SITE IS LOADED BEFORE DISPLAY
document.addEventListener('DOMContentLoaded', () => {
    try {
        const siteManager = new SectionManager();
    } catch (error) {
        console.error('Failed to initialize site manager:', error);
    }
});