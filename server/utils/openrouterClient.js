const axios = require('axios');

const OPEN_ROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY;
const OPEN_ROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Generate text completion using OpenRouter
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Additional options like temperature, max_tokens
 * @returns {Promise<string>} - Generated text response
 */
async function generateChatCompletion(messages, options = {}) {
    try {
        const response = await axios.post(
            OPEN_ROUTER_URL,
            {
                model: options.model || 'google/gemini-2.0-flash-001',
                messages: messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.max_tokens || 1000,
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPEN_ROUTER_API_KEY}`,
                    'HTTP-Referer': 'http://localhost:3000', // Optional, for OpenRouter analytics
                    'X-Title': 'AI Home Blueprint', // Optional
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.data || !response.data.choices || !response.data.choices[0]) {
            throw new Error('Invalid response from OpenRouter API');
        }

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('OpenRouter API Error:', error.response?.data || error.message);
        throw new Error(`Text generation failed: ${error.message}`);
    }
}

/**
 * Generate structured JSON response using OpenRouter
 * @param {Array} messages - Array of message objects
 * @returns {Promise<Object>} - Parsed JSON object
 */
async function generateJSONCompletion(messages) {
    try {
        const response = await generateChatCompletion(messages, {
            temperature: 0.1,
            max_tokens: 2000,
        });

        console.log('Raw AI Response for JSON:', response);

        // Try to find JSON block
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('AI Response did not contain JSON:', response);
            throw new Error('No valid JSON found in response');
        }

        try {
            return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError, 'Raw matched string:', jsonMatch[0]);
            throw parseError;
        }
    } catch (error) {
        console.error('JSON generation failed:', error);
        throw new Error(`JSON generation failed: ${error.message}`);
    }
}

module.exports = {
    generateChatCompletion,
    generateJSONCompletion,
};
