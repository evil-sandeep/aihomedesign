const mongoose = require('mongoose');

const colorSuggestionsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlueprintLayout',
    },
    paletteName: {
        type: String,
        required: true,
    },
    colors: [{
        hex: String,
        name: String,
        usage: String, // e.g., "Primary Wall", "Accent", "Flooring"
    }],
    description: {
        type: String,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('ColorSuggestions', colorSuggestionsSchema);
