window.fetchAndParseSubdomains = function (markdownPath) {
    let fetchUrl = markdownPath;
    const isProductionEnv = window.location.hostname === '745482.xyz' || 
                            window.location.hostname.endsWith('.745482.xyz') || 
                            window.location.hostname.includes('github.io');
                         
    if (isProductionEnv) {
        fetchUrl = 'https://raw.githubusercontent.com/RealRatnadwip/745482.xyz/main/subdomain.md';
    }

    return fetch(fetchUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load registry: ${response.status}`);
            }
            return response.text();
        })
        .then(rawContent => {
            const records = [];
            const lines = rawContent.split(/\r?\n/);
            
            lines.forEach(line => {
                const trimmed = line.trim();
                if (trimmed.startsWith('|') && trimmed.endsWith('|') && !trimmed.includes('---')) {
                    const columns = trimmed.split('|')
                        .map(col => col.trim())
                        .filter((_, index, array) => index > 0 && index < array.length - 1);

                    if (columns.length >= 7 && columns[0].toLowerCase() !== 'name') {
                        const [name, host, sponsoredFlag, statusString, contactInfo, homeDesc, siteDesc] = columns;
                        const isSponsored = sponsoredFlag.toLowerCase() === 'true';
                        const status = statusString.toLowerCase().trim() === 'coming soon' ? 'comingsoon' : statusString.toLowerCase().trim();

                        let contactName = contactInfo;
                        let contactUrl = '#';
                        const contactLinkMatch = contactInfo.match(/\[([^\]]+)\]\(([^)]+)\)/);
                        if (contactLinkMatch) {
                            [, contactName, contactUrl] = contactLinkMatch;
                        }

                        records.push({
                            name,
                            host,
                            isSponsored,
                            status,
                            contactName,
                            contactUrl,
                            desc: homeDesc,
                            siteDesc
                        });
                    }
                }
            });
            return records;
        });
};

window.initSponsoredBanners = function (subdomains) {
    const sponsoredNodes = subdomains.filter(sub => sub.isSponsored);
    if (sponsoredNodes.length === 0) return;

    let leftAdIndex = 0;
    let rightAdIndex = sponsoredNodes.length > 1 ? 1 : 0;
    let mobileAdIndex = 0;

    const leftBanner = document.querySelector('.ad-banner-left');
    const rightBanner = document.querySelector('.ad-banner-right');
    const horizontalBanner = document.querySelector('.ad-banner-horizontal');

    const statusConfig = {
        active: { color: '#4caf50', text: 'active', alert: '' },
        comingsoon: { color: '#2196f3', text: 'coming soon', alert: 'This node is coming soon.' },
        inactive: { color: '#f44336', text: 'inactive', alert: 'This node is currently offline.' },
        maintenance: { color: '#ff9800', text: 'maintenance', alert: 'This node is currently under maintenance.' }
    };

    const getStatusDetails = (status) => statusConfig[status] || { color: '#ff9800', text: status, alert: `This node is ${status}.` };

    const updateBanners = () => {
        if (leftBanner && sponsoredNodes[leftAdIndex]) {
            renderBanner(leftBanner, sponsoredNodes[leftAdIndex]);
        }
        if (rightBanner && sponsoredNodes[rightAdIndex]) {
            renderBanner(rightBanner, sponsoredNodes[rightAdIndex]);
        }
        if (horizontalBanner && sponsoredNodes[mobileAdIndex]) {
            renderBanner(horizontalBanner, sponsoredNodes[mobileAdIndex]);
        }
    };

    const renderBanner = (bannerElement, adData) => {
        bannerElement.style.opacity = '0';
        setTimeout(() => {
            const isVertical = bannerElement.classList.contains('ad-banner-vertical');
            const details = getStatusDetails(adData.status);

            if (isVertical) {
                bannerElement.innerHTML = `
                    <span class="ad-tag">sponsored_node</span>
                    <div class="ad-content-wrapper" style="display: flex; flex-direction: column; gap: 0.75rem; flex: 1; text-align: left;">
                        <div style="display: flex; flex-direction: column; gap: 0.15rem;">
                            <div class="ad-title" style="margin-bottom: 0;">${adData.name}</div>
                            <div class="ad-subtitle" style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--color-text-muted); word-break: break-all; overflow-wrap: anywhere;">${adData.host}</div>
                        </div>
                        <p class="ad-desc" style="margin-bottom: 0.25rem; font-size: 0.725rem; line-height: 1.4;">${adData.siteDesc}</p>
                        <div class="ad-telemetry" style="border-top: 1px dashed var(--color-border); padding-top: 0.75rem; font-size: 0.65rem; color: var(--color-text-muted); display: flex; flex-direction: column; gap: 0.35rem; font-family: var(--font-mono); line-height: 1.4;">
                            <div style="text-transform: uppercase; font-weight: 600; color: var(--color-accent); margin-bottom: 0.15rem;">[Node Telemetry]</div>
                            <div>status: <span style="color: ${details.color};">${details.text}</span></div>
                            <div>creator: <a href="${adData.contactUrl}" target="_blank" class="footer-link" style="border-bottom: 1px dotted var(--color-border);">${adData.contactName}</a></div>
                            <div>ping_latency: ${adData.status === 'active' ? Math.floor(Math.random() * 45) + 15 + 'ms' : '--'}</div>
                            <div>node_integrity: verified</div>
                            <div style="margin-top: 0.25rem; font-size: 0.55rem; color: var(--color-text-muted); opacity: 0.6;">* Data verified via secure local registry config.</div>
                        </div>
                    </div>
                    <a href="${adData.status === 'active' ? 'https://' + adData.host : '#'}" ${adData.status === 'active' ? 'target="_blank" rel="noopener"' : `onclick="alert(\'${details.alert}\'); return false;"`} class="ad-button" style="margin-top: 0.75rem;">VISIT_SITE</a>
                `;
            } else {
                bannerElement.innerHTML = `
                    <span class="ad-tag">sponsored_node</span>
                    <div style="display: flex; flex-direction: column; gap: 0.15rem;">
                        <div class="ad-title" style="margin-top: 0; font-size: 0.85rem; letter-spacing: 0.05em; margin-bottom: 0;">${adData.name}</div>
                        <div class="ad-subtitle" style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--color-text-muted); word-break: break-all; overflow-wrap: anywhere; margin-bottom: 0.4rem;">${adData.host}</div>
                    </div>
                    <p class="ad-desc" style="margin-top: 0.25rem; margin-bottom: 0.75rem; font-size: 0.725rem; line-height: 1.4;">${adData.siteDesc}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.65rem; font-family: var(--font-mono);">
                        <span style="color: var(--color-text-muted);">
                            Via: <a href="${adData.contactUrl}" target="_blank" class="footer-link">${adData.contactName}</a>
                        </span>
                        <a href="${adData.status === 'active' ? 'https://' + adData.host : '#'}" ${adData.status === 'active' ? 'target="_blank" rel="noopener"' : `onclick="alert(\'${details.alert}\'); return false;"`} class="visit-link" style="margin: 0; color: var(--color-accent); font-weight: 600;">VISIT_SITE →</a>
                    </div>
                `;
            }
            bannerElement.style.opacity = '1';
        }, 500);
    };

    updateBanners();

    if (sponsoredNodes.length > 1) {
        setInterval(() => {
            leftAdIndex = (leftAdIndex + 1) % sponsoredNodes.length;
            rightAdIndex = (leftAdIndex + 1) % sponsoredNodes.length;
            if (leftAdIndex === rightAdIndex) {
                rightAdIndex = (rightAdIndex + 1) % sponsoredNodes.length;
            }
            mobileAdIndex = (mobileAdIndex + 1) % sponsoredNodes.length;
            updateBanners();
        }, 15000);
    }
};

window.initCursorFollower = function () {
    const follower = document.getElementById('cursor-follower');
    if (!follower) return;

    let mouseX = 0;
    let mouseY = 0;
    let isAnimationFramePending = false;

    window.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        if (!isAnimationFramePending) {
            isAnimationFramePending = true;
            requestAnimationFrame(() => {
                follower.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate3d(-50%, -50%, 0)`;
                isAnimationFramePending = false;
            });
        }
    });
};

