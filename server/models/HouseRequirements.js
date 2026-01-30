const mongoose = require('mongoose');

const houseRequirementsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    plot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PlotDetails',
        required: true,
    },
    numRooms: {
        type: Number,
        required: true,
    },
    numFloors: {
        type: Number,
        default: 1,
    },
    style: {
        type: String, // e.g., "Modern", "Classic", "Minimalist"
        required: true,
    },
    features: [String], // e.g., ["Kitchen Garden", "Swimming Pool", "Garage"]
    budget: {
        type: String,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('HouseRequirements', houseRequirementsSchema);
