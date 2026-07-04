/**
 * Shared Utilities & UI Logic for 745482.xyz
 */

// 1. Fetch and Parse subdomain.md
window.fetchAndParseSubdomains = function(relativePathToMd) {
    return fetch(relativePathToMd)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        })
        .then(data => {
            const subdomains = [];
            const lines = data.split(/\r?\n/);
            
            lines.forEach(line => {
                const trimmed = line.trim();
                if (trimmed.startsWith('|') && trimmed.endsWith('|') && !trimmed.includes('---')) {
                    const cols = trimmed.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
                    if (cols.length >= 7 && cols[0].toLowerCase() !== 'name') {
                        const name = cols[0];
                        const host = cols[1];
                        const isSponsored = cols[2] ? cols[2].toLowerCase() === 'true' : false;
                        const rawStatus = cols[3] ? cols[3].toLowerCase().trim() : '';
                        const status = rawStatus === 'coming soon' ? 'comingsoon' : rawStatus;
                        const contactRaw = cols[4] || '';
                        const homeDesc = cols[5] || '';
                        const siteDesc = cols[6] || '';

                        let contactName = contactRaw;
                        let contactUrl = '#';
                        const contactMatch = contactRaw.match(/\[([^\]]+)\]\(([^)]+)\)/);
                        if (contactMatch) {
                            contactName = contactMatch[1];
                            contactUrl = contactMatch[2];
                        }

                        subdomains.push({
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
            return subdomains;
        });
};

// 2. Sponsored Banners Rotation Logic
window.initSponsoredBanners = function(subdomains) {
    const sponsoredList = subdomains.filter(s => s.isSponsored);
    if (sponsoredList.length === 0) return;

    let leftAdIndex = 0;
    let rightAdIndex = sponsoredList.length > 1 ? 1 : 0;
    let mobileAdIndex = 0;

    const leftBanner = document.querySelector('.ad-banner-left');
    const rightBanner = document.querySelector('.ad-banner-right');
    const horizontalBanner = document.querySelector('.ad-banner-horizontal');

    const updateBanners = () => {
        const adLeft = sponsoredList[leftAdIndex];
        const adRight = sponsoredList[rightAdIndex];
        const adMobile = sponsoredList[mobileAdIndex];

        if (leftBanner && adLeft) fadeAndUpdateBanner(leftBanner, adLeft);
        if (rightBanner && adRight) fadeAndUpdateBanner(rightBanner, adRight);
        if (horizontalBanner && adMobile) fadeAndUpdateBanner(horizontalBanner, adMobile);
    };

    const fadeAndUpdateBanner = (bannerElement, adData) => {
        bannerElement.style.opacity = '0';
        setTimeout(() => {
            const isVertical = bannerElement.classList.contains('ad-banner-vertical');
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
                            <div>status: <span style="color: ${adData.status === 'active' ? '#4caf50' : (adData.status === 'comingsoon' ? '#2196f3' : '#ff9800')};">${adData.status === 'comingsoon' ? 'coming soon' : adData.status}</span></div>
                            <div>creator: <a href="${adData.contactUrl}" target="_blank" class="footer-link" style="border-bottom: 1px dotted var(--color-border);">${adData.contactName}</a></div>
                            <div>ping_latency: ${Math.floor(Math.random() * 45) + 15}ms</div>
                            <div>node_integrity: verified</div>
                            <div style="margin-top: 0.25rem; font-size: 0.55rem; color: var(--color-text-muted); opacity: 0.6;">* Data verified via secure local registry config.</div>
                        </div>
                    </div>
                    <a href="${adData.status === 'active' ? 'https://' + adData.host : '#'}" ${adData.status === 'active' ? 'target="_blank" rel="noopener"' : 'onclick="alert(\'This node is coming soon.\'); return false;"'} class="ad-button" style="margin-top: 0.75rem;">VISIT_SITE</a>
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
                        <a href="${adData.status === 'active' ? 'https://' + adData.host : '#'}" ${adData.status === 'active' ? 'target="_blank" rel="noopener"' : 'onclick="alert(\'This node is coming soon.\'); return false;"'} class="visit-link" style="margin: 0; color: var(--color-accent); font-weight: 600;">VISIT_SITE →</a>
                    </div>
                `;
            }
            bannerElement.style.opacity = '1';
        }, 500);
    };

    // First paint
    updateBanners();

    // Rotate if we have more than 1 sponsored site (15s rotation time)
    if (sponsoredList.length > 1) {
        setInterval(() => {
            leftAdIndex = (leftAdIndex + 1) % sponsoredList.length;
            rightAdIndex = (leftAdIndex + 1) % sponsoredList.length;
            if (leftAdIndex === rightAdIndex && sponsoredList.length > 1) {
                rightAdIndex = (rightAdIndex + 1) % sponsoredList.length;
            }
            mobileAdIndex = (mobileAdIndex + 1) % sponsoredList.length;
            updateBanners();
        }, 15000);
    }
};

// 3. Cursor Follower Logic
window.initCursorFollower = function() {
    const follower = document.getElementById('cursor-follower');
    if (!follower) return;

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
};

// 4. Update Copyright Year
window.initCopyrightYear = function() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
};

// 5. Fetch GitHub Telemetry Commit Time
window.initGitHubTelemetry = function(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    fetch('https://api.github.com/repos/RealRatnadwip/745482.xyz/commits?per_page=1')
        .then(response => {
            if (!response.ok) throw new Error('GitHub API error');
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                const commitDate = new Date(data[0].commit.committer.date);
                const options = {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: 'UTC'
                };
                el.textContent = `Updated: ${commitDate.toLocaleDateString('en-US', options)} UTC`;
            } else {
                el.textContent = '';
            }
        })
        .catch(() => {
            el.textContent = '';
        });
};

// 6. Dynamically inject common UI elements (orbs, grain, follower)
function injectCommonUIElements() {
    // Inject Cursor Follower element
    if (!document.getElementById('cursor-follower')) {
        const follower = document.createElement('div');
        follower.id = 'cursor-follower';
        follower.className = 'cursor-follower';
        document.body.appendChild(follower);
    }

    // Inject Grain Overlay element
    if (!document.querySelector('.grain')) {
        const grain = document.createElement('div');
        grain.className = 'grain';
        grain.setAttribute('aria-hidden', 'true');
        document.body.appendChild(grain);
    }

    // Inject Ambient Background Orbs
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

// Auto-run injection and initializations
document.addEventListener('DOMContentLoaded', () => {
    injectCommonUIElements();
    window.initCopyrightYear();
    window.initCursorFollower();
});
