class SiteSectionManager {
      constructor() {
          this.sections = {
              hero: {
                  element: document.getElementById('hero-container'),
                  isComplete: false,
                  next: 'info'
              },
              info: {
                  element: document.querySelector('.info-container'),
                  isComplete: false,
                  next: 'mixes'
              },
              mixes: {
                  element: document.querySelector('.mixes-container'),
                  isComplete: false,
                  next: 'footer'
              },
              footer: {
                  element: document.querySelector('.site-footer'),
                  isComplete: false,
                  next: null
              }
          };
          
          this.currentSection = 'hero';
          this.progressState = {
              current: 0,
              max: 100,
              rate: 25,
              interactionIncrement: 15
          };
          
          this.interactionState = {
              startY: 0,
              lastInteractionTime: 0,
              isTouching: false,
              cooldownPeriod: 200,
              interactionThreshold: 10,
              touchStartTime: 0,
              isScrolling: false
          };
          
          this.initialize();
      }
      
      initialize() {
          history.scrollRestoration = 'manual';
          window.scrollTo(0, 0);
          
          this.setupEventListeners();
          this.startCountdownTimer();
          
          // Handle resize events for responsive layouts
          this.handleResize = this.handleResize.bind(this);
          window.addEventListener('resize', this.debounce(this.handleResize, 250));
          this.handleResize();
      }
      
      debounce(func, wait) {
          let timeout;
          return function executedFunction(...args) {
              const later = () => {
                  clearTimeout(timeout);
                  func(...args);
              };
              clearTimeout(timeout);
              timeout = setTimeout(later, wait);
          };
      }
      
      handleResize() {
          // Adjust section heights if needed
          const vh = window.innerHeight;
          document.documentElement.style.setProperty('--vh', `${vh}px`);
      }
      
      setupEventListeners() {
          // Universal interaction handler for hero section
          this.sections.hero.element.addEventListener('pointerdown', (e) => {
              e.preventDefault();
              this.proceedToSection('info');
          });
          
          // Touch-specific handling for hero section
          if ('ontouchstart' in window) {
              this.sections.hero.element.addEventListener('touchend', (e) => {
                  e.preventDefault();
                  this.proceedToSection('info');
              });
          }
          
          this.setupInfoSectionInteractions();
          this.setupAudioControls();
          this.setupVisibilityHandling();
          this.setupScrollHandling();
      }
      
      setupInfoSectionInteractions() {
          const infoSection = this.sections.info.element;
          
          // Touch events with improved handling
          infoSection.addEventListener('touchstart', (e) => {
              if (this.currentSection === 'info' && !this.sections.info.isComplete) {
                  this.interactionState.isTouching = true;
                  this.interactionState.startY = e.touches[0].clientY;
                  this.interactionState.touchStartTime = Date.now();
                  this.interactionState.isScrolling = false;
              }
          }, { passive: true });
          
          infoSection.addEventListener('touchmove', (e) => {
              if (!this.interactionState.isTouching || this.sections.info.isComplete) return;
              
              const currentY = e.touches[0].clientY;
              const deltaY = this.interactionState.startY - currentY;
              const timeDiff = Date.now() - this.interactionState.touchStartTime;
              
              // Determine if user is trying to scroll or interact
              if (timeDiff > 100 && !this.interactionState.isScrolling) {
                  this.interactionState.isScrolling = Math.abs(deltaY) > 10;
              }
              
              if (this.interactionState.isScrolling && Math.abs(deltaY) > this.interactionState.interactionThreshold) {
                  this.handleInteraction(deltaY > 0);
                  this.interactionState.startY = currentY;
              }
          }, { passive: true });
          
          infoSection.addEventListener('touchend', () => {
              this.interactionState.isTouching = false;
          });
          
          // Mouse wheel with improved handling
          infoSection.addEventListener('wheel', (e) => {
              if (this.currentSection === 'info' && !this.sections.info.isComplete) {
                  e.preventDefault();
                  this.handleInteraction(e.deltaY > 0);
              }
          }, { passive: false });
          
          // Keyboard navigation
          document.addEventListener('keydown', (e) => {
              if (this.currentSection === 'info') {
                  if (!this.sections.info.isComplete && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                      e.preventDefault();
                      this.handleInteraction(e.key === 'ArrowDown');
                  } else if (this.sections.info.isComplete && e.key === 'ArrowDown') {
                      e.preventDefault();
                      this.proceedToSection('mixes');
                  }
              }
          });
      }
      
      handleInteraction(isForward) {
          const now = Date.now();
          if (now - this.interactionState.lastInteractionTime < this.interactionState.cooldownPeriod) {
              return;
          }
          
          if (isForward && !this.sections.info.isComplete) {
              this.updateProgress(this.progressState.current + this.progressState.interactionIncrement);
          }
          this.interactionState.lastInteractionTime = now;
      }
      