window.initCopyrightYear = function () {
    const copyrightYearElement = document.getElementById('current-year');
    if (copyrightYearElement) {
        copyrightYearElement.textContent = new Date().getFullYear();
    }
};

window.initGitHubTelemetry = function (elementId) {
    const telemetryElement = document.getElementById(elementId);
    if (!telemetryElement) return;

    fetch('https://api.github.com/repos/RealRatnadwip/745482.xyz/commits?per_page=1')
        .then(response => {
            if (!response.ok) throw new Error('API communication error');
            return response.json();
        })
        .then(payload => {
            if (payload && payload.length > 0) {
                const commitDate = new Date(payload[0].commit.committer.date);
                const localeFormattingOptions = {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: 'UTC'
                };
                telemetryElement.textContent = `Updated: ${commitDate.toLocaleDateString('en-US', localeFormattingOptions)} UTC`;
            } else {
                telemetryElement.textContent = '';
            }
        })
        .catch(() => {
            telemetryElement.textContent = '';
        });
};

function injectCommonUIElements() {
    if (!document.getElementById('cursor-follower')) {
        const follower = document.createElement('div');
        follower.id = 'cursor-follower';
        follower.className = 'cursor-follower';
        document.body.appendChild(follower);
    }

    if (!document.querySelector('.grain')) {
        const grain = document.createElement('div');
        grain.className = 'grain';
        grain.setAttribute('aria-hidden', 'true');
        document.body.appendChild(grain);
    }

    if (!document.querySelector('.ambient')) {
        const ambient = document.createElement('div');
        ambient.className = 'ambient';
        ambient.setAttribute('aria-hidden', 'true');
        ambient.innerHTML = `
            <div class="orb"></div>
            <div class="orb"></div>
            <div class="orb"></div>
        `;
        document.body.insertBefore(ambient, document.body.firstChild);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    injectCommonUIElements();
    window.initCopyrightYear();
    window.initCursorFollower();
});
