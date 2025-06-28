document.addEventListener('DOMContentLoaded', () => {
    const appList = document.getElementById('app-list');

    const fetchApps = async () => {
        try {
            // لینکەکە سادەکراوەتەوە
            const response = await fetch(`data.json?v=${new Date().getTime()}`);
            
            if (!response.ok) {
                throw new Error(`هەڵە لە بارکردنی داتاکان: ${response.statusText}`);
            }
            
            const apps = await response.json();
            apps.sort((a, b) => (b.is_pinned || false) - (a.is_pinned || false));
            renderApps(apps);

        } catch (error) {
            appList.innerHTML = `<p style="text-align: center; color: red;">هەڵەیەک لەکاتی هێنانی داتاکان ڕوویدا.</p>`;
            console.error('Fetch error:', error);
        }
    };

    const renderApps = (apps) => {
        if (!apps || apps.length === 0) {
            appList.innerHTML = '<p style="text-align: center;">هیچ ئەپێک بۆ نمایشکردن نییە.</p>';
            return;
        }

        appList.innerHTML = ''; 

        apps.forEach(app => {
            const card = document.createElement('div');
            card.className = `app-card ${app.is_pinned ? 'pinned' : ''}`;
            
            // لینکەکە سادەکراوەتەوە
            const logoSrc = app.logo ? app.logo.substring(1) : 'https://via.placeholder.com/60?text=Logo';

            card.innerHTML = `
                <div class="app-header">
                    <img src="${logoSrc}" alt="${app.name} Logo" class="app-logo">
                    <div class="info">
                        <h3>${app.name || 'بێ ناو'}</h3>
                        <p>${app.category || 'بێ پۆلێن'}</p>
                    </div>
                </div>
                <div class="app-body">
                    <p class="app-description">${app.description || 'هیچ وەسفێک دانەنراوە.'}</p>
                </div>
                <div class="app-footer">
                    <a href="${app.apk_url}" class="download-btn" download>داگرتن</a>
                    <div class="app-meta">
                        <span>قەبارە: ${app.file_size_mb || 'N/A'} MB</span>
                        <span>داگرتن: ${app.download_count || 0}</span>
                    </div>
                </div>
            `;
            appList.appendChild(card);
        });
    };

    fetchApps();
});