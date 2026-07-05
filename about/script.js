document.addEventListener('DOMContentLoaded', () => {
    const selectors = document.querySelectorAll('.color-selector');
    selectors.forEach(selector => {
        selector.addEventListener('click', () => {
            selectors.forEach(item => item.classList.remove('active'));
            selector.classList.add('active');

            const rootStyle = document.documentElement.style;
            rootStyle.setProperty('--color-accent', selector.getAttribute('data-color'));
            rootStyle.setProperty('--color-accent-rgb', selector.getAttribute('data-rgb'));
            rootStyle.setProperty('--color-accent-glow', selector.getAttribute('data-glow'));
            rootStyle.setProperty('--color-accent-muted', selector.getAttribute('data-muted'));
        });
    });
});
