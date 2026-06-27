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
    const yearEl = document.getElementById('current-year');
    const follower = document.getElementById('cursor-follower');
    const grid = document.querySelector('.subdomain-grid');
    const consoleEl = document.getElementById('meta-console');
    const consoleBody = document.getElementById('console-body');
    const consoleTitle = document.getElementById('console-title');
    const closeBtn = document.getElementById('console-close-btn');

    const btnNetwork = document.getElementById('meta-btn-network');
    const btnColor = document.getElementById('meta-btn-color');
    const btnType = document.getElementById('meta-btn-type');

    // Update footer copyright year dynamically
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Performance-optimized Cursor Follower Logic (throttled with requestAnimationFrame)
    if (follower) {
        let mouseX = 0, mouseY = 0;
        let pendingUpdate = false;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!pendingUpdate) {
                pendingUpdate = true;
                requestAnimationFrame(() => {
                    follower.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate3d(-50%, -50%, 0)`;
                    pendingUpdate = false;
                });
            }
        });
    }

    // Dynamically fetch and render subdomains from subdomain.md with DocumentFragment
    fetch('./subdomain.md')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        })
        .then(data => {
            const subdomains = data.split(/\r?\n/)
                .map(line => line.trim())
                .filter(Boolean)
                .map(line => {
                    const idx = line.indexOf(' - ');
                    if (idx === -1) return null;
                    const host = line.substring(0, idx).trim();

                    // Only match actual subdomains to exclude templates or other lines
                    const hostRegex = /^[a-zA-Z0-9.-]+\.745482\.xyz$/;
                    if (!hostRegex.test(host)) return null;

                    let desc = line.substring(idx + 3).trim();

                    let status = 'active'; // Default
                    const lowerDesc = desc.toLowerCase();
                    if (lowerDesc.includes('*active')) {
                        status = 'active';
                        desc = desc.replace(/\*[Aa]ctive/g, '').trim();
                    } else if (lowerDesc.includes('*inactive')) {
                        status = 'inactive';
                        desc = desc.replace(/\*[Ii]nactive/g, '').trim();
                    } else if (/\*(maintanance|maintenance|maintance)/i.test(lowerDesc)) {
                        status = 'maintenance';
                        desc = desc.replace(/\*(maintanance|maintenance|maintance)/gi, '').trim();
                    }
                    return { host, desc, status };
                })
                .filter(item => item && item.host && item.desc);

            if (subdomains.length > 0 && grid) {
                const fragment = document.createDocumentFragment();
                subdomains.forEach(sub => {
                    const card = document.createElement('a');
                    card.className = 'subdomain-card';
                    if (sub.status === 'active') {
                        card.href = `https://${sub.host}`;
                        card.target = '_blank';
                        card.rel = 'noopener';
                    } else {
                        card.classList.add(sub.status);
                        card.style.cursor = 'default';
                    }
                    card.innerHTML = `
                        <div class="card-header">
                            <div class="url-group">
                                <span class="subdomain-url">${sub.host}</span>
                                <span class="status-badge status-${sub.status}">${sub.status}</span>
                            </div>
                            ${sub.status === 'active' ? '<span class="arrow-icon">→</span>' : ''}
                        </div>
                        <p class="subdomain-desc">${sub.desc}</p>
                    `;
                    fragment.appendChild(card);
                });
                grid.innerHTML = ''; // Clear fallback
                grid.appendChild(fragment);
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

    // Dynamically fetch last commit time from GitHub API
    const lastUpdatedEl = document.getElementById('last-updated-time');
    if (lastUpdatedEl) {
        fetch('https://api.github.com/repos/RealRatnadwip/745482.xyz/commits?per_page=1')
            .then(response => {
                if (!response.ok) throw new Error('Network response not ok');
                return response.json();
            })
            .then(data => {
                if (data && data.length > 0) {
                    const commitDateStr = data[0].commit.committer.date;
                    const commitDate = new Date(commitDateStr);
                    // Format commit date as a friendly string in UTC timezone
                    const options = {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        timeZone: 'UTC',
                        timeZoneName: 'short'
                    };
                    const formattedDate = commitDate.toLocaleDateString('en-US', options);
                    lastUpdatedEl.textContent = `Last Updated: ${formattedDate}`;
                } else {
                    lastUpdatedEl.textContent = '';
                }
            })
            .catch(error => {
                console.error('Error fetching last commit:', error);
                lastUpdatedEl.textContent = ''; // Hide or show fallback on error
            });
    }
});
