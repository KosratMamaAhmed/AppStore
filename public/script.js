document.addEventListener('DOMContentLoaded', () => {
    const appList = document.getElementById('app-list');

    // فەنکشن بۆ هێنانی داتاکان لە فایلی data.json
    const fetchApps = async () => {
        try {
            // لینکەکە ئاماژە بە فایلی ناو public دەکات
            const response = await fetch(`/public/data.json?v=${new Date().getTime()}`);
            
            if (!response.ok) {
                throw new Error(`هەڵە لە بارکردنی داتاکان: ${response.statusText}`);
            }
            
            const apps = await response.json();
            
            // ڕیزکردنی ئەپەکان: ئەوانەی پن کراون لە پێشەوە بن
            apps.sort((a, b) => (b.is_pinned || false) - (a.is_pinned || false));

            renderApps(apps);

        } catch (error) {
            appList.innerHTML = `<p style="text-align: center; color: red;">هەڵەیەک لەکاتی هێنانی داتاکان ڕوویدا. تکایە دڵنیابە فایلی data.json بوونی هەیە و بە دروستی نووسراوە.</p>`;
            console.error('Fetch error:', error);
        }
    };

    // فەنکشن بۆ پیشاندانی ئەپەکان لەسەر پەڕەکە
    const renderApps = (apps) => {
        // ئەگەر هیچ ئەپێک نەبوو، پەیامێک پیشان بدە
        if (!apps || apps.length === 0) {
            appList.innerHTML = '<p style="text-align: center;">هیچ ئەپێک بۆ نمایشکردن نییە.</p>';
            return;
        }

        // پاککردنەوەی لۆدەر
        appList.innerHTML = ''; 

        // دروستکردنی کارت بۆ هەر ئەپێک
        apps.forEach(app => {
            const card = document.createElement('div');
            card.className = `app-card ${app.is_pinned ? 'pinned' : ''}`;
            
            // بەکارهێنانی وێنەی دیفۆڵت ئەگەر لۆگۆ دانەنرابوو
            const logoSrc = app.logo || 'https://via.placeholder.com/60?text=Logo';

            card.innerHTML = `
                <div class="app-header">
                    <img src="${logoSrc}" alt="${app.name} Logo" class="app-logo">
                    <div class="app-info">
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

    // دەستپێکردنی پرۆسەکە
    fetchApps();
});