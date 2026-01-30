const axios = require('axios');

const DEEPAI_API_KEY = process.env.DEEPAI_API_KEY;
const DEEPAI_API_URL = 'https://api.deepai.org/api/text2img';

/**
 * Generate image using DeepAI API
 * @param {string} prompt - Text description for image generation
 * @param {Object} options - Additional options like width, height
 * @returns {Promise<string>} - URL of generated image
 */
async function generateImage(prompt, options = {}) {
    try {
        const formData = new URLSearchParams();
        formData.append('text', prompt);

        // Optional parameters
        if (options.width) formData.append('width', options.width);
        if (options.height) formData.append('height', options.height);
        if (options.grid_size) formData.append('grid_size', options.grid_size);

        const response = await axios.post(DEEPAI_API_URL, formData, {
            headers: {
                'api-key': DEEPAI_API_KEY,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (!response.data || !response.data.output_url) {
            throw new Error('Invalid response from DeepAI API');
        }

        return response.data.output_url;
    } catch (error) {
        console.error('DeepAI API Error:', error.response?.data || error.message);
        throw new Error(`Image generation failed: ${error.message}`);
    }
}

/**
 * Generate multiple images concurrently
 * @param {Array<string>} prompts - Array of text prompts
 * @param {Object} options - Additional options
 * @returns {Promise<Array<string>>} - Array of image URLs
 */
async function generateMultipleImages(prompts, options = {}) {
    try {
        const results = [];
        for (const prompt of prompts) {
            console.log(`Generating image for prompt: ${prompt.substring(0, 50)}...`);
            const url = await generateImage(prompt, options);
            results.push(url);
            // Small delay to prevent rate limiting on free tier
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        return results;
    } catch (error) {
        console.error('Multiple image generation failed:', error);
        throw new Error(`Multiple image generation failed: ${error.message}`);
    }
}

/**
 * Generate high-quality architectural render
 * @param {string} prompt - Architectural description
 * @returns {Promise<string>} - URL of generated image
 */
async function generateArchitecturalRender(prompt) {
    // Enhance prompt for better architectural results
    const enhancedPrompt = `Professional architectural visualization: ${prompt}. 
    Photorealistic, high detail, 8k quality, architectural photography style, 
    professional lighting, no text, no watermarks.`;

    return await generateImage(enhancedPrompt, {
        width: 1024,
        height: 1024,
    });
}

module.exports = {
    generateImage,
    generateMultipleImages,
    generateArchitecturalRender,
};
