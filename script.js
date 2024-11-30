document.addEventListener('DOMContentLoaded', () => {
    const mixesButton = document.getElementById('mixesButton');
    const landing = document.getElementById('landing');
    const mixesList = document.getElementById('mixesList');
    const playButtons = document.querySelectorAll('.play-mix');
    const audioPlayer = document.getElementById('mixPlayer');

    mixesButton.addEventListener('click', () => {
        landing.classList.add('hidden');
        mixesList.classList.remove('hidden');
    });

    playButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mixSrc = button.getAttribute('data-src');
            audioPlayer.src = mixSrc;
            audioPlayer.play();
        });
    });
});