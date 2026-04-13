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
mongoose.connect("mongodb+srv://gourabadmin:gourab2006@cluster0.xiyfnuj.mongodb.net/?retryWrites=true&w=majority")
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log(err));

const User = mongoose.model('User', { 
    name: String, email: { type: String, unique: true }, password: String, status: { type: String, default: 'Pending' } 
});

const ScanResult = mongoose.model('ScanResult', { input: String, type: String, status: String });

// Registration API
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.json({ success: true });
    } catch (err) { res.json({ success: false, message: "Email already exists!" }); }
});

// Login API
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    // Master Admin Login
    if (email === "gourabmon112233@gmail.com" && password === "goUrab@2008") {
        return res.json({ success: true, role: 'Admin' });
    }
    const user = await User.findOne({ email, password });
    if (user) {
        if (user.status === 'Approved') return res.json({ success: true, role: 'User' });
        return res.json({ success: false, message: "Pending" });
    }
    res.json({ success: false, message: "Invalid email or password!" });
});

// Checker Logic: একই ডাটাতে রিপোর্ট পাল্টাবে না
app.post('/api/check', async (req, res) => {
    const { input, type } = req.body;
    let existing = await ScanResult.findOne({ input, type });
    if (existing) return res.json({ status: existing.status });
    
    const status = ['LIVE', 'DIE'][Math.floor(Math.random() * 2)];
    await new ScanResult({ input, type, status }).save();
    res.json({ status });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
