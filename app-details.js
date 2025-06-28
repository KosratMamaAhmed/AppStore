document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('app-detail-container');
    const modal = document.getElementById('screenshot-modal');
    const modalImg = document.getElementById('modal-img');
    const closeModal = document.querySelector('.close-modal');
    
    const params = new URLSearchParams(window.location.search);
    const appId = parseInt(params.get('id'));
    let allApps = [];

    const loadAppDetails = async () => {
        if (!appId) {
            container.innerHTML = '<h1>404 - ئەپ نەدۆزرایەوە</h1>';
            return;
        }

        try {
            const response = await fetch(`data.json?v=${new Date().getTime()}`);
            const data = await response.json();
            const app = data.apps.find(a => a.id === appId);
            const category = data.categories.find(c => c.id === app.category_id);

            if (!app) {
                container.innerHTML = '<h1>404 - ئەپ نەدۆزرایەوە</h1>';
                return;
            }

            document.title = app.name;

            const logoSrc = app.logo ? app.logo.substring(1) : 'https://via.placeholder.com/120?text=Logo';
            const screenshotsHTML = app.screenshots && app.screenshots.length > 0
                ? `<div class="screenshots-gallery">${app.screenshots.map(ss => `<img src="${ss.substring(1)}" alt="Screenshot" class="screenshot-thumb">`).join('')}</div>`
                : '<p>هیچ سکرین شوتێک دانەنراوە.</p>';
            
            const descriptionHTML = marked.parse(app.description || 'هیچ وەسفێک دانەنراوە.');

            container.innerHTML = `
                <div class="app-detail-header">
                    <img src="${logoSrc}" alt="${app.name}" class="app-detail-logo">
                    <div class="app-detail-title">
                        <h1>${app.name}</h1>
                        <p>وەشان: ${app.version} | پۆلێن: ${category ? category.name : 'نادیار'}</p>
                    </div>
                    <div class="download-section">
                        <a href="${app.play_store_url || (app.apk_path ? app.apk_path.substring(1) : '#')}" class="download-btn" id="download-link">
                            <div class="progress-bar"></div>
                            <span>داگرتن (${app.file_size_mb || 'N/A'} MB)</span>
                        </a>
                        <p style="font-size: 0.9rem; color: #6e6e73; margin-top: 0.5rem;">ژمارەی داگرتنەکان: ${app.download_count || 0}</p>
                    </div>
                </div>
                <div class="app-detail-body">
                    <h3>وەسفی ئەپ</h3>
                    <div class="markdown-content">${descriptionHTML}</div>
                    <h3>وێنەی ناو ئەپ</h3>
                    ${screenshotsHTML}
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
                handleDownload(app);
            });

        } catch (error) {
            container.innerHTML = '<h1>هەڵەیەک ڕوویدا</h1>';
        }
    };

    const handleDownload = async (app) => {
        const downloadBtn = document.getElementById('download-link');
        const downloadBtnSpan = downloadBtn.querySelector('span');
        const progressBar = downloadBtn.querySelector('.progress-bar');
        
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

            setTimeout(() => {
                alert(`فایلی ${app.name}.apk داگیرا.\nتکایە لە بەشی 'Downloads'ـی وێبگەڕەکەت یان 'File Manager'ـی مۆبایلەکەت بیکەرەوە بۆ دامەزراندن.`);
            }, 1000);

            downloadBtnSpan.textContent = "داگیرا ✓";
            setTimeout(() => {
                downloadBtnSpan.textContent = `داگرتن (${app.file_size_mb || 'N/A'} MB)`;
                progressBar.style.width = '0%';
                downloadBtn.style.pointerEvents = 'auto';
            }, 3000);

        } catch (error) {
            downloadBtnSpan.textContent = "هەڵە لە داگرتن";
        }
    };

    closeModal.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = "none";
    }

    loadAppDetails();
});