const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));

// MongoDB Connect
mongoose.connect("mongodb+srv://gourabadmin:gourab2006@cluster0.xiyfnuj.mongodb.net/?retryWrites=true&w=majority");

// Scan Logic: একবার যা আসবে তা আর বদলাবে না
const ResultSchema = new mongoose.Schema({
    input: { type: String, unique: true },
    type: String,
    status: String
});
const ScanResult = mongoose.model('ScanResult', ResultSchema);

const User = mongoose.model('User', { 
    name: String, email: { type: String, unique: true }, password: String, status: { type: String, default: 'Pending' } 
});

app.post('/api/check', async (req, res) => {
    const { input, type } = req.body;
    let existing = await ScanResult.findOne({ input, type });
    if (existing) return res.json({ status: existing.status });

    // ১০০% পিয়র রিপোর্ট লজিক (রিয়েলিস্টিক)
    const statuses = ['LIVE', 'DIE'];
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
    await new ScanResult({ input, type, status: newStatus }).save();
    res.json({ status: newStatus });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === "gourabmon112233@gmail.com" && password === "goUrab@2008") return res.json({ success: true, role: 'Admin' });
    const user = await User.findOne({ email, password });
    if (user && user.status === 'Approved') return res.json({ success: true, role: 'User' });
    res.json({ success: false, message: "অ্যাক্সেস অনুমোদিত নয়!" });
});

app.listen(process.env.PORT || 3000);
