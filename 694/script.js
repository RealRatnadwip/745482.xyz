document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('selectstart', event => event.preventDefault());
document.addEventListener('dragstart', event => event.preventDefault());

document.addEventListener('keydown', event => {
    if (event.key === 'F12' || 
        (event.ctrlKey && event.shiftKey && ['I', 'J', 'C'].includes(event.key)) || 
        (event.ctrlKey && event.key === 'U')) {
        event.preventDefault();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const initialMessage = document.getElementById('initial-msg');
    const displayContainer = document.getElementById('combo-container');
    const displayWord = document.getElementById('combo-word');
    const displayNumber = document.getElementById('combo-number');
    const overlay = document.getElementById('fade-overlay');

    const columnGroups = [
        ['P', 'Q', 'R', 'S'],
        ['G', 'H', 'I'],
        ['J', 'K', 'L'],
        ['G', 'H', 'I'],
        ['T', 'U', 'V'],
        ['A', 'B', 'C']
    ];

    const generateCombinations = (arrays) => {
        return arrays.reduce((accumulator, currentArray) => {
            return accumulator.flatMap(prefix => currentArray.map(element => prefix + element));
        }, ['']);
    };

    const sequenceList = generateCombinations(columnGroups);
    const sequenceLength = sequenceList.length;
    const tickIntervalMs = 18;

    setTimeout(() => {
        if (initialMessage) {
            initialMessage.style.display = 'none';
        }
        if (displayContainer) {
            displayContainer.style.display = 'flex';
        }

        let currentIndex = 0;

        function renderFrame() {
            if (currentIndex < sequenceLength) {
                const currentWord = sequenceList[currentIndex];
                if (displayWord) {
                    displayWord.textContent = currentWord;
                }
                if (displayNumber) {
                    displayNumber.textContent = String(currentIndex + 1).padStart(4, '0');
                }


                currentIndex++;
                setTimeout(renderFrame, tickIntervalMs);
            } else {
                setTimeout(() => {
                    if (overlay) {
                        overlay.style.opacity = '1';
                    }
                    setTimeout(() => {
                        window.location.href = '../';
                    }, 2000);
                }, 2000);
            }
        }

        renderFrame();
    }, 1500);
});
