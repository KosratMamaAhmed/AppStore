document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('app-detail-container');
    const modal = document.getElementById('screenshot-modal');
    const modalImg = document.getElementById('modal-img');
    const closeModal = document.querySelector('.close-modal');
    
    const params = new URLSearchParams(window.location.search);
    const appId = parseInt(params.get('id'));

    const loadAppDetails = async () => {
        if (!appId) {
            container.innerHTML = '<h1>404 - ئەپ نەدۆزرایەوە</h1>';
            return;
        }

        try {
            const response = await fetch(`data.json?v=${new Date().getTime()}`);
            const apps = await response.json();
            const app = apps.find(a => a.id === appId);

            if (!app) {
                container.innerHTML = '<h1>404 - ئەپ نەدۆزرایەوە</h1>';
                return;
            }

            document.title = app.name;

            const logoSrc = app.logo ? app.logo.substring(1) : 'https://via.placeholder.com/120?text=Logo';
            const screenshotsHTML = app.screenshots && app.screenshots.length > 0
                ? app.screenshots.map(ss => `<img src="${ss.substring(1)}" alt="Screenshot" class="screenshot-thumb">`).join('')
                : '<p>هیچ سکرین شوتێک دانەنراوە.</p>';

            container.innerHTML = `
                <div class="app-detail-header">
                    <img src="${logoSrc}" alt="${app.name}" class="app-detail-logo">
                    <div class="app-detail-title">
                        <h1>${app.name}</h1>
                        <p>وەشان: ${app.version} | پۆلێن: ${app.category}</p>
                    </div>
                    <div class="download-section">
                        <a href="${app.apk_path ? app.apk_path.substring(1) : '#'}" class="download-btn" download>داگرتن (${app.file_size_mb || 'N/A'} MB)</a>
                        <p style="font-size: 0.9rem; color: #6e6e73; margin-top: 0.5rem;">ژمارەی داگرتنەکان: ${app.download_count || 0}</p>
                    </div>
                </div>
                <div class="app-detail-body">
                    <h3>وەسفی ئەپ</h3>
                    <p>${app.description || 'هیچ وەسفێک دانەنراوە.'}</p>
                    <h3>وێنەی ناو ئەپ</h3>
                    <div class="screenshots-gallery">
                        ${screenshotsHTML}
                    </div>
                </div>
            `;

            // Event listeners for screenshot modal
            document.querySelectorAll('.screenshot-thumb').forEach(img => {
                img.addEventListener('click', () => {
                    modal.style.display = "block";
                    modalImg.src = img.src;
                });
            });

        } catch (error) {
            container.innerHTML = '<h1>هەڵەیەک ڕوویدا</h1>';
        }
    };

    closeModal.onclick = () => {
        modal.style.display = "none";
    }
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    loadAppDetails();
});