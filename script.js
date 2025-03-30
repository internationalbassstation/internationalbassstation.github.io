// ===== AudioPlayer Class =====
class AudioPlayer {
    constructor(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) {
            throw new Error(`AudioPlayer container "${containerSelector}" not found.`);
        }
        this.audioElement = container.querySelector('#mixPlayer');
        this.playPauseButton = container.querySelector('.play-pause-button');
        this.trackTitleElement = container.querySelector('.track-title');
        this.currentTimeElement = container.querySelector('.current-time');
        this.durationElement = container.querySelector('.duration');
        this.seekSlider = container.querySelector('.seek-slider');
        this.volumeButton = container.querySelector('.volume-button');
        this.volumeSlider = container.querySelector('.volume-slider');
        this.loadingIndicator = container.querySelector('.loading-indicator');
        this.playerContainer = container; // The main .audio-player-container
        this.hasTrackLoaded = false; // Flag to track if loadTrack was successful
        if (!this.audioElement || !this.playPauseButton || !this.seekSlider || !this.volumeSlider /*... check others */) {
             console.error("AudioPlayer UI elements missing!");
             return;
        }
        this.isPlaying = false;
        this.isSeeking = false;
        this.isMuted = false;
        this.duration = 0;
        this.lastVolume = 1; // Default volume
        this.currentTrackTitle = '';
        this.lastStopTime = 0;
        this.attachEventListeners();
        this.updateVolumeUI(); // Set initial volume slider/icon state
        this.playerContainer.classList.remove('track-loaded'); // Ensure state starts clean
        console.log('🎧 Custom Audio Controls Initialized');
    }

    attachEventListeners() {
        // Audio Element Events
        this.audioElement.addEventListener('loadedmetadata', this.handleMetadataLoaded.bind(this));
        this.audioElement.addEventListener('timeupdate', this.updateProgress.bind(this));
        this.audioElement.addEventListener('play', this.handlePlay.bind(this));
        this.audioElement.addEventListener('pause', this.handlePause.bind(this));
        this.audioElement.addEventListener('ended', this.handleEnded.bind(this));
        this.audioElement.addEventListener('volumechange', this.updateVolumeUI.bind(this));
        this.audioElement.addEventListener('waiting', this.showLoading.bind(this));
        this.audioElement.addEventListener('playing', this.hideLoading.bind(this));
        this.audioElement.addEventListener('error', this.handleError.bind(this));
        this.audioElement.addEventListener('canplay', this.hideLoading.bind(this)); // Hide loader when ready

        // Control Events
        this.playPauseButton.addEventListener('click', this.togglePlayPause.bind(this));
        this.seekSlider.addEventListener('input', this.handleSeekInput.bind(this));
        this.seekSlider.addEventListener('change', this.handleSeekChange.bind(this));
        this.audioElement.addEventListener('seeked', this.handleSeeked.bind(this)); // Listen for seek completion
        this.volumeSlider.addEventListener('input', this.setVolume.bind(this));
        this.volumeButton.addEventListener('click', this.toggleMute.bind(this));
    }

    loadTrack(src, title) {
        console.log(`💿 Loading Track: ${title} (${src})`);
        this.audioElement.src = src;
        this.audioElement.load(); // Important: Trigger load for new src
        this.currentTrackTitle = title;
        this.trackTitleElement.textContent = this.currentTrackTitle;
        this.hasTrackLoaded = true; // Mark as loaded
        this.playerContainer.classList.add('track-loaded'); // Add class for CSS
        this.playerContainer.classList.remove('error'); // Clear previous errors
        this.resetPlayerUI();
        this.showLoading();
    }

    resetPlayerUI() {
         this.currentTimeElement.textContent = '0:00';
         this.durationElement.textContent = '0:00';
         this.seekSlider.value = 0;
         this.playPauseButton.textContent = '▶️';
         this.playPauseButton.setAttribute('aria-label', 'Play');
         this.isPlaying = false;
         // Don't reset volume here, keep user preference
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            // Check if ready state allows playing
            if (this.audioElement.readyState >= 2) { // HAVE_METADATA or more
                 this.play();
            } else {
                console.warn("Audio not ready to play yet.");
                // Optionally try loading again or show a message
                this.showLoading();
                this.audioElement.load(); // Try loading again
            }
        }
    }

    play() {
       this.audioElement.play().then(() => {
           this.handlePlay(); // Update UI immediately on success
       }).catch(error => {
           console.error("Play Error:", error);
           this.handleError();
       });
    }

    pause() {
        this.audioElement.pause();
        this.handlePause(); // Update UI immediately
    }

    handlePlay() {
        this.isPlaying = true;
        this.playPauseButton.textContent = '⏸️';
        this.playPauseButton.setAttribute('aria-label', 'Pause');
        this.hideLoading();
        this.playerContainer.classList.remove('error');
        this.lastStopTime = 0; // <<< ADD THIS: Reset stop time when play starts
        this.isSeeking = false; // Ensure seeking stops if play starts
        document.dispatchEvent(new CustomEvent('audiostatechange', { detail: { isPlaying: true } }));
    }

    handlePause() {
        this.isPlaying = false;
        this.playPauseButton.textContent = '▶️';
        this.playPauseButton.setAttribute('aria-label', 'Play');
        this.hideLoading();
        this.lastStopTime = Date.now(); // <<< ADD THIS: Record stop time on pause
        this.isSeeking = false; // Ensure seeking stops if paused
        document.dispatchEvent(new CustomEvent('audiostatechange', { detail: { isPlaying: false } }));
    }

     handleEnded() {
        console.log('🏁 Audio Complete (Custom Handler)');
        this.handlePause(); // Visually reset to paused state (this also sets lastStopTime)
        this.audioElement.currentTime = 0;
        this.seekSlider.value = 0;
        this.currentTimeElement.textContent = '0:00';
        this.isSeeking = false;
        // Note: handlePause already dispatches the audiostatechange event
    }

    handleMetadataLoaded() {
        this.duration = this.audioElement.duration;
        if (isNaN(this.duration) || !isFinite(this.duration)) {
             console.warn("Duration is invalid:", this.duration);
             this.durationElement.textContent = '-:--';
             this.seekSlider.disabled = true; // Disable seeking if duration unknown
             this.duration = 0; // Reset internal duration
        } else {
            this.durationElement.textContent = this.formatTime(this.duration);
            this.seekSlider.max = this.duration; // Set slider max to actual duration
            this.seekSlider.disabled = false;
        }
        this.hideLoading(); // Hide loading once metadata is ready
    }

    updateProgress() {
        if (this.isSeeking) {
            // console.log('Skipping updateProgress while seeking'); // Debugging
            return; // Don't update slider value from audio while user is dragging
        }

        if (this.duration > 0) {
            // Only update if NOT seeking
            this.seekSlider.value = this.audioElement.currentTime;
            this.currentTimeElement.textContent = this.formatTime(this.audioElement.currentTime);
        }
    }

    handleSeekInput(event) {
        this.isSeeking = true; // Mark that user is dragging
        // Optional: Update the current time display live while dragging
        const seekTime = parseFloat(event.target.value);
        if (!isNaN(seekTime) && isFinite(seekTime)) {
             this.currentTimeElement.textContent = this.formatTime(seekTime);
        }
         console.log(`Seek Input - Dragging to ${this.formatTime(seekTime)}`); // Debugging
    }

    handleSeekChange(event) {
         // This now acts like the old 'seek' method, firing on release
        const seekTime = parseFloat(event.target.value);
        console.log(`Seek Change - Released at Slider Value: ${seekTime}`);

        if (this.duration > 0 && !isNaN(this.duration) && isFinite(this.duration)) {
             if (!isNaN(seekTime) && isFinite(seekTime)) {
                 const clampedTime = Math.max(0, Math.min(seekTime, this.duration));
                 console.log(`Seeking to final time: ${this.formatTime(clampedTime)}`);
                 try {
                    this.audioElement.currentTime = clampedTime;
                     // Don't set isSeeking = false immediately, wait for browser
                 } catch (error) {
                    console.error("Error setting currentTime on seek change:", error);
                    this.isSeeking = false; // Reset flag on error
                 }
             } else {
                 console.error(`Invalid seekTime on change: ${seekTime}`);
                 this.isSeeking = false; // Reset flag if value invalid
             }
        } else {
            console.log(`Seek Change prevented: Duration=${this.duration}`);
            this.isSeeking = false; // Reset flag if duration invalid
        }
    }

    handleSeeked() {
        console.log(`Seek operation completed. Current time: ${this.formatTime(this.audioElement.currentTime)}`);
        this.isSeeking = false; // Reset the flag now that the seek is done
        // It's now safe to allow updateProgress to run fully again
    }

    setVolume(event) {
        const volume = parseFloat(event.target.value);
        this.audioElement.muted = false; // Unmute if adjusting slider
        this.audioElement.volume = volume;
        this.isMuted = (volume === 0);
        if (!this.isMuted) {
            this.lastVolume = volume; // Store last non-zero volume
        }
         // volumechange event will trigger updateVolumeUI
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            // Store current volume *before* muting, only if it wasn't already 0
            if (this.audioElement.volume > 0) {
                 this.lastVolume = this.audioElement.volume;
            }
            this.audioElement.volume = 0;
            this.volumeButton.setAttribute('aria-label', 'Unmute');
        } else {
            // Restore last known volume (or default to 1 if last was 0)
            this.audioElement.volume = this.lastVolume > 0 ? this.lastVolume : 1;
             this.volumeButton.setAttribute('aria-label', 'Mute');
        }
        this.audioElement.muted = this.isMuted; // Ensure audio element muted state matches
        // volumechange event will trigger updateVolumeUI
         console.log(`Mute toggled. Is Muted: ${this.isMuted}, Volume: ${this.audioElement.volume}, Last Volume: ${this.lastVolume}`);
    }

    updateVolumeUI() {
        const volume = this.audioElement.volume;
        const muted = this.audioElement.muted;

        this.volumeSlider.value = muted ? 0 : volume; // Slider reflects actual volume or 0 if muted

        if (muted || volume === 0) {
            this.volumeButton.textContent = '🔇';
            this.volumeButton.setAttribute('aria-label', 'Unmute');
             this.isMuted = true; // Sync internal state
        } else if (volume < 0.5) {
            this.volumeButton.textContent = '🔈';
             this.volumeButton.setAttribute('aria-label', 'Mute');
             this.isMuted = false; // Sync internal state
        } else {
            this.volumeButton.textContent = '🔊';
             this.volumeButton.setAttribute('aria-label', 'Mute');
             this.isMuted = false; // Sync internal state
        }
    }

    formatTime(seconds) {
        const flooredSeconds = Math.floor(seconds);
        const minutes = Math.floor(flooredSeconds / 60);
        const remainingSeconds = flooredSeconds % 60;
        const formattedTime = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
        return isNaN(minutes) ? '0:00' : formattedTime; // Handle NaN case
    }

    showLoading() {
        this.playerContainer.classList.add('loading');
    }

    hideLoading() {
        this.playerContainer.classList.remove('loading');
    }

    handleError() {
        console.error("Audio Element Error:", this.audioElement.error);
        this.playerContainer.classList.add('error');
        this.playerContainer.classList.remove('track-loaded'); // Remove loaded state on error
        this.hasTrackLoaded = false;                          // Update flag
        this.trackTitleElement.textContent = "Load Failed";
        this.isSeeking = false;
        this.hideLoading();
        this.handlePause(); // Ensure UI is paused visually
         document.dispatchEvent(new CustomEvent('audiostatechange', { detail: { isPlaying: false, error: true } }));
    }

    // Method for SectionManager to check state
    get isAudioPlaying() {
        return this.isPlaying;
    }

    // Check if audio stopped recently
    wasPlayingRecently(gracePeriod = 8000) { // Default 8 seconds
        if (!this.lastStopTime) {
            return false; // Never stopped or currently playing
        }
        const timeSinceStop = Date.now() - this.lastStopTime;
        // console.log(`Time since stop: ${timeSinceStop}ms`); // Debugging
        return timeSinceStop < gracePeriod;
    }
}
// ===== SectionManager Class Modifications =====
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

        try {
            this.audioPlayer = new AudioPlayer('.audio-player-container');
        } catch (error) {
             console.error("FAILED TO INITIALIZE AUDIO PLAYER:", error);
             // Handle failure - maybe hide the footer or show a static message
             const footer = document.getElementById('footer-section');
             if (footer) footer.style.display = 'none'; // Example: hide footer on critical error
             this.audioPlayer = null; // Ensure it's null if failed
        }

        this.initializeManager();
    }
