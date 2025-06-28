document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('app-detail-container');
    const modal = document.getElementById('screenshot-modal');
    const modalImg = document.getElementById('modal-img');
    const closeModal = document.querySelector('.close-modal');
    
    const params = new URLSearchParams(window.location.search);
    const appId = parseInt(params.get('id'));
    let currentApp = null;

    const loadAppDetails = async () => {
        if (!appId) {
            container.innerHTML = '<h1>404 - ئەپ نەدۆزرایەوە</h1>';
            return;
        }

        try {
            // هێنانی زانیارییە بنەڕەتییەکان لە data.json
            const response = await fetch(`data.json?v=${new Date().getTime()}`);
            const apps = await response.json();
            currentApp = apps.find(a => a.id === appId);

            if (!currentApp) {
                container.innerHTML = '<h1>404 - ئەپ نەدۆزرایەوە</h1>';
                return;
            }

            // هێنانی ژمارەی داگرتنی ڕاستەقینە لە باکێند
            try {
                const countResponse = await fetch(`/api/downloads?id=${currentApp.id}`);
                if (countResponse.ok) {
                    const data = await countResponse.json();
                    currentApp.download_count = data.count;
                }
            } catch (e) {
                console.error("Could not fetch live download count, using default.", e);
                // ئەگەر کێشە هەبوو، ژمارەکەی ناو data.json بەکاردەهێنێت
                currentApp.download_count = currentApp.download_count || 0;
            }

            renderApp();

        } catch (error) {
            container.innerHTML = '<h1>هەڵەیەک لە بارکردنی داتاکان ڕوویدا</h1>';
            console.error(error);
        }
    };

    const renderApp = () => {
        document.title = currentApp.name;

        const logoSrc = currentApp.logo ? currentApp.logo.substring(1) : 'https://via.placeholder.com/120?text=Logo';
        const screenshotsHTML = currentApp.screenshots && currentApp.screenshots.length > 0
            ? currentApp.screenshots.map(ss => `<img src="${ss.substring(1)}" alt="Screenshot" class="screenshot-thumb">`).join('')
            : '<p>هیچ سکرین شوتێک دانەنراوە.</p>';

        container.innerHTML = `
            <div class="app-detail-header">
                <img src="${logoSrc}" alt="${currentApp.name}" class="app-detail-logo">
                <div class="app-detail-title">
                    <h1>${currentApp.name}</h1>
                    <p>وەشان: ${currentApp.version} | پۆلێن: ${currentApp.category}</p>
                </div>
                <div class="download-section">
                    <a href="#" id="download-link" class="download-btn">
                        <div class="progress-bar"></div>
                        <span>داگرتن (${currentApp.file_size_mb || 'N/A'} MB)</span>
                    </a>
                    <p style="font-size: 0.9rem; color: #6e6e73; margin-top: 0.5rem;">ژمارەی داگرتنەکان: <span id="download-count">${currentApp.download_count}</span></p>
                </div>
            </div>
            <div class="app-detail-body">
                <h3>وەسفی ئەپ</h3>
                <p>${currentApp.description || 'هیچ وەسفێک دانەنراوە.'}</p>
                <h3>وێنەی ناو ئەپ</h3>
                <div class="screenshots-gallery">
                    ${screenshotsHTML}
                </div>
            </div>
        `;

        document.querySelectorAll('.screenshot-thumb').forEach(img => {
            img.addEventListener('click', () => {
                modal.style.display = "block";
                modalImg.src = img.src;
            });
        });

        document.getElementById('download-link').addEventListener('click', (e) => {
            e.preventDefault();
            handleDownload(currentApp);
        });
    };

    const handleDownload = async (app) => {
        const downloadBtn = document.getElementById('download-link');
        const downloadBtnSpan = downloadBtn.querySelector('span');
        const progressBar = downloadBtn.querySelector('.progress-bar');
        const downloadCountSpan = document.getElementById('download-count');
        
        downloadBtn.style.pointerEvents = 'none';

        if (app.play_store_url) {
            window.open(app.play_store_url, '_blank');
            downloadBtn.style.pointerEvents = 'auto';
            return;
        }
        
        if (!app.apk_path) {
            alert('فایلی داگرتن بەردەست نییە!');
            downloadBtn.style.pointerEvents = 'auto';
            return;
        }

        // زیادکردنی ژمارەی داگرتن لە ڕێگەی API
        try {
            const countResponse = await fetch('/api/downloads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: app.id })
            });
            if (countResponse.ok) {
                const data = await countResponse.json();
                downloadCountSpan.textContent = data.newCount;
            }
        } catch (error) {
            console.error('Failed to update download count via API:', error);
        }

        // دەستپێکردنی داگرتنی فایل
        try {
            const response = await fetch(app.apk_path.substring(1));
            const contentLength = +response.headers.get('Content-Length');
            let loaded = 0;

            const reader = response.body.getReader();
            const stream = new ReadableStream({
                start(controller) {
                    function push() {
                        reader.read().then(({ done, value }) => {
                            if (done) {
                                controller.close();
                                return;
                            }
                            loaded += value.length;
                            const percent = contentLength ? Math.round((loaded / contentLength) * 100) : 0;
                            progressBar.style.width = `${percent}%`;
                            downloadBtnSpan.textContent = `${percent}%`;
                            controller.enqueue(value);
                            push();
                        });
                    }
                    push();
                }
            });

            const newResponse = new Response(stream);
            const blob = await newResponse.blob();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${app.name}.apk`;
            a.click();
            window.URL.revokeObjectURL(url);

            downloadBtnSpan.textContent = "داگیرا ✓";
            setTimeout(() => {
                downloadBtnSpan.textContent = `داگرتن (${app.file_size_mb || 'N/A'} MB)`;
                progressBar.style.width = '0%';
                downloadBtn.style.pointerEvents = 'auto';
            }, 3000);

        } catch (error) {
            downloadBtnSpan.textContent = "هەڵە لە داگرتن";
            console.error("Download error:", error);
        }
    };

    closeModal.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = "none";
    }

    loadAppDetails();
});