document.addEventListener('DOMContentLoaded', () => {
    const logoElement = document.querySelector('.logo');
    if (logoElement) {
        let clickHistory = [];
        logoElement.addEventListener('click', () => {
            const timestamp = Date.now();
            clickHistory.push(timestamp);
            clickHistory = clickHistory.filter(time => timestamp - time <= 6000);
            if (clickHistory.length >= 20) {
                window.location.href = './694';
            }
        });
    }

    const grid = document.querySelector('.subdomain-grid');
    const terminalElement = document.getElementById('meta-console');
    const terminalBody = document.getElementById('console-body');
    const terminalTitle = document.getElementById('console-title');
    const terminalCloseButton = document.getElementById('console-close-btn');

    const buttonNetwork = document.getElementById('meta-btn-network');
    const buttonColor = document.getElementById('meta-btn-color');
    const buttonType = document.getElementById('meta-btn-type');

    window.initGitHubTelemetry('last-updated-time');

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
                grid.innerHTML = '';
                grid.appendChild(fragment);

                window.initSponsoredBanners(subdomains);
            }
        })
        .catch(error => console.error('Subdomain processing failed:', error));

    let activeTabId = null;
    let animationSessionId = 0;
    const sleep = (durationMs) => new Promise(resolve => setTimeout(resolve, durationMs));

    function clearActiveTabButtons() {
        [buttonNetwork, buttonColor, buttonType].forEach(button => {
            if (button) button.classList.remove('active');
        });
    }

    function closeTerminal() {
        animationSessionId++;
        if (terminalElement) terminalElement.classList.remove('active');
        document.body.classList.remove('console-active');
        clearActiveTabButtons();
        activeTabId = null;
        if (terminalBody) terminalBody.innerHTML = '';
    }

    if (terminalCloseButton) {
        terminalCloseButton.addEventListener('click', closeTerminal);
    }

    async function writeTerminalOutput(filename, outputLines) {
        const currentSessionId = ++animationSessionId;
        if (terminalTitle) terminalTitle.textContent = filename;
        if (terminalElement) terminalElement.classList.add('active');
        document.body.classList.add('console-active');
        if (terminalBody) terminalBody.innerHTML = '';

        const inputCommandRow = document.createElement('div');
        inputCommandRow.style.color = 'var(--color-text-primary)';
        inputCommandRow.style.marginBottom = '0.5rem';
        if (terminalBody) terminalBody.appendChild(inputCommandRow);

        const commandString = outputLines[0];
        for (let i = 0; i < commandString.length; i++) {
            if (animationSessionId !== currentSessionId) return;
            inputCommandRow.textContent += commandString[i];
            await sleep(25);
        }

        for (let j = 1; j < outputLines.length; j++) {
            if (animationSessionId !== currentSessionId) return;
            const logRow = document.createElement('div');
            const lineText = outputLines[j];
            logRow.textContent = lineText;

            if (lineText.startsWith('STATUS:') || lineText.startsWith('PING OK:')) {
                logRow.style.color = 'var(--color-accent)';
                logRow.style.fontWeight = '500';
            } else if (lineText.startsWith('●')) {
                logRow.style.color = '#4caf50';
            } else if (lineText.includes('"swatch"')) {
                logRow.innerHTML = lineText.replace(/"(█+)"/, '"<span style=\'color: var(--color-accent);\'>$1</span>"');
            }

            if (terminalBody) {
                terminalBody.appendChild(logRow);
                terminalBody.scrollTop = terminalBody.scrollHeight;
            }
            await sleep(60);
        }

        if (animationSessionId !== currentSessionId) return;

        const cursorSpan = document.createElement('span');
        cursorSpan.className = 'console-cursor';
        if (terminalBody) terminalBody.appendChild(cursorSpan);
    }

    const terminalTabConfigs = [
        {
            button: buttonNetwork,
            id: 'network',
            filename: 'network_traceroute.sh',
            getLines: () => [
                '$ traceroute 745482.xyz',
                'traceroute to 745482.xyz (185.199.108.153), 30 hops max',
                ' 1  client.local (192.168.1.1)  0.72 ms',
                ' 2  gateway.isp.net (10.0.0.1)  2.15 ms',
                ' 3  gateway.745482.xyz (172.16.42.1)  7.45 ms',
                ' 4  745482.xyz (185.199.108.153)  11.89 ms',
                ' ',
                'STATUS: Connection secure. Route active via TLS 1.3.',
                'PING OK: RTT min/avg/max = 11.2/11.8/12.4 ms'
            ]
        },
        {
            button: buttonColor,
            id: 'color',
            filename: 'color_telemetry.sh',
            getLines: () => [
                '$ cat color_telemetry.json',
                '{',
                '  "hex": "#745482",',
                '  "rgb": "rgb(116, 84, 130)",',
                '  "hsl": "hsl(282, 22%, 42%)",',
                '  "cmyk": "cmyk(11%, 35%, 0%, 49%)",',
                '  "oklch": "oklch(0.446, 0.088, 318.5)",',
                '  "swatch": "████████████████"',
                '}'
            ]
        },
        {
            button: buttonType,
            id: 'type',
            filename: 'system_diagnostics.sh',
            getLines: () => [
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
            ]
        }
    ];

    terminalTabConfigs.forEach(config => {
        if (config.button) {
            config.button.addEventListener('click', () => {
                if (activeTabId === config.id) {
                    closeTerminal();
                    return;
                }
                clearActiveTabButtons();
                config.button.classList.add('active');
                activeTabId = config.id;
                writeTerminalOutput(config.filename, config.getLines());
            });
        }
    });
});
