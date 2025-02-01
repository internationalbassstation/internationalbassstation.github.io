class SectionStateObserver {
    constructor() {
        this.currentSection = null;
        this.observers = [];
        console.log('SectionObserver initialized');
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    updateSection(newSection) {
        console.log(`Attempting section update to: ${newSection}`);
        if (this.currentSection !== newSection) {
            console.log(`SECTIONCHANGE: ${this.currentSection} to ${newSection}`);
            this.currentSection = newSection;
            
            this.observers.forEach(observer => {
                console.log('Updating SectionObserver');
                if (typeof observer.onSectionChange === 'function') {
                    observer.onSectionChange(newSection);
                }
            });
        }
    }
}

class SectionManager {
    constructor() {
        console.log('SectionManager initialized');
        
        this.sectionStateObserver = new SectionStateObserver();
        
        // Add a default logging observer
        this.sectionStateObserver.addObserver({
            onSectionChange: (section) => {
                console.log(`SECTIONCHANGE complete: ${section}`);
            }
        });

        this.sections = {
            hero: {
                element: document.getElementById('hero-section'),
                nextSection: 'info'
            },
            info: {
                element: document.getElementById('info-section'),
                nextSection: 'mixes'
            },
            mixes: {
                element: document.getElementById('mix-section'),
                nextSection: 'footer'
            },
            footer: {
                element: document.getElementById('footer-section'),
                nextSection: null
            }
        };
        this.state = {
            audioPlaying: false
        };
        
        // Initialize with hero section
        this.sectionStateObserver.updateSection('hero');
        
        this.initialize();
    }

    initialize() {
        history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);

        this.setupViewportLogging();
        this.setupNavigationListeners();
        this.setupAudioPlayer();
        this.setupCountdown();
        this.handleScroll = this.handleScroll.bind(this);
        window.addEventListener('scroll', this.handleScroll);
    }

    setupViewportLogging() {
        const logViewportDetails = () => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const documentWidth = document.documentElement.clientWidth;
            const documentHeight = document.documentElement.clientHeight;
            const orientation = viewportWidth > viewportHeight ? 'Landscape' : 'Portrait';
            const aspectRatio = (viewportWidth / viewportHeight).toFixed(2);
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            
            console.group('🖥️ Viewport Details');
            console.log(`Width: ${viewportWidth}px (${(viewportWidth / rootFontSize).toFixed(2)}rem)`);
            console.log(`Height: ${viewportHeight}px (${(viewportHeight / rootFontSize).toFixed(2)}rem)`);
            console.log(`Document Width: ${documentWidth}px`);
            console.log(`Document Height: ${documentHeight}px`);
            console.log(`Root Font Size: ${rootFontSize}px`);
            console.log(`Orientation: ${orientation}`);
            console.log(`Aspect Ratio: ${aspectRatio}`);
            console.groupEnd();
        };
        // Log initial viewport details
        logViewportDetails();
        // Add event listeners to track changes
        window.addEventListener('resize', () => {
            logViewportDetails();
        });
        // Track orientation changes
        window.addEventListener('orientationchange', () => {
            logViewportDetails();
        });
    }
 
    handleScroll() {
        const scrollPosition = window.scrollY + window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const footer = this.sections.footer.element;
        if (scrollPosition > documentHeight - 100) {
            footer.classList.add('visible');
            footer.classList.remove('hidden');
        } else if (!this.state.audioPlaying) {
            footer.classList.remove('visible');
            footer.classList.add('hidden');
        }
    }
 
    setupNavigationListeners() {
        this.sections.hero.element.addEventListener('click', () => {
            console.log('Hero section clicked');
            this.navigateToNextSection();
        });
        const pastVoyages = document.querySelector('.past-voyages');
        pastVoyages.addEventListener('click', () => {
            console.log('Past Voyages clicked');
            this.navigateToNextSection();
        });
 
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.code === 'Space') {
                e.preventDefault();
                console.log('Navigating via keyboard');
                this.navigateToNextSection();
            }
        });

        let lastScrollTime = 0;
        const scrollThreshold = 300;
        document.addEventListener('wheel', (e) => {
            const currentTime = new Date().getTime();
            
            if (e.deltaY > 0 && currentTime - lastScrollTime > scrollThreshold) {
                lastScrollTime = currentTime;
                console.log('Navigating via wheel');
                this.navigateToNextSection();
            }
        }, { passive: true });

        let touchStartY = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
 
        document.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const touchDiff = touchStartY - touchEndY;
            
            if (Math.abs(touchDiff) > 50 && touchDiff > 0) {
                console.log('Navigating via touch');
                this.navigateToNextSection();
            }
        });
    }

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
                
                this.state.audioPlaying = true;
 
                footer.classList.add('visible');
                footer.classList.remove('hidden');
                this.navigateToSection('footer');
            });
        });
    }

    setupCountdown() {
        const countdownElement = document.getElementById('countdown');
        const broadcastTitleElement = document.querySelector('.broadcast-title h2:last-child');
    
        function updateCountdown() {
            const now = new Date();
            const currentDay = now.getDay();
            const currentHour = now.getHours();
    
            // Check if it's Friday between 10 PM and 11 PM
            if (currentDay === 5 && currentHour >= 22 && currentHour < 23) {
                // Add a subtle pulsing animation to the broadcast title
                countdownElement.innerHTML = `<a href="https://northumberland897.ca" target="_blank" rel="noopener noreferrer" class="bass-station-active"><span class="glitch" data-text="BASS STATION ACTIVE">BASS STATION ACTIVE</span></a>`;
                broadcastTitleElement.classList.add('broadcast-live');
                return;
            }
    
            // Find next Friday at 10 PM
            const nextFriday = new Date(now);
    
            // If today is Friday and it's past 10 PM, move to next Friday
            if (currentDay === 5 && currentHour >= 22) {
                nextFriday.setDate(nextFriday.getDate() + 7);
            } else {
                nextFriday.setDate(nextFriday.getDate() + ((7 - currentDay + 5) % 7));
            }
    
            nextFriday.setHours(22, 0, 0, 0);
    
            // Calculate difference
            const diff = nextFriday - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
            countdownElement.textContent = `${days}D ${hours}H ${minutes}M ${seconds}S`;
        }
    
        // Update immediately and then every second
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    navigateToNextSection() {
        console.log('Navigating to next section');
        
        // Use the current section from the state observer
        const currentSection = this.sectionStateObserver.currentSection;
        const nextSection = this.sections[currentSection]?.nextSection;
        
        if (nextSection) {
            console.log(`Current section: ${currentSection}, Next section: ${nextSection}`);
            this.navigateToSection(nextSection);
        }
    }

    navigateToSection(sectionName) {
        console.log(`Navigating to section: ${sectionName}`);
        const targetSection = this.sections[sectionName];
        if (!targetSection) return;
 
        // Update the state observer
        this.sectionStateObserver.updateSection(sectionName);

        targetSection.element.classList.add('visible');
        targetSection.element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        const siteManager = new SectionManager();
    } catch (error) {
        console.error('Failed to initialize site manager:', error);
    }
});