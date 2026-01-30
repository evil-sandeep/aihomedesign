const mongoose = require('mongoose');

const designImageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    blueprint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlueprintLayout',
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Exterior', 'Interior', 'BirdEye'],
        default: 'Exterior',
    },
    prompt: {
        type: String, // The prompt used to generate this image
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('DesignImage', designImageSchema);
