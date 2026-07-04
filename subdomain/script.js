document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.subdomain-grid');

    // Metadata cache to store fetched OG results
    const metadataCache = new Map();

    window.initGitHubTelemetry('last-updated-time');

    // Fetch and parse subdomain list
    window.fetchAndParseSubdomains('../subdomain.md')
        .then(subdomains => {
            if (subdomains.length > 0 && grid) {
                grid.innerHTML = ''; // Clear loading indicator
                const fragment = document.createDocumentFragment();

                subdomains.forEach((sub, index) => {
                    const card = document.createElement('div');
                    card.className = `subdomain-card ${sub.status}`;
                    card.setAttribute('data-host', sub.host);
                    card.setAttribute('data-name', sub.name);
                    card.setAttribute('data-status', sub.status);
                    card.setAttribute('data-fallback-desc', sub.desc);

                    // Structural layout of expandable card with site description and contact link
                    card.innerHTML = `
                        <div class="card-header">
                            <div class="url-group">
                                <span class="subdomain-url-full">${sub.host}</span>
                                <span class="subdomain-url-short">${sub.name}</span>
                                <span class="status-badge status-${sub.status}">${sub.status === 'comingsoon' ? 'coming soon' : sub.status}</span>
                            </div>
                            <span class="expand-indicator">▶</span>
                        </div>
                        <p class="subdomain-desc">${sub.desc}</p>
                        <div class="card-footer-author" style="margin-top: 0.5rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.7rem; color: var(--color-text-muted); font-family: var(--font-mono);">
                            <span>by <a href="${sub.contactUrl}" target="_blank" class="footer-link" style="border-bottom: 1px dotted var(--color-border);">${sub.contactName}</a></span>
                        </div>
                        <div class="card-drawer">
                            <div class="site-detail-desc" style="font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 0.75rem;">
                                ${sub.siteDesc}
                            </div>
                            ${sub.status === 'active' ? `
                            <div style="margin-top: 0.75rem; margin-bottom: 0.75rem;">
                                <a href="https://${sub.host}" target="_blank" rel="noopener" class="visit-link-btn">
                                    VISIT NODE <span class="arrow-visit">→</span>
                                </a>
                            </div>
                            ` : ''}
                            <div class="og-preview" id="preview-${index}">
                                <!-- Will be filled dynamically -->
                            </div>
                        </div>
                    `;

                    // Add expansion trigger on click
                    card.addEventListener('click', (e) => {
                        // Prevent double triggering if clicking links inside the drawer
                        if (e.target.closest('.visit-link-btn') || e.target.closest('.visit-link') || e.target.closest('.og-image-wrapper') || e.target.closest('.footer-link')) return;

                        const isExpanded = card.classList.contains('expanded');

                        // Collapse all cards first
                        document.querySelectorAll('.subdomain-card').forEach(c => {
                            c.classList.remove('expanded');
                        });

                        // If it wasn't expanded, expand it now
                        if (!isExpanded) {
                            card.classList.add('expanded');
                            loadOGMetadata(card, index);
                        }
                    });

                    fragment.appendChild(card);
                });

                grid.appendChild(fragment);

                // Initialize sponsored banners rotation
                window.initSponsoredBanners(subdomains);
            }
        })
        .catch(error => {
            console.error('Error fetching subdomains:', error);
            if (grid) {
                grid.innerHTML = `<div style="font-family: var(--font-mono); font-size: 0.8125rem; color: var(--color-accent);">Error loading subdomain records.</div>`;
            }
        });

    // Fetch and render OG metadata inside the expanded card
    async function loadOGMetadata(card, index) {
        const host = card.getAttribute('data-host');
        const status = card.getAttribute('data-status');
        const fallbackDesc = card.getAttribute('data-fallback-desc');
        const name = card.getAttribute('data-name');
        const previewContainer = document.getElementById(`preview-${index}`);

        if (!previewContainer) return;

        // 1. If not active, show static info immediately without fetching
        if (status !== 'active') {
            previewContainer.innerHTML = `
                <div class="og-badge">static_telemetry</div>
                <div class="og-text">
                    <span class="og-title">${name}</span>
                    <p class="og-desc">${fallbackDesc} (Node currently offline / in maintenance)</p>
                </div>
            `;
            return;
        }

        // 2. If cached, render cache immediately
        if (metadataCache.has(host)) {
            renderMetadata(previewContainer, metadataCache.get(host), host);
            return;
        }

        // 3. Render Shimmer Loader
        previewContainer.innerHTML = `
            <div class="shimmer-container">
                <div class="shimmer-img shimmer"></div>
                <div class="shimmer-line title shimmer"></div>
                <div class="shimmer-line desc1 shimmer"></div>
                <div class="shimmer-line desc2 shimmer"></div>
            </div>
        `;

        try {
            // Fetch live OG metadata using Microlink API
            const targetUrl = `https://${host}`;
            const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}`;

            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('CORS or network error');

            const json = await response.json();
            if (json.status !== 'success' || !json.data) throw new Error('API processing error');

            const meta = {
                title: json.data.title || host,
                description: json.data.description || fallbackDesc,
                image: json.data.image ? json.data.image.url : null
            };

            // Cache and Render
            metadataCache.set(host, meta);

            // Double check if card is still expanded before rendering
            if (card.classList.contains('expanded')) {
                renderMetadata(previewContainer, meta, host);
            }
        } catch (err) {
            console.warn(`Could not retrieve live OG metadata for ${host}:`, err);
            // Render fallback using local subdomain data
            const fallbackMeta = {
                title: name,
                description: fallbackDesc,
                image: null,
                isFallback: true
            };
            metadataCache.set(host, fallbackMeta);
            if (card.classList.contains('expanded')) {
                renderMetadata(previewContainer, fallbackMeta, host);
            }
        }
    }

    // Helper to render metadata structure
    function renderMetadata(container, meta, host) {
        let imageHtml = '';
        if (meta.image) {
            imageHtml = `
                <div class="og-image-wrapper">
                    <img class="og-image" src="${meta.image}" alt="OG Preview for ${host}" onload="this.classList.add('loaded')">
                </div>
            `;
        }

        container.innerHTML = `
            <div class="og-badge">${meta.isFallback ? 'local_telemetry' : 'live_telemetry'}</div>
            ${imageHtml}
            <div class="og-text">
                <span class="og-title">${meta.title}</span>
                <p class="og-desc">${meta.description}</p>
                <a href="https://${host}" class="visit-link" target="_blank" rel="noopener">Visit Node →</a>
            </div>
        `;
    }
});
