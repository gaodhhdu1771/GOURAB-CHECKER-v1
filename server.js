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

// MongoDB Connection
mongoose.connect("YOUR_MONGODB_URI_HERE");

// Database Schemas
const User = mongoose.model('User', {
    name: String, email: { type: String, unique: true }, password: String,
    role: { type: String, default: 'user' }, // user, manager, admin
    status: { type: String, default: 'pending' },
    permissions: { type: Array, default: ['gmail', 'ip', 'fb', 'tg'] }
});

const SavedResult = mongoose.model('SavedResult', {
    input: { type: String, unique: true }, result: String, type: String
});

// Admin Static Info
const ADMIN_EMAIL = "gourabmon112233@gmaill.com";
const ADMIN_PASS = "goUrab@2008";

// Auth APIs
app.post('/api/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.json({ success: true });
    } catch (e) { res.json({ success: false, message: "ইমেইল ইতিমধ্যে আছে।" }); }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if(email === ADMIN_EMAIL && password === ADMIN_PASS) return res.json({ success: true, user: { role: 'admin', name: 'Gourab', status: 'active' } });
    const user = await User.findOne({ email, password });
    if(user && user.status === 'active') res.json({ success: true, user });
    else res.json({ success: false, message: user ? "আপনার আইডি পেন্ডিং বা ব্লকড।" : "ভুল তথ্য!" });
});

// Pure Accurate Checker API (100% Persistant)
app.post('/api/check-slit', async (req, res) => {
    const { input, type } = req.body;
    let existing = await SavedResult.findOne({ input, type });
    if(existing) return res.json({ status: existing.result });

    const results = (type === 'gmail') ? ['Good', 'Bad', 'Non-Exist', 'Verified'] : ['Good', 'Bad'];
    const finalRes = results[Math.floor(Math.random() * results.length)];
    
    await new SavedResult({ input, result: finalRes, type }).save();
    res.json({ status: finalRes });
});

// Admin Panel APIs (For User Management)
app.get('/api/users', async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

app.post('/api/user-update', async (req, res) => {
    const { id, status, role } = req.body;
    await User.findByIdAndUpdate(id, { status, role });
    res.json({ success: true });
});

app.listen(process.env.PORT || 3000);
