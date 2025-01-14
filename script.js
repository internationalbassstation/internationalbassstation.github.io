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

// Add this to your script.js file

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
  
  // Check if it's currently show time (Friday 10-11 PM)
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