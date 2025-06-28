document.addEventListener('DOMContentLoaded', () => {
    const appList = document.getElementById('app-list');
    const pinnedList = document.getElementById('pinned-apps');
    const pinnedSection = document.getElementById('pinned-section');
    const navMenu = document.getElementById('nav-menu');
    const searchBox = document.getElementById('search-box');
    let allApps = [];
    let allCategories = [];

    const fetchAndRender = async () => {
        try {
            const response = await fetch(`data.json?v=${new Date().getTime()}`);
            const data = await response.json();
            allApps = data.apps || [];
            allCategories = data.categories || [];
            
            renderCategories();
            filterAndRenderApps();
        } catch (error) {
            console.error('Fetch error:', error);
            appList.innerHTML = `<p style="text-align: center; color: red;">هەڵەیەک لەکاتی هێنانی داتاکان ڕوویدا.</p>`;
        }
    };

    const renderCategories = () => {
        allCategories.forEach(cat => {
            const link = document.createElement('a');
            link.href = '#';
            link.className = 'nav-link';
            link.dataset.id = cat.id;
            link.textContent = cat.name;
            navMenu.appendChild(link);
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector('.nav-link.active').classList.remove('active');
                e.target.classList.add('active');
                filterAndRenderApps();
            });
        });
    };

    const filterAndRenderApps = () => {
        const searchTerm = searchBox.value.toLowerCase();
        const activeCategoryId = document.querySelector('.nav-link.active').dataset.id;

        const filteredApps = allApps.filter(app => {
            const matchesCategory = activeCategoryId === 'all' || app.category_id == activeCategoryId;
            const matchesSearch = app.name.toLowerCase().includes(searchTerm);
            return matchesCategory && matchesSearch;
        });

        const pinned = filteredApps.filter(app => app.is_pinned);
        const notPinned = filteredApps.filter(app => !app.is_pinned);

        renderAppList(pinned, pinnedList);
        renderAppList(notPinned, appList);

        pinnedSection.style.display = pinned.length > 0 ? 'block' : 'none';
    };

    const renderAppList = (apps, container) => {
        container.innerHTML = '';
        if (apps.length === 0 && container.id !== 'pinned-apps') {
            container.innerHTML = '<p>هیچ ئەپێک نەدۆزرایەوە.</p>';
            return;
        }
        apps.forEach(app => {
            const cardLink = document.createElement('a');
            cardLink.href = `app.html?id=${app.id}`;
            cardLink.className = `app-card`;
            
            const logoSrc = app.logo ? app.logo.substring(1) : 'https://via.placeholder.com/64?text=Logo';
            const descriptionSnippet = app.description ? app.description.split('\n')[0].substring(0, 80) + '...' : 'هیچ وەسفێک دانەنراوە.';

            cardLink.innerHTML = `
                <div class="card-content">
                    <div class="app-header">
                        <img src="${logoSrc}" alt="${app.name} Logo" class="app-logo">
                        <div class="app-info">
                            <h3>${app.name || 'بێ ناو'}</h3>
                            <p>${allCategories.find(c => c.id == app.category_id)?.name || 'بێ پۆلێن'}</p>
                        </div>
                    </div>
                    <p class="app-description">${descriptionSnippet}</p>
                    <div class="app-footer">
                        <span class="details-btn">ورردەکاری زیاتر</span>
                        <span class="app-meta">${app.version || ''}</span>
                    </div>
                </div>
            `;
            container.appendChild(cardLink);
        });
    };

    searchBox.addEventListener('input', filterAndRenderApps);
    fetchAndRender();
});