// Set true for console logging
const DEBUG_MODE = false;
const logger = {
// Always log errors
    error: (...args) => {
        console.error(...args);
    },
    log: (...args) => {
        if (DEBUG_MODE) {
            console.log(...args);
        }
    },
    warn: (...args) => {
        if (DEBUG_MODE) {
            console.warn(...args);
        }
    },
    group: (...args) => {
        if (DEBUG_MODE) {
            console.group(...args);
        }
    },
    groupEnd: () => {
        if (DEBUG_MODE) {
            console.groupEnd();
        }
    },
    info: (...args) => {
        if (DEBUG_MODE) {
            console.info(...args);
        }
    }
// Add wrappers for other console methods (e.g., table, time, timeEnd) if needed
};
// Custom player
class AudioPlayer {
    constructor(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.error(`AudioPlayer container "${containerSelector}" not found.`);
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
             logger.error("AudioPlayer UI elements missing!"); // Use logger.error (which always logs)
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
        logger.log('🎧 Custom Audio Controls Initialized');
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
        logger.log(`💿 Loading Track: ${title} (${src})`);
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
                logger.warn("Audio not ready to play yet."); // Use logger.warn
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
           logger.error("Play Error:", error); // Use logger.error
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
        logger.log('🏁 Audio Complete (Custom Handler)');
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
             logger.warn("Duration is invalid:", this.duration); // Use logger.warn
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
            // logger.log('Skipping updateProgress while seeking'); // Debugging
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
        const seekTime = parseFloat(event.target.value);
        if (!isNaN(seekTime) && isFinite(seekTime)) {
             this.currentTimeElement.textContent = this.formatTime(seekTime);
        }
    }

    handleSeekChange(event) {
        const seekTime = parseFloat(event.target.value);
        logger.log(`Seek Change - Released at Slider Value: ${seekTime}`);

        if (this.duration > 0 && !isNaN(this.duration) && isFinite(this.duration)) {
             if (!isNaN(seekTime) && isFinite(seekTime)) {
                 const clampedTime = Math.max(0, Math.min(seekTime, this.duration));
                 logger.log(`Seeking to final time: ${this.formatTime(clampedTime)}`);
                 try {
                    this.audioElement.currentTime = clampedTime;
                     // Don't set isSeeking = false immediately, wait for browser
                 } catch (error) {
                    logger.error("Error setting currentTime on seek change:", error); // Use logger.error
                    this.isSeeking = false; // Reset flag on error
                 }
             } else {
                 logger.error(`Invalid seekTime on change: ${seekTime}`); // Use logger.error
                 this.isSeeking = false; // Reset flag if value invalid
             }
        } else {
            logger.log(`Seek Change prevented: Duration=${this.duration}`);
            this.isSeeking = false; // Reset flag if duration invalid
        }
    }

    handleSeeked() {
        logger.log(`Seek operation completed. Current time: ${this.formatTime(this.audioElement.currentTime)}`);
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
         logger.log(`Mute toggled. Is Muted: ${this.isMuted}, Volume: ${this.audioElement.volume}, Last Volume: ${this.lastVolume}`);
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
        logger.error("Audio Element Error:", this.audioElement.error); // Use logger.error
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
        // logger.log(`Time since stop: ${timeSinceStop}ms`); // Debugging
        return timeSinceStop < gracePeriod;
    }
}
// ===== SectionManager Class Modifications =====
class SectionManager {
    constructor() {
        logger.log('⚡ Faint Flicker Fueling Facility Fixtures');
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
        this.heroInstructionElement = document.querySelector('.hero-instruction');
        this.heroInstructionHasBeenHidden = false;

        try {
            this.audioPlayer = new AudioPlayer('.audio-player-container');
        } catch (error) {
             logger.error("FAILED TO INITIALIZE AUDIO PLAYER:", error);
             // Handle failure - hide the footer
             const footer = document.querySelector('.site-footer'); // <-- Changed selector
             if (footer) {
                 footer.style.display = 'none'; // Hide footer on critical error
             }
             this.audioPlayer = null; // Ensure it's null if failed
        }

        this.initializeManager();
    }
// INITIALIZE SITE AND START AT TOP
    initializeManager() {
        logger.log('📡 Tiny Trickle Tracking Telemetry');
        history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        this.loadMixes();
        this.setupIntersectionObserver();
        this.setupNavigationListeners();
        this.setupAudioPlayerInteractions(); // Renamed from setupAudioPlayer
        this.setupCountdown();
        this.setupFooterVisibility();
        this.setupViewportLogging();
        this.logTimezoneDebugInfo();
    }

