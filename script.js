document.addEventListener('DOMContentLoaded', () => {
    // Force scroll to top on page load/refresh
  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  const heroSection = document.getElementById('heroSection');
  const content = document.querySelector('.content');

  // Smooth scroll function
  function scrollToContent() {
    content.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start' 
    });
  }

  const mixesContainer = document.querySelector('.mixes-container');
  const mixItems = document.querySelectorAll('.mix-item');
  const audioPlayer = document.getElementById('mixPlayer');
  const audioPlayerElement = document.querySelector('.audio-player');

// Event listeners for hero section
  heroSection.addEventListener('click', scrollToContent);
  
  // Optional: Add scroll listener for hero section
  window.addEventListener('wheel', (e) => {
    if (window.scrollY === 0 && e.deltaY > 0) {
      e.preventDefault();
      scrollToContent();
    }
  }, { passive: false });

  // Hide scroll indicator when user scrolls
  window.addEventListener('scroll', () => {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (window.scrollY > 0) {
      scrollIndicator.style.opacity = '0';
    }
  });

  // Handle mix playback
  mixItems.forEach(mixItem => {
    const button = mixItem.querySelector('.play-mix');
    button.addEventListener('click', () => {
      const mixSrc = mixItem.getAttribute('data-src');
      audioPlayer.src = mixSrc;
      audioPlayer.play();
      audioPlayerElement.classList.remove('hidden');
    });
  });

  // Scroll visibility for mixes
  window.addEventListener('scroll', () => {
    const rect = mixesContainer.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top <= windowHeight * 0.75 && rect.bottom >= 0) {
      mixesContainer.classList.add('visible');
    }
  });
});
