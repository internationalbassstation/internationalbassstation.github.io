class SectionManager {
    constructor() {
        console.log('⚡ Faint Flicker in Inventory Lighting');
// Define sections
        this.sections = [
            { name: 'hero', element: document.getElementById('hero-section') },
            { name: 'info', element: document.getElementById('info-section') },
            { name: 'mixes', element: document.getElementById('mix-section') }
        ];
        this.currentSection = null;
// Navigation order
        this.sectionOrder = ['hero', 'info', 'mixes'];
// Track if initial navigation has completed
        this.initialNavigationComplete = false;
// Track furthest reached section to prevent loops
        this.furthestReachedIndex = 0;
// State for audio and other interactions
        this.state = {
            audioPlaying: false
        };
        this.initializeManager();
    }

    initializeManager() {
        console.log('📡 Tiny Trickle to Nav Systems');
// Ensure site starts at top
        history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
// Initial setups
        this.setupIntersectionObserver();
        this.setupNavigationListeners();
        this.setupAudioPlayer();
        this.setupCountdown();
        this.setupFooterVisibility();
        this.setupViewportLogging();
    }
// Log viewport size
    setupViewportLogging() { 
        const logViewportDetails = () => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const documentWidth = document.documentElement.clientWidth;
            const documentHeight = document.documentElement.clientHeight;
            const orientation = viewportWidth > viewportHeight ? 'Landscape' : 'Portrait';
            const aspectRatio = (viewportWidth / viewportHeight).toFixed(2);
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            console.group('📏 Station Dimensions');
            console.log(`Height: ${viewportHeight}px (${(viewportHeight / rootFontSize).toFixed(2)}rem)`);
            console.log(`Width: ${viewportWidth}px (${(viewportWidth / rootFontSize).toFixed(2)}rem)`);
            console.log(`Aspect Ratio: ${aspectRatio}`);
            console.log(`Orientation: ${orientation}`);
            console.log(`Document Height: ${documentHeight}px`);
            console.log(`Document Width: ${documentWidth}px`);
            console.log(`Root Font Size: ${rootFontSize}px`);
            console.groupEnd();
        };
        logViewportDetails();
// Listener for viewport resizing
        window.addEventListener('resize', () => {
            console.log('🕳️ Wormhole Reshaping Station Dimensions');
            logViewportDetails();
        });
    }
// Observer to determine user's current section
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionName = entry.target.id.replace('-section', '');
                    this.updateCurrentSection(sectionName);
                }
            });
        }, options);
        this.sections.forEach(section => {
            this.intersectionObserver.observe(section.element);
        });
        console.log('🔍 Dismal Drip for Ship Sensors');
    }
// Function modifying value attribute of current section
    updateCurrentSection(sectionName) {
        if (this.currentSection !== sectionName) {
            console.log(`➡️ Sector Switch: ${this.currentSection || 'None'} → ${sectionName}`);
            this.currentSection = sectionName;
            const event = new CustomEvent('sectionchange', { 
                detail: { section: sectionName } 
            });
            document.dispatchEvent(event);
        }
    }
// Listeners for user inputs
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
                            console.log(`🖱️ AutoPilot Requested via Click`);
                            this.navigateToNextSection();
                        });
                    });
                    break;
                case 'keyboard':
                    document.addEventListener('keydown', (e) => {
                        if (trigger.keys.includes(e.key) || trigger.keys.includes(e.code)) {
                            e.preventDefault();
                            if (!this.initialNavigationComplete) {
                                console.log(`⌨️ AutoPilot Requested via Keystroke`);
                                this.navigateToNextSection();
                            } else {
                                console.log(`⌨️ AutoPilot via Keystroke Denied`);
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
                                console.log('🖱️ AutoPilot Requested via Scroll');
                                this.navigateToNextSection();
                            } else {
                                // console.log('🖱️ AutoPilot via Scroll Denied');
                                return
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
                                console.log('👆 AutoPilot via Swipe Denied');
                            }
                        }
                    });
                    break;
            }
        });
        console.log('🕹️ Pitiful Portion for Pilot Controls');
    }
// Function scripting auto-scroll
    navigateToNextSection() {
        const currentIndex = this.sectionOrder.indexOf(this.currentSection);
        const nextIndex = currentIndex + 1;
// Update furthest reached
        this.furthestReachedIndex = Math.max(this.furthestReachedIndex, currentIndex);
// Only allow forward navigation if we haven't reached this section before
        if (nextIndex < this.sectionOrder.length && currentIndex >= this.furthestReachedIndex) {
            const nextSection = this.sectionOrder[nextIndex];
            console.log(`🗺️ Plotting Navigation: ${this.currentSection} → ${nextSection}`);
            this.navigateToSection(nextSection);
            if (nextSection === 'mixes') {
                this.initialNavigationComplete = true;
                console.log('🏁 Destination Reached - AutoPilot Resting');
            }
        }
    }