    // --- LOAD MIXES ---
async loadMixes() {
    const mixListElement = document.querySelector('.mix-list');
    if (!mixListElement) {
        logger.error("Mix list container (.mix-list) not found.");
        return;
    }

    try {
        const response = await fetch('mixes.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const mixes = await response.json();
        // Clear any potential placeholders (though it should be empty)
        mixListElement.innerHTML = '';
        // Populate the list
        mixes.forEach(mix => {
            const listItem = document.createElement('li');
            listItem.classList.add('mix-item');
            listItem.setAttribute('data-src', mix.src);
            listItem.textContent = mix.title;
            // Add tabindex="0" to make it keyboard focusable if needed,
            // but click/enter usually works on list items with listeners.
            // listItem.setAttribute('tabindex', '0');
            mixListElement.appendChild(listItem);
        });

        logger.log(`🎵 Loaded ${mixes.length} mixes from JSON.`);

    } catch (error) {
        logger.error("Failed to load mixes:", error);
        mixListElement.innerHTML = '<li class="mix-item error-message">Could not load mixes. Please try again later.</li>'; // Display error
         // Add basic styling for .error-message if desired
    }
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
            logger.group('📐 Station Dimensions'); // Use logger.group
            logger.log(`Height: ${viewportHeight}px / ${(viewportHeight / rootFontSize).toFixed(2)}rem`);
            logger.log(`Width: ${viewportWidth}px / ${(viewportWidth / rootFontSize).toFixed(2)}rem`);
            logger.log(`Aspect Ratio: ${aspectRatio}`);
            logger.log(`Orientation: ${orientation}`);
            logger.log(`Document Height: ${documentHeight}px`);
            logger.log(`Document Width: ${documentWidth}px`);
            logger.log(`Root Font Size: ${rootFontSize}px`);
            logger.groupEnd(); // Use logger.groupEnd
        };
        logViewportDetails();
        window.addEventListener('resize', () => {
            logger.log('🕳️ Wormhole Reshaping Station!');
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
        logger.group('🌐 Timezone Debug Information');
        logger.log('Local Time:', localTime);
        logger.log('EST Time:', estFormatter.format(localTime));
        logger.log('Local Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
        logger.log('EST Offset Calculation:', this.calculateESTOffset());
        logger.groupEnd();
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
            logger.error('EST Time Calculation Error', error); // Use logger.error
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
            logger.error('Next Show Time Calculation Error', error); // Use logger.error
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
                    // Throw error instead of logging directly inside potentially frequent interval
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
                // Log error outside the interval logic, but only if it occurs
                logger.error("⚠️ Countdown error:", error); // Use logger.error
// Hide the countdown element on error
                countdownElement.style.display = 'none';
                 // Consider stopping the interval if the error is persistent/unrecoverable
                 // clearInterval(countdownInterval); // Need to assign interval to variable first
            }
        };

// Initial update
        updateCountdown();
// Update every second
        // Assign to variable if you might need to clear it
        const countdownInterval = setInterval(updateCountdown, 1000);
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
        logger.log('🕵️ Dubious Discharge Diminishing Diagnostics');
    }
// MODIFYING VALUE ATTRIBUTE OF CURRENT SECTION
    updateCurrentSection(sectionName) {
        if (this.currentSection !== sectionName) {
            logger.log(`➡️ Sector Switch: ${this.currentSection || 'None'} → ${sectionName}`);
            this.currentSection = sectionName;
            // Hide hero instruction if we've moved past the hero section
            if (this.heroInstructionElement && !this.heroInstructionHasBeenHidden) {
                if (sectionName !== 'hero') {
                    this.heroInstructionElement.classList.add('hidden');
                    this.heroInstructionHasBeenHidden = true;
                    logger.log('👻 Hero instruction hidden.');
                }
            }
        }
    }
// LISTENERS FOR USER INPUTS
    setupNavigationListeners() {
        const navigationTriggers = [
            { type: 'click', elements: [
                this.sections.find(section => section.name === 'hero').element,
                document.querySelector('.past-voyages-button') // Updated selector
            ]},
            { type: 'keyboard', keys: ['ArrowDown', 'Space'] },
            { type: 'wheel', threshold: 300 },
            { type: 'touch', sensitivity: 50 }
        ];
        navigationTriggers.forEach(trigger => {
            switch (trigger.type) {
                case 'click':
                    trigger.elements.forEach(el => {
                        if (!el) { // Guard against null elements if selector fails
                            logger.warn(`Navigation trigger element not found for type: ${trigger.type}`);
                            return;
                        }
                        el.addEventListener('click', () => {
                            logger.log(`🖱️ AutoPilot Requested - CLICK on ${el.className || el.id}`);
                            // For hero section OR past voyages button, force navigation
                            this.navigateToNextSection(true);
                        });
                    });
                    break;
                case 'keyboard':
                    document.addEventListener('keydown', (e) => {
                        if (trigger.keys.includes(e.key) || trigger.keys.includes(e.code)) {
                            e.preventDefault();
                            if (!this.initialNavigationComplete) {
                                logger.log(`⌨️ AutoPilot Requested - KEYSTROKE`);
                                this.navigateToNextSection();
                            } else {
                                logger.log(`⌨️ AutoPilot via Keystroke Denied`)
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
                                logger.log('🖱️ AutoPilot Requested - SCROLL');
                                this.navigateToNextSection();
                            } else {
                                logger.log('🖱️ AutoPilot via Scroll Denied');
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
                                logger.log('👆 AutoPilot Requested - SWIPE');
                                this.navigateToNextSection();
                            } else {
                                logger.log('👆 AutoPilot via Swipe Denied');
                                return;
                            }
                        }
                    });
                    break;
            }
        });
        logger.log('🕹️ Pitiful Portion Powering Pilot Panel');
    }
// UPDATE DEPTH INTO SITE
    navigateToNextSection(forceNavigation = false) {
        const currentIndex = this.sectionOrder.indexOf(this.currentSection);
        const nextIndex = currentIndex + 1;
        // This line ensures furthestReachedIndex is at least the current section before the check.
        // It's part of the logic to prevent implicit navigation (scroll/swipe) from re-triggering
        // if the user has scrolled back past a section they already visited.
        // For forced navigation, this specific update's immediate effect on the condition is bypassed.
        this.furthestReachedIndex = Math.max(this.furthestReachedIndex, currentIndex);
        // Condition to navigate:
        // 1. There must be a next section.
        // 2. EITHER navigation is forced (explicit click)
        //    OR (for implicit navigation) the user hasn't already been further than the current section.
        if (nextIndex < this.sectionOrder.length && (forceNavigation || currentIndex >= this.furthestReachedIndex)) {
            const nextSectionName = this.sectionOrder[nextIndex];
            logger.log(`🗺️ Plotting Navigation: ${this.currentSection} → ${nextSectionName} (Forced: ${forceNavigation})`);
            this.navigateToSection(nextSectionName);
            // IMPORTANT: Update furthestReachedIndex to the new section *index* after deciding to navigate
            this.furthestReachedIndex = Math.max(this.furthestReachedIndex, nextIndex);
            if (nextSectionName === 'mixes') {
                this.initialNavigationComplete = true;
                logger.log('🏁 Destination Reached - AutoPilot Hibernating');
            }
        } else {
            logger.log(`Navigation to next section skipped. Current: ${this.currentSection}, Next Index: ${nextIndex}, Furthest: ${this.furthestReachedIndex}, CheckVal: ${currentIndex >= this.furthestReachedIndex}, Forced: ${forceNavigation}`);
        }
    }
// SCRIPTING AUTO-SCROLL
    navigateToSection(sectionName) {
        logger.log(`✈️ AutoPiloting to ${sectionName}`);
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
        const footer = document.querySelector('.site-footer');
            if (!footer) {
                logger.error("Footer element (.site-footer) not found!");
                return; // Stop if footer doesn't exist
            }
        let visibilityTimeout; // Use a timeout for smoother transitions on scroll near edge
        const checkFooterVisibility = () => {
            if (!footer) return;  // Don't try to modify classes if footer wasn't found
            clearTimeout(visibilityTimeout); // Clear any pending check
            const shouldBeVisible = () => {
                // Condition 1: Is audio playing?
                if (this.audioPlayer && this.audioPlayer.isAudioPlaying) {
                    logger.log('🔊 Footer Showing: Audio Playing');
                    return true;
                }
                // Condition 2: Was audio playing recently (within grace period)?
                if (this.audioPlayer && this.audioPlayer.wasPlayingRecently(8000)) { // Check within 8 seconds
                     logger.log('⏱️ Footer Showing: Grace Period');
                     return true;
                }
                // Condition 3: Is user near the absolute bottom of the page?
                const scrollY = window.scrollY || window.pageYOffset;
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                const nearBottomThreshold = 50; // Pixels from the very bottom
                if (documentHeight - (scrollY + windowHeight) < nearBottomThreshold) {
                    logger.log('⬇️ Footer Showing: Near Bottom');
                    return true;
                }
                logger.log('⭕ Footer Hidden');
                return false;
            };
            if (shouldBeVisible()) {
                footer.classList.add('visible');
            } else {
                // Use timeout only for hiding to prevent flicker
                visibilityTimeout = setTimeout(() => {
                    if (!footer) return; // Check again inside timeout
                    if (!shouldBeVisible()) { // Re-check condition before hiding
                        footer.classList.remove('visible');
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
            logger.warn("Audio Player not available, skipping interaction setup.");
            return;
        }
        const mixListElement = document.querySelector('.mix-list');
        if (!mixListElement) {
            logger.error("Mix list container (.mix-list) not found for event delegation.");
            return;
        }
        // Use Event Delegation on the parent UL
        mixListElement.addEventListener('click', (event) => {
            // Check if the clicked element is a mix item itself
            const mixItem = event.target.closest('.mix-item');
            if (mixItem && !mixItem.classList.contains('error-message')) { // Ensure it's a valid mix item
                const src = mixItem.getAttribute('data-src');
                const title = mixItem.textContent.trim();
                if (src && title) {
                    logger.log(`🎵 User selected Mix: ${title}`);
                    this.audioPlayer.loadTrack(src, title);
                    // Optional: Add visual feedback for loading here (see UX Improvement)
                    this.audioPlayer.play();
                    this.setupFooterVisibility(); // Re-check footer visibility
                } else {
                    logger.error("Missing data-src or title on clicked mix item:", mixItem);
                }
            }
        });
        logger.log('📢 Mix selection listener ready (using event delegation).');
    }
}
// ===== Initialize Site =====
document.addEventListener('DOMContentLoaded', () => {
    try {
        logger.log('🔌 BOOTUP - ALLOCATING POWER:');
        const siteManager = new SectionManager();
        logger.log('🛸 BEGIN BASS BROADCAST');
    } catch (error) {
        logger.error('⚠️ LAUNCH FAILED:', error); // Use logger.error
    }
});