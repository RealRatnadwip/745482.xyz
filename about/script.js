document.addEventListener('DOMContentLoaded', () => {
    // Interactive Color Selector logic
    const colorSelectors = document.querySelectorAll('.color-selector');
    colorSelectors.forEach(selector => {
        selector.addEventListener('click', () => {
            colorSelectors.forEach(s => s.classList.remove('active'));
            selector.classList.add('active');

            const color = selector.getAttribute('data-color');
            const rgb = selector.getAttribute('data-rgb');
            const glow = selector.getAttribute('data-glow');
            const muted = selector.getAttribute('data-muted');

            // Apply variables to root style
            document.documentElement.style.setProperty('--color-accent', color);
            document.documentElement.style.setProperty('--color-accent-rgb', rgb);
            document.documentElement.style.setProperty('--color-accent-glow', glow);
            document.documentElement.style.setProperty('--color-accent-muted', muted);
        });
    });

});
