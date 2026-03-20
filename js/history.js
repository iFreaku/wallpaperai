const HISTORY_KEY = 'wallpaperai_history';

function getHistory() {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
}

function saveHistory(items) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

function addToHistory(url, subject, style) {
    const items = getHistory();
    items.unshift({ url, subject, style, id: Date.now() });
    saveHistory(items);
}

function removeFromHistory(id) {
    const items = getHistory().filter(i => i.id !== id);
    saveHistory(items);
}

function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
}

function renderHistory() {
    const grid  = document.getElementById('historyGrid');
    const items = getHistory();
    grid.innerHTML = '';

    if (items.length === 0) {
        grid.innerHTML = '<p class="history-empty">No wallpapers yet.</p>';
        return;
    }

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.style.backgroundImage = `url('${item.url}')`;

        const label = document.createElement('div');
        label.className = 'history-item-label';
        label.innerHTML = `<span>${item.subject} · ${item.style}</span>`;

        div.appendChild(label);
        div.addEventListener('click', () => openHistoryViewer(item));
        grid.appendChild(div);
    });
}

function openHistoryViewer(item) {
    const viewer = document.getElementById('historyViewer');
    document.getElementById('historyViewerImg').style.backgroundImage = `url('${item.url}')`;
    document.getElementById('historyViewerTitle').textContent    = item.subject;
    document.getElementById('historyViewerSubtitle').textContent = `in ${item.style}`;

    document.getElementById('historyDownloadBtn').onclick = () => {
        const a      = document.createElement('a');
        a.href       = item.url;
        a.download   = `wallpaper-${item.subject}-${item.style}.jpg`.replace(/\s+/g, '-').toLowerCase();
        a.target     = '_blank';
        a.click();
    };

    document.getElementById('historyRemoveBtn').onclick = () => {
        removeFromHistory(item.id);
        viewer.classList.add('hidden');
        renderHistory();
    };

    viewer.classList.remove('hidden');
}

document.getElementById('historyBackBtn').addEventListener('click', () => {
    showPage('homePage');
});

document.getElementById('historyClearBtn').addEventListener('click', () => {
    if (confirm('Clear all history?')) {
        clearHistory();
        renderHistory();
    }
});

document.getElementById('historyViewerBackBtn').addEventListener('click', () => {
    document.getElementById('historyViewer').classList.add('hidden');
});
