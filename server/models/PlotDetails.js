const mongoose = require('mongoose');

const plotDetailsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    size: {
        type: String, // e.g., "50x100 ft"
        required: true,
    },
    area: {
        type: Number, // sq ft
        required: true,
    },
    shape: {
        type: String, // e.g., "Rectangular", "L-shape"
    },
    location: {
        type: String,
    },
    orientation: {
        type: String, // e.g., "North facing"
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('PlotDetails', plotDetailsSchema);
