document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.getElementById('heroSection');
  const mixesContainer = document.querySelector('.mixes-container');
  const mixItems = document.querySelectorAll('.mix-item');
  const audioPlayer = document.getElementById('mixPlayer');
  const audioPlayerElement = document.querySelector('.audio-player');

  // Scroll to mixes on any interaction with hero
  function scrollToMixes() {
    mixesContainer.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start' 
    });
  }

  // Add scroll trigger to hero section
  heroSection.addEventListener('click', scrollToMixes);
  heroSection.addEventListener('wheel', scrollToMixes);

  // Handle mix playback
  mixItems.forEach(mixItem => {
    mixItem.addEventListener('click', () => {
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