document.addEventListener('DOMContentLoaded', () => {
    // Force scroll to top on page load/refresh
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    // Initialize elements
    const heroSection = document.getElementById('heroSection');
    const content = document.querySelector('.content');
    const indicator = document.querySelector('.scroll-indicator');
    const sections = document.querySelectorAll('.grid-row');
    const footer = document.querySelector('.site-footer');

    // Animation state management
    let currentProgress = 0;
    const maxProgress = 100;
    const progressPerSecond = 25;
    const progressPerScroll = 15;
    let isLocked = true;
    let lastScrollTime = 0;
    const scrollCooldown = 200;
    let progressTimer = null;

    // Smooth scroll function
    function scrollToContent() {
        content.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    // Timer for passive progression
    const startProgressTimer = () => {
        if (progressTimer) return; // Prevent multiple timers
        
        progressTimer = setInterval(() => {
            if (currentProgress < maxProgress) {
                updateProgress(currentProgress + progressPerSecond/10);
            } else {
                clearInterval(progressTimer);
            }
        }, 100);
    };

    // Update progress and trigger animations
    const updateProgress = (newProgress) => {
        currentProgress = Math.min(newProgress, maxProgress);
        
        // Calculate which sections should be visible
        const sectionsToShow = Math.floor((currentProgress / maxProgress) * sections.length);
        
        // Show sections based on progress
        sections.forEach((section, index) => {
            if (index < sectionsToShow) {
                section.classList.add('visible');
            }
        });

        // Check if we've reached max progress
        if (currentProgress >= maxProgress && isLocked) {
            isLocked = false;
            indicator.classList.remove('visible');
            enableMixScroll();
        }
    };

    // Handle mix playback
    const mixItems = document.querySelectorAll('.mix-item');
    const audioPlayer = document.getElementById('mixPlayer');
    const audioPlayerElement = document.querySelector('.audio-player');

    mixItems.forEach(mixItem => {
        const button = mixItem.querySelector('.play-mix');
        button.addEventListener('click', () => {
            const mixSrc = mixItem.getAttribute('data-src');
            audioPlayer.src = mixSrc;
            audioPlayer.play();
            audioPlayerElement.classList.remove('hidden');
        });
    });

    // Enable scrolling to mix section
    const enableMixScroll = () => {
        const mixesSection = document.querySelector('.mixes-container');
        document.addEventListener('wheel', (e) => {
            if (!isLocked && e.deltaY > 0) {
                mixesSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, { once: true });
    };

    // Event listeners
    heroSection.addEventListener('click', () => {
        scrollToContent();
        indicator.classList.add('visible');
        startProgressTimer();
    });

    window.addEventListener('wheel', (e) => {
        const now = Date.now();
        
        // Initial scroll to info section
        if (window.scrollY === 0 && e.deltaY > 0) {
            e.preventDefault();
            scrollToContent();
            indicator.classList.add('visible');
            startProgressTimer();
            return;
        }

        // Handle scroll during locked state
        if (isLocked && window.scrollY > 0) {
            e.preventDefault();
            
            // Add scroll progress if cooldown has passed
            if (now - lastScrollTime > scrollCooldown) {
                updateProgress(currentProgress + progressPerScroll);
                lastScrollTime = now;
            }
        }
    }, { passive: false });


    // Countdown timer functionality
    function getNextFriday10PM() {
        const now = new Date();
        const nextFriday = new Date();
        nextFriday.setDate(now.getDate() + ((7 - now.getDay() + 5) % 7));
        nextFriday.setHours(22, 0, 0, 0);
        
        if (nextFriday <= now) {
            nextFriday.setDate(nextFriday.getDate() + 7);
        }
        
        return nextFriday;
    }

    function updateCountdown() {
        const now = new Date();
        const nextFriday = getNextFriday10PM();
        const countdownElement = document.getElementById('countdown');
        const isFriday = now.getDay() === 5;
        const hour = now.getHours();
        const isShowTime = isFriday && hour === 22;
        
        if (isShowTime) {
            countdownElement.textContent = 'BASS STATION ACTIVE';
            countdownElement.style.color = '#ff0000';
        } else {
            const diff = nextFriday - now;

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            countdownElement.style.color = 'rgba(0, 123, 255, 1)';
        }
    }

    // Update countdown every second
    setInterval(updateCountdown, 1000);
    // Initial call to avoid delay
    updateCountdown();

    // Scroll visibility for mixes
    const mixesContainer = document.querySelector('.mixes-container');
    window.addEventListener('scroll', () => {
        const rect = mixesContainer.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top <= windowHeight * 0.75 && rect.bottom >= 0) {
            mixesContainer.classList.add('visible');
        }
    });
    mixItems.forEach(mixItem => {
      const button = mixItem.querySelector('.play-mix');
      button.addEventListener('click', () => {
          const mixSrc = mixItem.getAttribute('data-src');
          audioPlayer.src = mixSrc;
          audioPlayer.play();
          footer.classList.remove('hidden');
      });
  });
  
  // Show footer on scroll to bottom
  window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      if (scrollPosition >= documentHeight - 50) { // -50 to trigger slightly before absolute bottom
          footer.classList.remove('hidden');
      }
  });
  
});