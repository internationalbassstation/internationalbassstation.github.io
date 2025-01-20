class SiteSectionManager {
    constructor() {
        // Define the main sections and their properties
        this.sections = {
            hero: {
                element: document.getElementById('hero-container'),
                nextSection: 'info',
                isActive: false,
                threshold: 0.5
            },
            info: {
                element: document.querySelector('.info-container'),
                nextSection: 'mixes',
                isActive: false,
                threshold: 0.3
            },
            mixes: {
                element: document.querySelector('.mixes-container'),
                nextSection: 'footer',
                isActive: false,
                threshold: 0.1
            },
            footer: {
                element: document.querySelector('.site-footer'),
                nextSection: null,
                isActive: false,
                threshold: 0.1
            }
        };

        // Core state tracking
        this.state = {
            currentSection: 'hero',
            isSiteUnlocked: false,
            isTransitioning: false,
            lastScrollTime: Date.now()
        };

        this.initialize();
    }

    initialize() {
        // Ensure page starts at the top
        history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        
        this.setupIntersectionObserver();
        this.setupEventListeners();
        this.lockScroll();
    }

    lockScroll() {
        // Prevent default scroll behavior until site is unlocked
        const handleScroll = (e) => {
            if (!this.state.isSiteUnlocked) {
                e.preventDefault();
                const now = Date.now();
                // Throttle scroll events to prevent rapid firing
                if (now - this.state.lastScrollTime > 1000) {
                    this.state.lastScrollTime = now;
                    if (e.deltaY > 0) {
                        this.handleSequentialNavigation();
                    }
                }
            }
        };

        window.addEventListener('wheel', handleScroll, { passive: false });
        window.addEventListener('touchmove', handleScroll, { passive: false });
    }

    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: [0.1, 0.3, 0.5]  // Multiple thresholds for different sections
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const sectionKey = Object.keys(this.sections).find(key => 
                    this.sections[key].element === entry.target
                );

                if (sectionKey) {
                    const section = this.sections[sectionKey];
                    section.isActive = entry.intersectionRatio >= section.threshold;
                    
                    if (section.isActive && !this.state.isTransitioning) {
                        this.updateCurrentSection(sectionKey);
                    }
                }
            });
        }, observerOptions);

        // Start observing all sections
        Object.values(this.sections).forEach(section => {
            this.observer.observe(section.element);
        });
    }

    updateCurrentSection(newSection) {
        if (this.state.currentSection !== newSection) {
            console.log(`Transitioning from ${this.state.currentSection} to ${newSection}`);
            this.state.currentSection = newSection;
            this.handleSectionChange();
        }
    }

    handleSectionChange() {
        // Remove all section-specific event listeners
        this.removeAllSectionListeners();

        // Setup new section-specific behaviors
        switch (this.state.currentSection) {
            case 'hero':
                this.setupHeroListeners();
                break;
            case 'info':
                this.setupInfoListeners();
                break;
            case 'mixes':
                this.setupMixesListeners();
                break;
            case 'footer':
                this.setupFooterListeners();
                this.state.isSiteUnlocked = true;
                break;
        }
    }

    setupEventListeners() {
        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.state.isSiteUnlocked) {
                if (e.key === 'ArrowDown' || e.key === 'Space') {
                    e.preventDefault();
                    this.handleSequentialNavigation();
                }
            }
        });

        // Touch events for mobile
        let touchStartY = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!this.state.isSiteUnlocked) {
                const touchEndY = e.changedTouches[0].clientY;
                const touchDiff = touchStartY - touchEndY;
                
                if (Math.abs(touchDiff) > 50) { // Minimum swipe distance
                    if (touchDiff > 0) { // Swipe up
                        this.handleSequentialNavigation();
                    }
                }
            }
        }, { passive: true });
    }

    handleSequentialNavigation() {
        const currentSection = this.sections[this.state.currentSection];
        if (currentSection && currentSection.nextSection) {
            this.proceedToSection(currentSection.nextSection);
        }
    }

    setupHeroListeners() {
        const heroElement = this.sections.hero.element;
        
        const handleHeroNavigation = (e) => {
            if (this.state.currentSection === 'hero' && !this.state.isTransitioning) {
                e.preventDefault();
                this.proceedToSection('info');
            }
        };

        // Click event
        heroElement.addEventListener('click', handleHeroNavigation);
        
        // Store listeners for cleanup
        this.currentSectionListeners = {
            click: handleHeroNavigation
        };
    }

    setupInfoListeners() {
        const infoSection = this.sections.info.element;
        const gridRows = infoSection.querySelectorAll('.grid-row');
        
        // Add visible class to each row with a delay
        gridRows.forEach((row, index) => {
            setTimeout(() => {
                row.classList.add('visible');
            }, index * 300); // 300ms delay between each row
        });
    }

    setupMixesListeners() {
        const mixItems = document.querySelectorAll('.mix-item');
        const audioPlayer = document.getElementById('mixPlayer');
        const mixesContainer = this.sections.mixes.element;

        // Show mixes container
        mixesContainer.classList.add('visible');

        mixItems.forEach(mixItem => {
            const button = mixItem.querySelector('.play-mix');
            
            const playHandler = () => {
                audioPlayer.src = mixItem.getAttribute('data-src');
                audioPlayer.play().catch(console.error);
                this.sections.footer.element.classList.remove('hidden');
                this.proceedToSection('footer');
            };

            button.addEventListener('click', playHandler);
        });
    }

    setupFooterListeners() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => 
                document.getElementById('mixPlayer').play()
            );
            navigator.mediaSession.setActionHandler('pause', () => 
                document.getElementById('mixPlayer').pause()
            );
        }
    }

    proceedToSection(sectionName) {
        if (this.state.isTransitioning) return;

        const targetSection = this.sections[sectionName];
        if (!targetSection) return;

        this.state.isTransitioning = true;

        // Add transition class if needed
        targetSection.element.classList.add('visible');
        
        // Smooth scroll to target section
        targetSection.element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });

        // Reset transition lock after animation
        setTimeout(() => {
            this.state.isTransitioning = false;
        }, 1000);

        // If we're reaching the footer, unlock the site
        if (sectionName === 'footer') {
            this.state.isSiteUnlocked = true;
            this.sections.footer.element.classList.remove('hidden');
        }
    }

    removeAllSectionListeners() {
        if (this.currentSectionListeners) {
            const currentSection = this.sections[this.state.currentSection].element;
            Object.entries(this.currentSectionListeners).forEach(([event, handler]) => {
                currentSection.removeEventListener(event, handler);
            });
            this.currentSectionListeners = null;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        const siteManager = new SiteSectionManager();
    } catch (error) {
        console.error('Failed to initialize site manager:', error);
    }
});