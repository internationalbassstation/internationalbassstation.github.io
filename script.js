class SectionManager {
    constructor() {
        console.log('⚡ Faint Flicker Fueling Facility Fixtures');
// SETUP SECTION STRUCTURE
        this.sections = [
            { name: 'hero', element: document.getElementById('hero-section') },
            { name: 'info', element: document.getElementById('info-section') },
            { name: 'mixes', element: document.getElementById('mix-section') }
        ];
        this.currentSection = null;
        this.sectionOrder = ['hero', 'info', 'mixes'];
        this.initialNavigationComplete = false;
        this.furthestReachedIndex = 0;
        this.state = {
            audioPlaying: false
        };
        this.initializeManager();
    }
// INITIALIZE SITE AND START AT TOP
    initializeManager() {
        console.log('📡 Tiny Trickle Tracking Telemetry');
        history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        this.setupIntersectionObserver();
        this.setupNavigationListeners();
        this.setupAudioPlayer();
        this.setupCountdown();
        this.setupFooterVisibility();
        this.setupViewportLogging();
        this.logTimezoneDebugInfo();
    }
// DETERMINE VIEWPORT SIZE AND LISTEN FOR CHANGE
    setupViewportLogging() { 
        const logViewportDetails = () => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const documentWidth = document.documentElement.clientWidth;
            const documentHeight = document.documentElement.clientHeight;
            const orientation = viewportWidth > viewportHeight ? 'Landscape' : 'Portrait';
            const aspectRatio = (viewportWidth / viewportHeight).toFixed(2);
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            console.group('📐 Station Dimensions');
            console.log(`Height: ${viewportHeight}px / ${(viewportHeight / rootFontSize).toFixed(2)}rem`);
            console.log(`Width: ${viewportWidth}px / ${(viewportWidth / rootFontSize).toFixed(2)}rem`);
            console.log(`Aspect Ratio: ${aspectRatio}`);
            console.log(`Orientation: ${orientation}`);
            console.log(`Document Height: ${documentHeight}px`);
            console.log(`Document Width: ${documentWidth}px`);
            console.log(`Root Font Size: ${rootFontSize}px`);
            console.groupEnd();
        };
        logViewportDetails();
        window.addEventListener('resize', () => {
            console.log('🕳️ Wormhole Reshaping Station!');
            logViewportDetails();
        });
    }
// TIMEZONE CALIBRATION
    logTimezoneDebugInfo() {
        const localTime = new Date();
        const estFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            dateStyle: 'full',
            timeStyle: 'long'
        });
        console.group('🌐 Timezone Debug Information');
        console.log('Local Time:', localTime);
        console.log('EST Time:', estFormatter.format(localTime));
        console.log('Local Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
        console.log('EST Offset Calculation:', this.calculateESTOffset());
        console.groupEnd();
    }
// EST TIMEZONE CONVERSION
    calculateESTOffset() {
        const localTime = new Date();
        const estTime = new Date(localTime.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        return localTime.getTime() - estTime.getTime();
    }
    getCurrentESTTime() {
        try {
            const localTime = new Date();
            return new Date(localTime.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        } catch (error) {
            console.error('EST Time Calculation Error', error);
            return new Date();
        }
    }
// CHECK FOR ACTIVE SHOW
    isShowActive() {
        const currentESTTime = this.getCurrentESTTime();
        return (
            currentESTTime.getDay() === 5 && // Friday
            currentESTTime.getHours() >= 22 && 
            currentESTTime.getHours() < 23
        );
    }
// CALCULATE NEXT SHOW
    getNextShowTime() {
        try {
            const currentESTTime = this.getCurrentESTTime();
            const nextShow = new Date(currentESTTime);
            // IF FRIDAY
            if (currentESTTime.getDay() === 5) {
                if (currentESTTime.getHours() < 22) {
                    nextShow.setHours(22, 0, 0, 0);
                } 
                else {
                    nextShow.setDate(nextShow.getDate() + 7);
                    nextShow.setHours(22, 0, 0, 0);
                }
            } 
            // IF NOT FRIDAY
            else {
                nextShow.setDate(
                    nextShow.getDate() + 
                    ((7 - nextShow.getDay() + 5) % 7 || 7)
                );
                nextShow.setHours(22, 0, 0, 0);
            }
            return nextShow;
        } catch (error) {
            console.error('Next Show Time Calculation Error', error);
            // Fallback to a default time
            const fallbackShow = new Date();
            fallbackShow.setDate(fallbackShow.getDate() + ((7 - fallbackShow.getDay() + 5) % 7 || 7));
            fallbackShow.setHours(22, 0, 0, 0);
            return fallbackShow;
        }
    }
// CALIBRATE COUNTDOWN
    setupCountdown() {
        const countdownElement = document.getElementById('countdown');
// UPDATE FUNCTION
        const updateCountdown = () => {
            try {
// CHECK FOR ACTIVE SHOW
                if (this.isShowActive()) {
                    countdownElement.innerHTML = `
                        <a href="https://northumberland897.ca"
                           target="_blank"
                           rel="noopener noreferrer"
                           class="digital-glitch">
                            BASS STATION ACTIVE
                        </a>`;
                    return;
                }
// Get current time in EST
                const currentESTTime = this.getCurrentESTTime();
                const nextShowTime = this.getNextShowTime();
// Calculate difference
                const diff = nextShowTime.getTime() - currentESTTime.getTime();

                if (diff < 0) {
                    throw new Error('Negative time difference');
                }

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                countdownElement.innerHTML = `${days}D ${hours}H ${minutes}M ${seconds}S`;
// Ensure countdown is visible
                countdownElement.style.display = 'block';

            } catch (error) {
                console.error("⚠️ Countdown error:", error);
// Hide the countdown element on error
                countdownElement.style.display = 'none';
            }
        };

// Initial update
        updateCountdown();
// Update every second
        setInterval(updateCountdown, 1000);
    }
    // OBSERVER DETERMINES CURRENT SECTION
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
        console.log('🕵️ Dubious Discharge Diminishing Diagnostics');
    }
// MODIFYING VALUE ATTRIBUTE OF CURRENT SECTION
    updateCurrentSection(sectionName) {
        if (this.currentSection !== sectionName) {
            console.log(`➡️ Sector Switch: ${this.currentSection || 'None'} → ${sectionName}`);
            this.currentSection = sectionName;
        }
    }
// LISTENERS FOR USER INPUTS
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
                            console.log(`🖱️ AutoPilot Requested - CLICK`);
                            this.navigateToNextSection();
                        });
                    });
                    break;
                case 'keyboard':
                    document.addEventListener('keydown', (e) => {
                        if (trigger.keys.includes(e.key) || trigger.keys.includes(e.code)) {
                            e.preventDefault();
                            if (!this.initialNavigationComplete) {
                                console.log(`⌨️ AutoPilot Requested - KEYSTROKE`);
                                this.navigateToNextSection();
                            } else {
                                // console.log(`⌨️ AutoPilot via Keystroke Denied`);
                                return;
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
                                console.log('🖱️ AutoPilot Requested - SCROLL');
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
                                console.log('👆 AutoPilot Requested - SWIPE');
                                this.navigateToNextSection();
                            } else {
                                console.log('👆 AutoPilot via Swipe Denied');
                            }
                        }
                    });
                    break;
            }
        });
        console.log('🕹️ Pitiful Portion Powering Pilot Panel');
    }
