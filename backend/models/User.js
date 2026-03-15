const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        username: {  // Changed 'name' to 'username' to match frontend
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        }
    },
    { timestamps: true } // Automatically adds createdAt & updatedAt
);

module.exports = mongoose.model("User", UserSchema);
