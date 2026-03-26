const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); 
app.get('/', (req, res) => {
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
    `);
});