class SectionManager {
    constructor() {
        // Define core sections
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

        this.state = {
            currentSection: 'hero'
        };

        this.initialize();
    }

    initialize() {
        // Ensure page starts at the top
        history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        
        // Set up core navigation listeners
        this.setupNavigationListeners();
        
        // Set up mix player functionality
        this.setupMixPlayer();
    }

    setupNavigationListeners() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'Space') {
                e.preventDefault();
                this.navigateToNextSection();
            }
        });

        // Touch navigation
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

        // Hero section click
        this.sections.hero.element.addEventListener('click', () => {
            if (this.state.currentSection === 'hero') {
                this.navigateToNextSection();
            }
        });
    }

    setupMixPlayer() {
        const mixItems = document.querySelectorAll('.mix-item');
        const audioPlayer = document.getElementById('mixPlayer');

        mixItems.forEach(mixItem => {
            const button = mixItem.querySelector('.play-mix');
            
            button.addEventListener('click', () => {
                audioPlayer.src = mixItem.getAttribute('data-src');
                audioPlayer.play().catch(console.error);
                this.sections.footer.element.classList.remove('hidden');
                this.navigateToSection('footer');
            });
        });
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

        // Update current section
        this.state.currentSection = sectionName;

        // Add visibility class
        targetSection.element.classList.add('visible');
        
        // Smooth scroll to section
        targetSection.element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });

        // Show footer if needed
        if (sectionName === 'footer') {
            this.sections.footer.element.classList.remove('hidden');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        const siteManager = new SectionManager();
    } catch (error) {
        console.error('Failed to initialize site manager:', error);
    }
});