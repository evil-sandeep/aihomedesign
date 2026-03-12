const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    messages: {
        type: Array,
        default: [],
    },
    layout: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    palette: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    renders: {
        type: Array,
        default: [],
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('History', historySchema);
