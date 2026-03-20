const DEFAULT_API_KEY = 'pk_ebCkCGPi8nHcaQLZ';

function getRandomSeed() {
    return Math.floor(Math.random() * 999999);
}

function buildPrompt(subject, style, userTouch = '') {
    const touch = userTouch.trim() ? `, ${userTouch.trim()}` : '';

    return `
${subject.prompt}, reimagined in
${style.prompt} style,
centered composition, depth, cinematic lighting,
high detail, sharp focus, wallpaper
${touch}
`.replace(/\s+/g, ' ').trim();
}

function buildImageUrl(prompt) {
    const negativePrompt = `
low quality, blurry, jpeg artifacts, watermark, logo, text, signature,
distorted, deformed, bad anatomy, extra limbs
`.replace(/\s+/g, ' ').trim();

    return `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=zimage&width=1080&height=1920&safe=true&enhance=true&seed=${getRandomSeed()}&negative_prompt=${encodeURIComponent(negativePrompt)}&key=${DEFAULT_API_KEY}`;
}

async function generateWallpaper(subject, style, userTouch = '') {
    const prompt = buildPrompt(subject, style, userTouch);
    const url = buildImageUrl(prompt);

    return { url, prompt };
}
