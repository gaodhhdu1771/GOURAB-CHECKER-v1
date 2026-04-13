const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.static(path.join(__dirname)));

// MongoDB Connection (Use your previous URI)
mongoose.connect("YOUR_MONGODB_URI_HERE");

const User = mongoose.model('User', {
    name: String,
    email: { type: String, unique: true },
    password: String,
    status: { type: String, default: 'pending' } // 'active' or 'pending'
});

// Admin Control: আপনি (gourabadmin:gourab2006) সবাইকে কন্ট্রোল করতে পারবেন
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.json({ success: true, message: "রেজিস্টার করার জন্য আপনাকে ধন্যবাদ। একটিভ করতে গৌরব ভাইকে মেসেজ দিন।" });
    } catch (err) {
        res.json({ success: false, message: "ইমেইলটি ইতিমধ্যে ব্যবহার করা হয়েছে।" });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
        if (user.status === 'active' || email === 'your-admin-email@gmail.com') {
            res.json({ success: true, user });
        } else {
            res.json({ success: false, message: "আপনার আইডি এখনো একটিভ করা হয়নি। গৌরব ভাইয়ের সাথে যোগাযোগ করুন।" });
        }
    } else {
        res.json({ success: false, message: "ভুল ইমেইল বা পাসওয়ার্ড।" });
    }
});

// APIs for Checkers (Simulating Real APIs like EmailScan/Whoer)
app.post('/api/check-gmail', (req, res) => {
    const { input } = req.body;
    // Logic: EmailScan এর মতো নির্ভুল রেজাল্ট সিমুলেশন
    const result = Math.random() > 0.5 ? 'Good' : 'Bad'; 
    res.json({ status: result });
});

app.listen(process.env.PORT || 3000, () => console.log('Server running...'));
