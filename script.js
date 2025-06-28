document.addEventListener('DOMContentLoaded', () => {
    const appList = document.getElementById('app-list');

    const fetchApps = async () => {
        try {
            const response = await fetch(`data.json?v=${new Date().getTime()}`);
            const apps = await response.json();
            apps.sort((a, b) => (b.is_pinned || false) - (a.is_pinned || false));
            renderApps(apps);
        } catch (error) {
            appList.innerHTML = `<p style="text-align: center; color: red;">هەڵەیەک لەکاتی هێنانی داتاکان ڕوویدا.</p>`;
        }
    };

    const renderApps = (apps) => {
        appList.innerHTML = ''; 
        if (!apps || apps.length === 0) {
            appList.innerHTML = '<p style="text-align: center;">هیچ ئەپێک بۆ نمایشکردن نییە.</p>';
            return;
        }
        apps.forEach(app => {
            const cardLink = document.createElement('a');
            cardLink.href = `app.html?id=${app.id}`;
            cardLink.className = `app-card ${app.is_pinned ? 'pinned' : ''}`;
            
            const logoSrc = app.logo ? app.logo.substring(1) : 'https://via.placeholder.com/64?text=Logo';
            const descriptionSnippet = app.description ? app.description.substring(0, 80) + '...' : 'هیچ وەسفێک دانەنراوە.';

            cardLink.innerHTML = `
                <div class="card-content">
                    <div class="app-header">
                        <img src="${logoSrc}" alt="${app.name} Logo" class="app-logo">
                        <div class="app-info">
                            <h3>${app.name || 'بێ ناو'}</h3>
                            <p>${app.category || 'بێ پۆلێن'}</p>
                        </div>
                    </div>
                    <p class="app-description">${descriptionSnippet}</p>
                    <div class="app-footer">
                        <span class="details-btn">ورردەکاری زیاتر</span>
                        <span class="app-meta">${app.version || ''}</span>
                    </div>
                </div>
            `;
            appList.appendChild(cardLink);
        });
    };

    fetchApps();
});