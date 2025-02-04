class SectionManager {
    constructor() {
        console.log('🎛️ Faint Flicker to Inventory Lighting');
        
        // Define sections
        this.sections = [
            { name: 'hero', element: document.getElementById('hero-section') },
            { name: 'info', element: document.getElementById('info-section') },
            { name: 'mixes', element: document.getElementById('mix-section') }
        ];
        
        // Current section tracking
        this.currentSection = null;
        
        // Navigation order
        this.sectionOrder = ['hero', 'info', 'mixes'];
        
        // Track if initial navigation has completed
        this.initialNavigationComplete = false;
        
        // State for audio and other interactions
        this.state = {
            audioPlaying: false
        };
        
        this.initializeManager();
    }

    initializeManager() {
        console.log('🎉 Timid Trickle to Nav Systems');
        
        // Disable default scroll restoration
        history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);

        // Setup intersection observation
        this.setupIntersectionObserver();
        
        // Setup navigation and interaction methods
        this.setupNavigationListeners();
        this.setupAudioPlayer();
        this.setupCountdown();
        this.setupFooterVisibility();
        
        // New viewport logging setup
        this.setupViewportLogging();
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
            
            console.group('🖥️ Bass Station Dimensions');
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

        // Add event listener to log changes
        window.addEventListener('resize', () => {
            console.log('📏 Wormhole Reshaping Station Dimensions');
            logViewportDetails();
        });
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5  // Trigger when 50% of section is visible
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionName = entry.target.id.replace('-section', '');
                    this.updateCurrentSection(sectionName);
                }
            });
        }, options);

        // Observe all sections
        this.sections.forEach(section => {
            this.intersectionObserver.observe(section.element);
        });
        
        console.log('🔍 Dismal Drip to Ship Sensors');
    }

    updateCurrentSection(sectionName) {
        if (this.currentSection !== sectionName) {
            console.log(`🚦 Sector Switch: ${this.currentSection || 'None'} → ${sectionName}`);
            this.currentSection = sectionName;
            
            // Dispatch a custom event for section change
            const event = new CustomEvent('sectionchange', { 
                detail: { section: sectionName } 
            });
            document.dispatchEvent(event);
        }
    }

    setupNavigationListeners() {
        const navigationTriggers = [
            { type: 'click', elements: [
                this.sections.find(section => section.name === 'hero').element, 
                document.querySelector('.past-voyages')
            ]},
            { type: 'keyboard', keys: ['ArrowDown', 'Space'] },
            { type: 'wheel', threshold: 300 },
            { type: 'touch', sensitivity: 50 }
        ];

        navigationTriggers.forEach(trigger => {
            switch (trigger.type) {
                case 'click':
                    trigger.elements.forEach(el => {
                        el.addEventListener('click', () => {
                            console.log(`🖱️ AutoPilot Engaged via Click`);
                            this.navigateToNextSection();
                        });
                    });
                    break;

                case 'keyboard':
                    document.addEventListener('keydown', (e) => {
                        if (trigger.keys.includes(e.key) || trigger.keys.includes(e.code)) {
                            e.preventDefault();
                            if (!this.initialNavigationComplete) {
                                console.log(`⌨️ AutoPilot Engaged via Key`);
                                this.navigateToNextSection();
                            } else {
                                console.log(`⌨️ AutoPilot Denied`);
                            }
                        }
                    });
                    break;

                case 'wheel':
                    let lastScrollTime = 0;
                    document.addEventListener('wheel', (e) => {
                        const currentTime = new Date().getTime();
                        
                        if (e.deltaY > 0 && currentTime - lastScrollTime > trigger.threshold) {
                            if (!this.initialNavigationComplete) {
                                lastScrollTime = currentTime;
                                console.log('🖱️ AutoPilot Engaged via Scroll');
                                this.navigateToNextSection();
                            } else {
                                console.log('🖱️ AutoPilot Denied');
                            }
                        }
                    }, { passive: true });
                    break;

                case 'touch':
                    let touchStartY = 0;
                    
                    document.addEventListener('touchstart', (e) => {
                        touchStartY = e.touches[0].clientY;
                    }, { passive: true });
            
                    document.addEventListener('touchend', (e) => {
                        const touchEndY = e.changedTouches[0].clientY;
                        const touchDiff = touchStartY - touchEndY;
                        
                        if (Math.abs(touchDiff) > trigger.sensitivity && touchDiff > 0) {
                            if (!this.initialNavigationComplete) {
                                console.log('👆 AutoPilot Engaged via Swipe');
                                this.navigateToNextSection();
                            } else {
                                console.log('👆 AutoPilot Denied');
                            }
                        }
                    });
                    break;
            }
        });

        console.log('🧭 Pitiful Pinch to Pilot Controls');
    }

    navigateToNextSection() {
        const currentIndex = this.sectionOrder.indexOf(this.currentSection);
        const nextIndex = currentIndex + 1;

        if (nextIndex < this.sectionOrder.length) {
            const nextSection = this.sectionOrder[nextIndex];
            console.log(`🧭 Plotting Navigation: ${this.currentSection} → ${nextSection}`);
            this.navigateToSection(nextSection);

            // Mark initial navigation as complete when reaching mixes section  SMALL PROBLEM HERE AS YOU CAN RETRIGGER THIS BY SCROLLING BACK UP THEN BACK DOWN, SHOULD POSSIBLY BE TIED TO FOOTER BECOMING VISIBLE, NOT
            if (nextSection === 'mixes') {
                this.initialNavigationComplete = true;
                console.log('🏁 Destination Reached - AutoPilot Resting');
            }
        }
    }

    navigateToSection(sectionName) {
        console.log(`🚦 AutoPiloting to ${sectionName}`);
        const targetSection = this.sections.find(section => section.name === sectionName);
        
        if (targetSection) {
            targetSection.element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    setupFooterVisibility() {
        const footer = document.getElementById('footer-section');
        const mixSection = document.getElementById('mix-section');

        // Function to check footer visibility
        const checkFooterVisibility = () => {
            // Show footer if audio is playing
            if (this.state.audioPlaying) {
                console.log('🔊 Footer Showing: Audio');
                footer.classList.add('visible');
                footer.classList.remove('hidden');
                return;
            }

            // Show footer if user is near the bottom of the mix section
            const mixSectionRect = mixSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (mixSectionRect.bottom - windowHeight <= 200) {
                console.log('📍 Footer Showing: Position');
                footer.classList.add('visible');
                footer.classList.remove('hidden');
            } else {
                console.log('📍 Footer Hidden');
                footer.classList.remove('visible');
                footer.classList.add('hidden');
            }
        };

        // Add event listeners
        window.addEventListener('scroll', checkFooterVisibility);
        
        // Initial check
        checkFooterVisibility();

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
                console.log('🎉 International Bass Station is Live!');
                countdownElement.innerHTML = `<a href="https://northumberland897.ca" target="_blank" rel="noopener noreferrer" class="bass-station-active"><span class="glitch" data-text="BASS STATION ACTIVE">BASS STATION ACTIVE</span></a>`;
                broadcastTitleElement.classList.add('broadcast-live');
                return;
            }
    
            // Find next Friday at 10 PM
            const nextFriday = new Date(now);
            nextFriday.setDate(nextFriday.getDate() + ((7 - currentDay + 5) % 7));
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

        console.log('⏰ Galaxy Timezone Calibrated');
    }

    setupAudioPlayer() {
        const mixItems = document.querySelectorAll('.mix-item');
        const audioPlayer = document.getElementById('mixPlayer');
        const footer = document.getElementById('footer-section');
        
        mixItems.forEach(mixItem => {
            mixItem.addEventListener('click', () => {
                console.log(`🎵 Queueing Mix: ${mixItem.textContent.trim()}`);
                audioPlayer.src = mixItem.getAttribute('data-src');
                audioPlayer.play()
                    .then(() => {
                        console.log('🎶 Subwoofers Firing');
                        this.state.audioPlaying = true;
                        this.setupFooterVisibility();
                    })
                    .catch(error => {
                        console.error('🚨 Audio Error:', error);
                        footer.querySelector('.audio-player-container').classList.add('error');
                    });
            });
        });

        audioPlayer.addEventListener('play', () => {
            console.log('▶️ Audio: Playback started');
            this.state.audioPlaying = true;
            this.setupFooterVisibility();
        });

        audioPlayer.addEventListener('pause', () => {
            console.log('⏸️ Audio: Playback paused');
            this.state.audioPlaying = false;
            this.setupFooterVisibility();
        });

        audioPlayer.addEventListener('ended', () => {
            console.log('🏁 Audio: Mix playback completed');
            this.state.audioPlaying = false;
            this.setupFooterVisibility();
        });

        console.log('🎧 Vast, Vast Majority to Subwoofers');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🌐 BOOTUP POWER ALLOCATION:');
        const siteManager = new SectionManager();
        console.log('🚀 BEGIN BASS BROADCAST');
    } catch (error) {
        console.error('🚨 Launch Failed:', error);
    }
});