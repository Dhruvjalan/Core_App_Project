const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    rollno: { 
        type: String, 
        required: true, 
        unique: true // Recommended to prevent duplicate rolls
    },
    name: { type: String, required: true },
    vertical: { type: String },
    access: { type: String, default: 'user' }
});

module.exports = mongoose.model('user', UserSchema);