let selectedSubject  = null;
let selectedStyle    = null;
let currentResultUrl = null;
let resultImages     = [];
let activeResultIdx  = 0;

async function loadPresets() {
    const res = await fetch('https://raw.githubusercontent.com/iFreaku/wallpaperai/main/assets/presets.json');
    const data = await res.json();
    buildCarousel('subjectCarousel', data.presets.subjects, 'subject');
    buildCarousel('styleCarousel',   data.presets.styles,   'style');
}

function buildCarousel(containerId, items, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card' + (index === 0 ? ' active' : '');
        card.style.backgroundImage    = `url('${item.placeholder}')`;
        card.style.backgroundSize     = 'cover';
        card.style.backgroundPosition = 'center';
        card.dataset.name = item.name;

        const label = document.createElement('span');
        label.className   = 'card-label';
        label.textContent = item.name;
        card.appendChild(label);
        container.appendChild(card);
    });

    if (type === 'subject') selectedSubject = items[0].name;
    if (type === 'style')   selectedStyle   = items[0].name;

    container.addEventListener('scroll', () => onCarouselScroll(container, type));

    setTimeout(() => {
        const first  = container.querySelector('.card');
        const offset = first.offsetLeft - (container.offsetWidth / 2) + (first.offsetWidth / 2);
        container.scrollTo({ left: offset, behavior: 'instant' });
    }, 50);
}

function onCarouselScroll(container, type) {
    const cards           = container.querySelectorAll('.card');
    const containerCenter = container.scrollLeft + container.offsetWidth / 2;
    let closestCard = null, closestDist = Infinity;

    cards.forEach(card => {
        const dist = Math.abs((card.offsetLeft + card.offsetWidth / 2) - containerCenter);
        if (dist < closestDist) { closestDist = dist; closestCard = card; }
    });

    cards.forEach(c => c.classList.remove('active'));
    if (closestCard) {
        closestCard.classList.add('active');
        if (type === 'subject') selectedSubject = closestCard.dataset.name;
        if (type === 'style')   selectedStyle   = closestCard.dataset.name;
    }
}

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}


function addResultCard(url) {
    const carousel = document.getElementById('resultCarousel');
    const dots     = document.getElementById('resultDots');

    const card = document.createElement('div');
    card.className = 'result-card';
    card.style.backgroundImage = `url('${url}')`;
    carousel.appendChild(card);
    resultImages.push(url);

    const dot = document.createElement('div');
    dot.className = 'result-dot';
    dots.appendChild(dot);

    updateResultActive(resultImages.length - 1);

    setTimeout(() => {
        card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }, 50);

    carousel.addEventListener('scroll', onResultScroll);
}

function onResultScroll() {
    const carousel = document.getElementById('resultCarousel');
    const cards    = carousel.querySelectorAll('.result-card');
    const center   = carousel.scrollLeft + carousel.offsetWidth / 2;
    let closest = null, closestDist = Infinity;

    cards.forEach((card, i) => {
        const dist = Math.abs((card.offsetLeft + card.offsetWidth / 2) - center);
        if (dist < closestDist) { closestDist = dist; closest = i; }
    });

    if (closest !== null) updateResultActive(closest);
}

function updateResultActive(index) {
    activeResultIdx = index;
    const cards = document.querySelectorAll('.result-card');
    const dots  = document.querySelectorAll('.result-dot');
    cards.forEach((c, i) => c.classList.toggle('active', i === index));
    dots.forEach((d, i)  => d.classList.toggle('active', i === index));
    currentResultUrl = resultImages[index];
}


async function runGenerate() {
    if (!selectedSubject || !selectedStyle) return;

    const touch = document.getElementById('touchInput').value.trim();

    document.getElementById('processingSubLabel').textContent =
        `${selectedSubject} × ${selectedStyle}`;
    showPage('processingPage');

    try {
        const { url } = await generateWallpaper(selectedSubject, selectedStyle, touch);

        const img    = new Image();
        img.onload = () => {
            document.getElementById('resultTitle').textContent    = `${selectedSubject}`;
            document.getElementById('resultSubtitle').textContent = `in ${selectedStyle}`;

            addToHistory(url, selectedSubject, selectedStyle);

            addResultCard(url);
            showPage('resultPage');
        };

        img.onerror  = () => {
            document.getElementById('processingSubLabel').textContent = 'Failed. Go back and try again.';
        };
        img.src = url;

    } catch (e) {
        console.error(e);
        document.getElementById('processingSubLabel').textContent = 'Error. Try again.';
    }
}

document.getElementById('surpriseBtn').addEventListener('click', () => {
    const subjectCards = document.querySelectorAll('#subjectCarousel .card');
    const styleCards   = document.querySelectorAll('#styleCarousel .card');

    if (!subjectCards.length || !styleCards.length) return;

    const randSubjectIdx = Math.floor(Math.random() * subjectCards.length);
    const randStyleIdx   = Math.floor(Math.random() * styleCards.length);

    const subjectCard = subjectCards[randSubjectIdx];
    const styleCard   = styleCards[randStyleIdx];

    const subjectCarousel = document.getElementById('subjectCarousel');
    const styleCarousel   = document.getElementById('styleCarousel');

    subjectCarousel.scrollTo({
        left: subjectCard.offsetLeft - (subjectCarousel.offsetWidth / 2) + (subjectCard.offsetWidth / 2),
        behavior: 'smooth'
    });

    styleCarousel.scrollTo({
        left: styleCard.offsetLeft - (styleCarousel.offsetWidth / 2) + (styleCard.offsetWidth / 2),
        behavior: 'smooth'
    });

    selectedSubject = subjectCard.dataset.name;
    selectedStyle   = styleCard.dataset.name;

    resultImages = [];
    document.getElementById('resultCarousel').innerHTML = '';
    document.getElementById('resultDots').innerHTML     = '';

    setTimeout(() => runGenerate(), 1000);
});


document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('historyBtn').addEventListener('click', () => {
        renderHistory();
        showPage('historyPage');
    });


    document.getElementById('generateBtn').addEventListener('click', () => {
        resultImages = [];
        document.getElementById('resultCarousel').innerHTML = '';
        document.getElementById('resultDots').innerHTML     = '';
        runGenerate();
    });

    document.getElementById('recreateBtn').addEventListener('click', () => {
        showPage('processingPage');
        document.getElementById('processingSubLabel').textContent =
            `${selectedSubject} × ${selectedStyle}`;
        runGenerate();
    });

    document.getElementById('downloadBtn').addEventListener('click', () => {
        if (!currentResultUrl) return;
        const a   = document.createElement('a');
        a.href    = currentResultUrl;
        a.download = `wallpaper-${selectedSubject}-${selectedStyle}.jpg`.replace(/\s+/g, '-').toLowerCase();
        a.target  = '_blank';
        a.click();
    });

    document.getElementById('backBtn').addEventListener('click', () => showPage('homePage'));
    document.getElementById('resultBackBtn').addEventListener('click', () => showPage('homePage'));

    loadPresets();
});
