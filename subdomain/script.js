document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.subdomain-grid');
    const metadataCache = new Map();

    window.initGitHubTelemetry('last-updated-time');

    window.fetchAndParseSubdomains('../subdomain.md')
        .then(subdomains => {
            if (subdomains.length > 0 && grid) {
                grid.innerHTML = '';
                const fragment = document.createDocumentFragment();

                subdomains.forEach((subdomain, index) => {
                    const card = document.createElement('div');
                    card.className = `subdomain-card ${subdomain.status}`;
                    card.setAttribute('data-host', subdomain.host);
                    card.setAttribute('data-name', subdomain.name);
                    card.setAttribute('data-status', subdomain.status);
                    card.setAttribute('data-fallback-desc', subdomain.desc);

                    card.innerHTML = `
                        <div class="card-header">
                            <div class="url-group">
                                <span class="subdomain-url-full">${subdomain.host}</span>
                                <span class="subdomain-url-short">${subdomain.name}</span>
                                <span class="status-badge status-${subdomain.status}">${subdomain.status === 'comingsoon' ? 'coming soon' : subdomain.status}</span>
                            </div>
                            <span class="expand-indicator">▶</span>
                        </div>
                        <p class="subdomain-desc">${subdomain.desc}</p>
                        <div class="card-footer-author" style="margin-top: 0.5rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.7rem; color: var(--color-text-muted); font-family: var(--font-mono);">
                            <span>by <a href="${subdomain.contactUrl}" target="_blank" class="footer-link" style="border-bottom: 1px dotted var(--color-border);">${subdomain.contactName}</a></span>
                        </div>
                        <div class="card-drawer">
                            <div class="site-detail-desc" style="font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 0.75rem;">
                                ${subdomain.siteDesc}
                            </div>
                            ${subdomain.status === 'active' ? `
                            <div style="margin-top: 0.75rem; margin-bottom: 0.75rem;">
                                <a href="https://${subdomain.host}" target="_blank" rel="noopener" class="visit-link-btn">
                                    VISIT NODE <span class="arrow-visit">→</span>
                                </a>
                            </div>
                            ` : ''}
                            <div class="og-preview" id="preview-${index}"></div>
                        </div>
                    `;

                    card.addEventListener('click', (event) => {
                        if (event.target.closest('.visit-link-btn') || 
                            event.target.closest('.visit-link') || 
                            event.target.closest('.og-image-wrapper') || 
                            event.target.closest('.footer-link')) {
                            return;
                        }

                        const isCurrentlyExpanded = card.classList.contains('expanded');

                        document.querySelectorAll('.subdomain-card').forEach(item => {
                            item.classList.remove('expanded');
                        });

                        if (!isCurrentlyExpanded) {
                            card.classList.add('expanded');
                            loadPreviewTelemetry(card, index);
                        }
                    });

                    fragment.appendChild(card);
                });

                grid.appendChild(fragment);
                window.initSponsoredBanners(subdomains);
            }
        })
        .catch(error => {
            console.error('Failed to load subdomains:', error);
            if (grid) {
                grid.innerHTML = `<div style="font-family: var(--font-mono); font-size: 0.8125rem; color: var(--color-accent);">Registry node initialization error.</div>`;
            }
        });

    async function loadPreviewTelemetry(card, index) {
        const host = card.getAttribute('data-host');
        const status = card.getAttribute('data-status');
        const fallbackDesc = card.getAttribute('data-fallback-desc');
        const name = card.getAttribute('data-name');
        const previewContainer = document.getElementById(`preview-${index}`);

        if (!previewContainer) return;

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

        if (metadataCache.has(host)) {
            renderPreviewMarkup(previewContainer, metadataCache.get(host), host);
            return;
        }

        previewContainer.innerHTML = `
            <div class="shimmer-container">
                <div class="shimmer-img shimmer"></div>
                <div class="shimmer-line title shimmer"></div>
                <div class="shimmer-line desc1 shimmer"></div>
                <div class="shimmer-line desc2 shimmer"></div>
            </div>
        `;

        try {
            const targetUrl = `https://${host}`;
            const requestUrl = `https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}`;

            const response = await fetch(requestUrl);
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            const payload = await response.json();
            if (payload.status !== 'success' || !payload.data) {
                throw new Error('Telemetry parse failure');
            }

            const metaRecord = {
                title: payload.data.title || host,
                description: payload.data.description || fallbackDesc,
                image: payload.data.image ? payload.data.image.url : null
            };

            metadataCache.set(host, metaRecord);

            if (card.classList.contains('expanded')) {
                renderPreviewMarkup(previewContainer, metaRecord, host);
            }
        } catch (error) {
            console.warn(`Fallback active for live telemetry extraction on ${host}:`, error.message);
            const fallbackRecord = {
                title: name,
                description: fallbackDesc,
                image: null,
                isFallback: true
            };
            metadataCache.set(host, fallbackRecord);
            if (card.classList.contains('expanded')) {
                renderPreviewMarkup(previewContainer, fallbackRecord, host);
            }
        }
    }

    function renderPreviewMarkup(container, metadata, host) {
        const imageElementHtml = metadata.image 
            ? `<div class="og-image-wrapper">
                   <img class="og-image" src="${metadata.image}" alt="Telemetry Preview for ${host}" onload="this.classList.add('loaded')">
               </div>`
            : '';

        container.innerHTML = `
            <div class="og-badge">${metadata.isFallback ? 'local_telemetry' : 'live_telemetry'}</div>
            ${imageElementHtml}
            <div class="og-text">
                <span class="og-title">${metadata.title}</span>
                <p class="og-desc">${metadata.description}</p>
                <a href="https://${host}" class="visit-link" target="_blank" rel="noopener">Visit Node →</a>
            </div>
        `;
    }
});
