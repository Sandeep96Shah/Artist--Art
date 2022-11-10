const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    arts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'art',
        }
    ]
}, {
    timestamps: true,
});

const cart = mongoose.model('cart', cartSchema);

module.exports = cart;