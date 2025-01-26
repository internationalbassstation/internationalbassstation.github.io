class SectionManager {
    constructor() {
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
 
        this.initialize();
    }
 
    initialize() {
        history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);    
 
        this.setupNavigationListeners();
        this.setupInitialVisibility();
        this.setupAudioPlayer();
        this.setupCountdown();
        this.handleScroll = this.handleScroll.bind(this);
        window.addEventListener('scroll', this.handleScroll);
    }
 
    setupInitialVisibility() {
        Object.keys(this.sections).forEach(sectionName => {
            if (sectionName !== 'hero') {
                this.sections[sectionName].element.classList.remove('visible');
                if (sectionName === 'footer') {
                    this.sections[sectionName].element.classList.add('hidden');
                }
            }
        });
    }
 
    handleScroll() {
        const scrollPosition = window.scrollY + window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const footer = this.sections.footer.element;
        if (scrollPosition > documentHeight - 100) {
            footer.classList.add('visible');
            footer.classList.remove('hidden');
        } else if (!this.state.isAudioPlaying) {
            footer.classList.remove('visible');
            footer.classList.add('hidden');
        }
    }
 
    setupNavigationListeners() {
        this.sections.hero.element.addEventListener('click', () => {
            if (this.state.currentSection === 'hero') {
                this.navigateToNextSection();
            }
        });
        const pastVoyages = document.querySelector('.past-voyages');
        pastVoyages.addEventListener('click', () => {
            if (this.state.currentSection === 'info') {
                this.navigateToNextSection();
            }
        });
        pastVoyages.style.cursor = 'pointer';
 
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.code === 'Space') {
                e.preventDefault();
                this.navigateToNextSection();
            }
        });
 
        let lastScrollTime = 0;
        const scrollThreshold = 500;
        document.addEventListener('wheel', (e) => {
            const currentTime = new Date().getTime();
            
            if (e.deltaY > 0 && currentTime - lastScrollTime > scrollThreshold) {
                lastScrollTime = currentTime;
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
                
                this.state.isAudioPlaying = true;
 
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
        const currentSection = this.sections[this.state.currentSection];
        if (currentSection && currentSection.nextSection) {
            this.navigateToSection(currentSection.nextSection);
        }
    }
 
    navigateToSection(sectionName) {
        const targetSection = this.sections[sectionName];
        if (!targetSection) return;
 
        this.state.currentSection = sectionName;
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