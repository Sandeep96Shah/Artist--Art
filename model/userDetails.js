const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema({
   user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
   },
    interests : [
        {
            type: String,
        }
    ],
    notification: [
        {
            type: String,
        }
    ],
}, {
    timestamps: true
});

const userDetails = mongoose.model('UserDetails', userDetailsSchema);

module.exports = userDetails;