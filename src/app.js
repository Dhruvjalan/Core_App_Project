const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./routes/UserRoutes');
const cors = require('cors');
const connectDB = require('./config/db');
dotenv.config();
connectDB();


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); 
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: "success", 
        message: "Server is live! Hello World." 
    });
});

// ... other middleware
app.use('/api', userRoutes);
app.get('/login', (req, res) => {
    res.status(200).json({ 
        status: "success", 
        message: "Server is live! Hello World." 
    });
});

// 4. Start the Server
app.listen(PORT, () => {
    console.log(`
    Server is running on port: ${PORT}
    Visit URL: http://localhost:${PORT}
    MongoDB Connected.
    `);
});