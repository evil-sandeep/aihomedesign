const mongoose = require('mongoose');

const blueprintLayoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    requirements: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HouseRequirements',
        required: true,
    },
    layoutData: {
        type: mongoose.Schema.Types.Mixed, // Stores JSON structure of rooms, dimensions, and positions
        required: true,
    },
    svgPath: {
        type: String, // Path or raw SVG string for rendering
    },
    version: {
        type: Number,
        default: 1,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('BlueprintLayout', blueprintLayoutSchema);