// UPDATE DEPTH INTO SITE
    navigateToNextSection() {
        const currentIndex = this.sectionOrder.indexOf(this.currentSection);
        const nextIndex = currentIndex + 1;
        this.furthestReachedIndex = Math.max(this.furthestReachedIndex, currentIndex);
        if (nextIndex < this.sectionOrder.length && currentIndex >= this.furthestReachedIndex) {
            const nextSection = this.sectionOrder[nextIndex];
            console.log(`🗺️ Plotting Navigation: ${this.currentSection} → ${nextSection}`);
            this.navigateToSection(nextSection);
            if (nextSection === 'mixes') {
                this.initialNavigationComplete = true;
                console.log('🏁 Destination Reached - AutoPilot Hibernating');
            }
        }
    }
// SCRIPTING AUTO-SCROLL
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
// FOOTER VISIBILITY AND LISTENER
    setupFooterVisibility() {
        const footer = document.getElementById('footer-section');
        const mixSection = document.getElementById('mix-section');
        const checkFooterVisibility = () => {
            if (this.state.audioPlaying) {
                // console.log('🔊 Footer Showing: Audio');
                footer.classList.add('visible');
                footer.classList.remove('hidden');
                return;
            }
// SHOW IF NEAR BOTTOM OF SITE
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
        window.addEventListener('scroll', checkFooterVisibility);
        checkFooterVisibility();
    }
// AUDIO PLAYER AND LISTENERS
    setupAudioPlayer() {
        const mixItems = document.querySelectorAll('.mix-item');
        const audioPlayer = document.getElementById('mixPlayer');
        const footer = document.getElementById('footer-section');
        let footerHideTimeout;
        mixItems.forEach(mixItem => {
            mixItem.addEventListener('click', () => {
// CLEAR ANY EXISTING TIMEOUTS
                if (footerHideTimeout) {
                    clearTimeout(footerHideTimeout);
                }
                console.log(`🎵 Queueing Mix: ${mixItem.textContent.trim()}`);
                audioPlayer.src = mixItem.getAttribute('data-src');
                audioPlayer.play()
                    .then(() => {
                        console.log('🎶 Mix Active');
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
// CLEAR ANY EXISTING TIMEOUTS
            if (footerHideTimeout) {
                clearTimeout(footerHideTimeout);
            }
            console.log('▶️ Audio Started');
            this.state.audioPlaying = true;
            this.setupFooterVisibility();
        });
        audioPlayer.addEventListener('pause', () => {
            console.log('⏸️ Audio Paused');
            console.log('⏲️ Grace Timer: 8s');
// CLEAR ANY EXISTING TIMEOUTS
            if (footerHideTimeout) {
                clearTimeout(footerHideTimeout);
            }
// SET NEW TIMEOUT
            footerHideTimeout = setTimeout(() => {
                console.log('⏲️ Timer Depleted');
                this.state.audioPlaying = false;
                this.setupFooterVisibility();
            }, 8000); // 8 seconds
        });
        audioPlayer.addEventListener('ended', () => {
            console.log('🏁 Audio Complete');
            this.state.audioPlaying = false;
            this.setupFooterVisibility();
        });
        console.log('📢 Staggering Share Supercharging Subwoofers');
    }
}
// FIRST AND FINAL SITE INITIALIZATIONS
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🔌 BOOTUP - ALLOCATING POWER:');
        const siteManager = new SectionManager();
        console.log('🛸 BEGIN BASS BROADCAST');
    } catch (error) {
        console.error('⚠️ LAUNCH FAILED:', error);
    }
});