const DEFAULT_API_KEY = 'pk_ebCkCGPi8nHcaQLZ';

function getRandomSeed() {
    return Math.floor(Math.random() * 9999);
}

function buildPrompt(subjectName, styleName, userTouch = '') {
    const touch = userTouch.trim() ? `, ${userTouch.trim()}` : '';
    return `${subjectName} reimagined in ${styleName} Style ${touch}, ultra detailed, 8K, sharp focus, masterpiece, best quality, wallpaper`;
}

function buildImageUrl(prompt) {
    const negativePrompt = 'low quality, blurry, jpeg artifacts, overexposed, underexposed, watermark, logo, text, signature';
    return `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=flux&width=1080&height=1920&safe=true&enhance=true&seed=${getRandomSeed()}&negative_prompt=${encodeURIComponent(negativePrompt)}&key=${DEFAULT_API_KEY}`;
}

async function generateWallpaper(subjectName, styleName, userTouch = '') {
    const prompt = buildPrompt(subjectName, styleName, userTouch);
    const url    = buildImageUrl(prompt);
    return { url, prompt };
}
