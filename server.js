const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ================= MongoDB Atlas Connection =================
const MONGO_URI = process.env.MONGO_URI

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Atlas Connected"))
    .catch(err => console.log("Mongo Error:", err));

// ================= User Schema =================
const UserSchema = new mongoose.Schema({
    name: String,
    registrationNo: String,
    id: String,
    program: String,
    currentbalance: String,
    password: String,
    profilepic: String,
});

// Explicitly map to PORTAL collection
const User = mongoose.model('User', UserSchema, 'PORTAL');

app.post('/login', async (req, res) => {
    const { registrationNo, password } = req.body;

    if (!registrationNo || !password) {
        return res.status(400).json({ message: 'All fields required' });
    }

    try {
        const user = await User.findOne({ registrationNo });

        if (!user) {
            return res.status(401).json({ message: 'Invalid Registration Number' });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid Password' });
        }

        res.json({
            success: true,
            message: 'Login Successful',
            user: {
                registrationNo: user.registrationNo,
                name: user.name,
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// ================= RIGHT SIDEBAR USER DATA API =================
// Get full user profile for RightSidebar
app.get('/user/:regNo', async (req, res) => {
    try {
        const user = await User.findOne(
            { registrationNo: req.params.regNo },
            { password: 0 } // ❌ do not send password
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