// Function scripting auto-scroll (POSSIBLE REDUNDANCY?)
    navigateToSection(sectionName) {
        console.log(`✈️ AutoPiloting to ${sectionName}`);
        const targetSection = this.sections.find(section => section.name === sectionName);
        
        if (targetSection) {
            targetSection.element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
// Countdown logic and element swap
    setupCountdown() {
// Log initial time state
        const userLocalTime = new Date();
        console.log('🌐', Intl.DateTimeFormat().resolvedOptions().timeZone, '-', userLocalTime.toLocaleString());
        const easternTime = new Date().toLocaleString("en-US", {
            timeZone: "America/New_York"
        });
        console.log('🧮Eastern Time:', new Date(easternTime).toLocaleString());
        console.groupEnd();
        function updateCountdown() {
            const countdownElement = document.getElementById('countdown');
// Get current time in Eastern timezone
            const easternTime = new Date().toLocaleString("en-US", {
                timeZone: "America/New_York"
            });
            const now = new Date(easternTime);
            const currentDay = now.getDay();
            const currentHour = now.getHours();
// Check if it's Friday between 10 PM and 11 PM ET
            if (currentDay === 5 && currentHour >= 22 && currentHour < 23) {
                countdownElement.innerHTML = `
                    <a href="https://northumberland897.ca" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="digital-glitch">
                        BASS STATION ACTIVE
                    </a>`;
                return;
            }
// Find next Friday at 10 PM ET
            const nextFriday = new Date(easternTime);
            if (currentDay === 5 && currentHour >= 23) {
// If it's Friday after 11 PM, target next week's Friday
                nextFriday.setDate(nextFriday.getDate() + 7);
            } else {
// Otherwise, find the next Friday
                nextFriday.setDate(nextFriday.getDate() + ((7 - currentDay + 5) % 7));
            }
            nextFriday.setHours(22, 0, 0, 0);
// Calculate difference
            const diff = nextFriday - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            countdownElement.innerHTML = `${days}D ${hours}H ${minutes}M ${seconds}S`;
        }    
// Update immediately and then every second
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
// Footer visibility logic
    setupFooterVisibility() {
        const footer = document.getElementById('footer-section');
        const mixSection = document.getElementById('mix-section');
        const checkFooterVisibility = () => {
// Show footer if audio is playing
            if (this.state.audioPlaying) {
                // console.log('🔊 Footer Showing: Audio');
                footer.classList.add('visible');
                footer.classList.remove('hidden');
                return;
            }
// Show footer if user is near the bottom of the mix section
            const mixSectionRect = mixSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (mixSectionRect.bottom - windowHeight <= 100) {
                // console.log('📍 Footer Showing: Position');
                footer.classList.add('visible');
                footer.classList.remove('hidden');
            } else {
                // console.log('📍 Footer Hidden');
                footer.classList.remove('visible');
                footer.classList.add('hidden');
            }
        };
// Add event listeners
        window.addEventListener('scroll', checkFooterVisibility);
// Initial check
        checkFooterVisibility();
    }
// Audio Player setup (room for improvement)
    setupAudioPlayer() {
        const mixItems = document.querySelectorAll('.mix-item');
        const audioPlayer = document.getElementById('mixPlayer');
        const footer = document.getElementById('footer-section');
// Add a property to track the timeout
        let footerHideTimeout;
        mixItems.forEach(mixItem => {
            mixItem.addEventListener('click', () => {
// Clear any existing timeout when starting new audio
                if (footerHideTimeout) {
                    clearTimeout(footerHideTimeout);
                }
                console.log(`🎵 Queueing Mix: ${mixItem.textContent.trim()}`);
                audioPlayer.src = mixItem.getAttribute('data-src');
                audioPlayer.play()
                    .then(() => {
                        console.log('🎶 Subwoofers Firing');
                        this.state.audioPlaying = true;
                        this.setupFooterVisibility();
                    })
                    .catch(error => {
                        console.error('⚠️ Audio Error:', error);
                        footer.querySelector('.audio-player-container').classList.add('error');
                    });
            });
        });
        audioPlayer.addEventListener('play', () => {
// Clear any existing timeout when resuming playback
            if (footerHideTimeout) {
                clearTimeout(footerHideTimeout);
            }
            console.log('▶️ Audio: Playback started');
            this.state.audioPlaying = true;
            this.setupFooterVisibility();
        });
        audioPlayer.addEventListener('pause', () => {
            console.log('⏸️ Audio Playback Paused');
            console.log('⏲️ Grace Timer: 8s');
// Clear any existing timeout first
            if (footerHideTimeout) {
                clearTimeout(footerHideTimeout);
            }
// Set new timeout
            footerHideTimeout = setTimeout(() => {
                console.log('⏲️ Grace Timer Depleted');
                this.state.audioPlaying = false;
                this.setupFooterVisibility();
            }, 8000); // 8 seconds
        });
        audioPlayer.addEventListener('ended', () => {
            console.log('🏁 Audio: Mix playback completed');
            this.state.audioPlaying = false;
            this.setupFooterVisibility();
        });
        console.log('🎧 Overwhelming Majority for Subwoofers');
    }
}
// First and final calls to launch site
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🔌 BOOTUP INITIALIZED: ALLOCATING POWER:');
        const siteManager = new SectionManager();
        console.log('🚀 BEGIN BASS BROADCAST');
    } catch (error) {
        console.error('⚠️ Launch Failed:', error);
    }
});