// INITIALIZE SITE AND START AT TOP
    initializeManager() {
        console.log('📡 Tiny Trickle Tracking Telemetry');
        history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        this.setupIntersectionObserver();
        this.setupNavigationListeners();
        this.setupAudioPlayerInteractions(); // Renamed from setupAudioPlayer
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
        let visibilityTimeout; // Use a timeout for smoother transitions on scroll near edge

        const checkFooterVisibility = () => {
            clearTimeout(visibilityTimeout); // Clear any pending check

            const shouldBeVisible = () => {
                // Condition 1: Is audio playing?
                if (this.audioPlayer && this.audioPlayer.isAudioPlaying) {
                    // console.log('🔊 Footer Showing: Audio Playing');
                    return true;
                }

                // Condition 2: Was audio playing recently (within grace period)?
                if (this.audioPlayer && this.audioPlayer.wasPlayingRecently(8000)) { // Check within 8 seconds
                     // console.log('⏱️ Footer Showing: Grace Period');
                     return true;
                }

                // Condition 3: Is user near the absolute bottom of the page?
                const scrollY = window.scrollY || window.pageYOffset;
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                const nearBottomThreshold = 50; // Pixels from the very bottom

                if (documentHeight - (scrollY + windowHeight) < nearBottomThreshold) {
                    // console.log('⬇️ Footer Showing: Near Bottom');
                    return true;
                }

                // console.log('⭕ Footer Hidden');
                return false;
            };


            if (shouldBeVisible()) {
                footer.classList.add('visible');
                footer.classList.remove('hidden');
            } else {
                // Use timeout only for hiding to prevent flicker
                visibilityTimeout = setTimeout(() => {
                    if (!shouldBeVisible()) { // Re-check condition before hiding
                        footer.classList.remove('visible');
                        // footer.classList.add('hidden'); // Optional explicit hidden class
                    }
                }, 250); // Short delay
            }
        };

        window.addEventListener('scroll', checkFooterVisibility, { passive: true });
        document.addEventListener('audiostatechange', checkFooterVisibility); // Keep this listener
        checkFooterVisibility(); // Initial check
    }

    // --- Modified Audio Player Interaction Setup ---
    setupAudioPlayerInteractions() {
        if (!this.audioPlayer) {
            console.warn("Audio Player not available, skipping interaction setup.");
            return; // Don't setup if player failed to init
        }

        const mixItems = document.querySelectorAll('.mix-item');

        mixItems.forEach(mixItem => {
            mixItem.addEventListener('click', () => {
                const src = mixItem.getAttribute('data-src');
                const title = mixItem.textContent.trim(); // Get title from list item text

                if (src && title) {
                    console.log(`🎵 User selected Mix: ${title}`);
                    this.audioPlayer.loadTrack(src, title);
                    // Automatically play after selection
                    this.audioPlayer.play();
                    // Ensure footer becomes visible immediately when a track is loaded
                    this.setupFooterVisibility();
                } else {
                    console.error("Missing data-src or title on mix item:", mixItem);
                }
            });
        });

        console.log('📢 Mix selection listeners ready.');
    }

}

// ===== Initialize Site =====
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🔌 BOOTUP - ALLOCATING POWER:');
        const siteManager = new SectionManager();
        console.log('🛸 BEGIN BASS BROADCAST');
    } catch (error) {
        console.error('⚠️ LAUNCH FAILED:', error);
    }
});