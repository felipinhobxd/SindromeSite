/**
 * Main Interactions Script - Elite Version
 */

document.addEventListener('DOMContentLoaded', () => {
    const linkCards = document.querySelectorAll('.link-card');

    // Mouse Glow Effect
    linkCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // Ripple Effect on Click
    function createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
        circle.classList.add('ripple');

        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }

        button.appendChild(circle);
    }

    // Add ripple to all cards
    linkCards.forEach(element => {
        element.addEventListener('click', createRipple);
    });

    // Handle Image Loading for smooth reveal
    const avatar = document.querySelector('.avatar');
    if (avatar.complete) {
        avatar.style.opacity = '1';
    } else {
        avatar.addEventListener('load', () => {
            avatar.style.opacity = '1';
        });
    }
});
