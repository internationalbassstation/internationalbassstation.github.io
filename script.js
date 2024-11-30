document.addEventListener('DOMContentLoaded', () => {
    const ctaButton = document.querySelector('.cta');
    const mixesContainer = document.querySelector('.mixes-container');
    const playButtons = document.querySelectorAll('.play-mix');
    const audioPlayer = document.getElementById('mixPlayer');
  
    // Smooth scroll to mixes section
    ctaButton.addEventListener('click', () => {
      mixesContainer.scrollIntoView({ behavior: 'smooth' });
    });
  
    // Handle mix playback
    playButtons.forEach(button => {
      button.addEventListener('click', () => {
        const mixSrc = button.getAttribute('data-src');
        audioPlayer.src = mixSrc;
        audioPlayer.play();
      });
    });
  
    // Add parallax effect to hero section
    window.addEventListener('scroll', () => {
      const heroElement = document.querySelector('.hero');
      heroElement.style.transform = `translateY(${window.pageYOffset * 0.5}px)`;
    });
  });