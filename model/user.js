const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    phoneNo: {
        type: Number,
    },
    bio: {
        type: String,
    },
    profilePic: {
        type: String,
    },
    isSeller: {
        type: Boolean,
        default: false,
    },
    address: {
        type: String,
    }
}, {
    timestamps: true
});

const users = mongoose.model('users', userSchema);

module.exports = users;