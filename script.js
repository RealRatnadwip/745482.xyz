// some numbers carry more information than others
const registry = [
    "745482",
    "786482"
];

const metadata = {
    owner: "RealRatnadwip",
    visibility: "public",
    meaning: "private"
};

console.info("Some numbers carry more information than others.");

document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const grid = document.querySelector('.subdomain-grid');
    const consoleEl = document.getElementById('meta-console');
    const consoleBody = document.getElementById('console-body');
    const consoleTitle = document.getElementById('console-title');
    const closeBtn = document.getElementById('console-close-btn');

    const btnNetwork = document.getElementById('meta-btn-network');
    const btnColor = document.getElementById('meta-btn-color');
    const btnType = document.getElementById('meta-btn-type');

    window.initGitHubTelemetry('last-updated-time');

    // Fetch and render subdomains
    window.fetchAndParseSubdomains('./subdomain.md')
        .then(subdomains => {
            if (subdomains.length > 0 && grid) {
                const fragment = document.createDocumentFragment();
                subdomains.forEach(sub => {
                    const card = document.createElement('a');
                    card.className = `subdomain-card ${sub.status}`;
                    if (sub.status === 'active') {
                        card.href = `https://${sub.host}`;
                        card.target = '_blank';
                        card.rel = 'noopener';
                    } else {
                        card.style.cursor = 'default';
                    }
                    card.innerHTML = `
                        <div class="card-header">
                            <div class="url-group">
                                <span class="subdomain-url-full">${sub.host}</span>
                                <span class="subdomain-url-short">${sub.name}</span>
                                <span class="status-badge status-${sub.status}">${sub.status === 'comingsoon' ? 'coming soon' : sub.status}</span>
                            </div>
                            ${sub.status === 'active' ? '<span class="arrow-icon">→</span>' : ''}
                        </div>
                        <p class="subdomain-desc">${sub.desc}</p>
                        <div class="card-footer-author" style="margin-top: 0.5rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.7rem; color: var(--color-text-muted); font-family: var(--font-mono);">
                            <span>by ${sub.contactName}</span>
                        </div>
                    `;
                    fragment.appendChild(card);
                });
                grid.innerHTML = ''; // Clear fallback
                grid.appendChild(fragment);

                // Initialize shared sponsored banners
                window.initSponsoredBanners(subdomains);
            }
        })
        .catch(error => console.error('Error fetching subdomains:', error));

    // Interactive Metadata Terminal Console Logic
    let activeTab = null;
    let currentAnimationId = 0;
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function clearActiveButtons() {
        btnNetwork.classList.remove('active');
        btnColor.classList.remove('active');
        btnType.classList.remove('active');
    }

    function closeTerminal() {
        currentAnimationId++; // Cancels any running animation loop
        consoleEl.classList.remove('active');
        document.body.classList.remove('console-active');
        clearActiveButtons();
        activeTab = null;
        consoleBody.innerHTML = '';
    }

    closeBtn.addEventListener('click', closeTerminal);

    async function animateTerminalText(title, lines) {
        const animId = ++currentAnimationId; // Increment and lock this run ID
        consoleTitle.textContent = title;
        consoleEl.classList.add('active');
        document.body.classList.add('console-active');
        consoleBody.innerHTML = '';

        // Create terminal input command line
        const cmdLine = document.createElement('div');
        cmdLine.style.color = 'var(--color-text-primary)';
        cmdLine.style.marginBottom = '0.5rem';
        consoleBody.appendChild(cmdLine);

        const command = lines[0];

        // Type out user command
        for (let i = 0; i < command.length; i++) {
            if (currentAnimationId !== animId) return; // Abort if user switched tabs
            cmdLine.textContent += command[i];
            await sleep(25);
        }

        // Render terminal response lines
        for (let outIdx = 1; outIdx < lines.length; outIdx++) {
            if (currentAnimationId !== animId) return; // Abort if user switched tabs
            const logLine = document.createElement('div');
            const lineText = lines[outIdx];
            logLine.textContent = lineText;

            if (lineText.startsWith('STATUS:') || lineText.startsWith('PING OK:')) {
                logLine.style.color = 'var(--color-accent)';
                logLine.style.fontWeight = '500';
            } else if (lineText.startsWith('●')) {
                logLine.style.color = '#4caf50'; // active state green
            } else if (lineText.includes('"swatch"')) {
                logLine.innerHTML = lineText.replace(/"(█+)"/, '"<span style=\'color: var(--color-accent);\'>$1</span>"');
            }

            consoleBody.appendChild(logLine);
            consoleBody.scrollTop = consoleBody.scrollHeight;
            await sleep(60);
        }

        if (currentAnimationId !== animId) return;

        // Render static caret blinking cursor
        const cursor = document.createElement('span');
        cursor.className = 'console-cursor';
        consoleBody.appendChild(cursor);
    }

    btnNetwork.addEventListener('click', () => {
        if (activeTab === 'network') {
            closeTerminal();
            return;
        }
        clearActiveButtons();
        btnNetwork.classList.add('active');
        activeTab = 'network';

        const lines = [
            '$ traceroute 745482.xyz',
            'traceroute to 745482.xyz (185.199.108.153), 30 hops max',
            ' 1  client.local (192.168.1.1)  0.72 ms',
            ' 2  gateway.isp.net (10.0.0.1)  2.15 ms',
            ' 3  745482.ratnadwip.com (172.16.42.1)  7.45 ms',
            ' 4  745482.xyz (185.199.108.153)  11.89 ms',
            ' ',
            'STATUS: Connection secure. Route active via TLS 1.3.',
            'PING OK: RTT min/avg/max = 11.2/11.8/12.4 ms'
        ];
        animateTerminalText('network_traceroute.sh', lines);
    });

    btnColor.addEventListener('click', () => {
        if (activeTab === 'color') {
            closeTerminal();
            return;
        }
        clearActiveButtons();
        btnColor.classList.add('active');
        activeTab = 'color';

        const lines = [
            '$ cat color_telemetry.json',
            '{',
            '  "hex": "#745482",',
            '  "rgb": "rgb(116, 84, 130)",',
            '  "hsl": "hsl(282, 22%, 42%)",',
            '  "cmyk": "cmyk(11%, 35%, 0%, 49%)",',
            '  "oklch": "oklch(0.446, 0.088, 318.5)",',
            '  "swatch": "████████████████"',
            '}'
        ];
        animateTerminalText('color_telemetry.sh', lines);
    });

    btnType.addEventListener('click', () => {
        if (activeTab === 'type') {
            closeTerminal();
            return;
        }
        clearActiveButtons();
        btnType.classList.add('active');
        activeTab = 'type';

        const lines = [
            '$ systemctl status static_node.service',
            '● static_node.service - 745482.xyz Static Web Node',
            '   Loaded: loaded (/etc/systemd/system/static_node.service; enabled)',
            '   Active: active (running) since ' + new Date().toDateString(),
            '   Process: Web Core loaded (Vanilla HTML5 / Modern CSS)',
            '   Handshake: HTTP/2 over HTTPS',
            '   SSL Engine: Let\'s Encrypt TLS 1.3',
            '   Uptime: 99.98% (Continuous deployment)',
            ' ',
            'STATUS: Node fully healthy. Response time: nominal.'
        ];
        animateTerminalText('system_diagnostics.sh', lines);
    });
});