      proceedToSection(sectionName) {
          const section = this.sections[sectionName];
          if (!section) return;
          
          // Use smooth scroll with fallback
          if ('scrollBehavior' in document.documentElement.style) {
              section.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
              section.element.scrollIntoView(true);
          }
          
          this.currentSection = sectionName;
          
          if (sectionName === 'info') {
              this.startProgressTimer();
          } else if (sectionName === 'mixes') {
              this.enableMixesSection();
          } else if (sectionName === 'footer') {
              this.sections.footer.element.classList.remove('hidden');
          }
      }
      
      updateProgress(newProgress) {
          this.progressState.current = Math.min(newProgress, this.progressState.max);
          
          const infoRows = document.querySelectorAll('.grid-row');
          const rowsToShow = Math.floor((this.progressState.current / this.progressState.max) * infoRows.length);
          
          infoRows.forEach((row, index) => {
              if (index < rowsToShow) {
                  row.classList.add('visible');
              }
          });
          
          if (this.progressState.current >= this.progressState.max) {
              this.sections.info.isComplete = true;
              this.enableMixesSection();
          }
      }
      
      setupVisibilityHandling() {
          document.addEventListener('visibilitychange', () => {
              if (document.hidden) {
                  this.pauseProgressTimer();
              } else if (this.currentSection === 'info' && !this.sections.info.isComplete) {
                  this.startProgressTimer();
              }
          });
      }
      
      setupScrollHandling() {
          let lastScrollPosition = 0;
          let ticking = false;
          
          window.addEventListener('scroll', () => {
              lastScrollPosition = window.scrollY;
              
              if (!ticking) {
                  window.requestAnimationFrame(() => {
                      this.handleScroll(lastScrollPosition);
                      ticking = false;
                  });
                  ticking = true;
              }
          }, { passive: true });
      }
      
      handleScroll(scrollPosition) {
          const scrollBottom = scrollPosition + window.innerHeight;
          const docHeight = document.documentElement.scrollHeight;
          
          if (scrollBottom >= docHeight - 50) {
              this.sections.footer.element.classList.remove('hidden');
              this.currentSection = 'footer';
          }
      }
      
      setupAudioControls() {
          const mixItems = document.querySelectorAll('.mix-item');
          const audioPlayer = document.getElementById('mixPlayer');
          
          mixItems.forEach(mixItem => {
              const button = mixItem.querySelector('.play-mix');
              button.addEventListener('pointerdown', () => {
                  audioPlayer.src = mixItem.getAttribute('data-src');
                  
                  const playPromise = audioPlayer.play();
                  if (playPromise !== undefined) {
                      playPromise.catch(error => {
                          if (error.name === 'NotAllowedError') {
                              console.log('Autoplay blocked - user interaction required');
                          }
                      });
                  }
                  
                  this.sections.footer.element.classList.remove('hidden');
                  this.currentSection = 'footer';
              });
          });
          
          if ('mediaSession' in navigator) {
              navigator.mediaSession.setActionHandler('play', () => audioPlayer.play());
              navigator.mediaSession.setActionHandler('pause', () => audioPlayer.pause());
          }
      }
      
      startProgressTimer() {
          if (this._progressTimer) return;
          
          this._progressTimer = setInterval(() => {
              if (this.progressState.current < this.progressState.max) {
                  this.updateProgress(this.progressState.current + this.progressState.rate/10);
              } else {
                  this.pauseProgressTimer();
              }
          }, 100);
      }
      
      pauseProgressTimer() {
          if (this._progressTimer) {
              clearInterval(this._progressTimer);
              this._progressTimer = null;
          }
      }
      
      enableMixesSection() {
          this.sections.mixes.element.classList.add('visible');
          const pastVoyages = document.querySelector('.past-voyages');
          pastVoyages?.classList.add('flash');
          setTimeout(() => {
              pastVoyages?.classList.remove('flash');
          }, 1000);
      }
      
      startCountdownTimer() {
          const updateCountdown = () => {
              const now = new Date();
              const nextFriday = this.getNextFriday10PM();
              const countdownElement = document.getElementById('countdown');
              
              if (!countdownElement) return;
              
              if (now.getDay() === 5 && now.getHours() === 22) {
                  countdownElement.textContent = 'BASS STATION ACTIVE';
                  countdownElement.style.color = '#ff0000';
              } else {
                  const diff = nextFriday - now;
                  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                  
                  countdownElement.textContent = `${days}D ${hours}H ${minutes}M ${seconds}S`;
                  countdownElement.style.color = 'rgba(239, 36, 170, 1)';
              }
          };
          
          setInterval(updateCountdown, 1000);
          updateCountdown();
      }
    
    getNextFriday10PM() {
        const now = new Date();
        const nextFriday = new Date();
        nextFriday.setDate(now.getDate() + ((7 - now.getDay() + 5) % 7));
        nextFriday.setHours(22, 0, 0, 0);
        
        if (nextFriday <= now) {
            nextFriday.setDate(nextFriday.getDate() + 7);
        }
        
        return nextFriday;
    }
}

// Initialize with error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        const siteManager = new SiteSectionManager();
    } catch (error) {
        console.error('Failed to initialize site manager:', error);
    }
});