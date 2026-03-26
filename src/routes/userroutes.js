const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Endpoint: GET /api/check-user/:rollno
router.get('/check-user/:rollno', async (req, res) => {
    try {
        console.log("Checking user in database...");
        let { rollno } = req.params;
        console.log(rollno);    
        rollno = rollno.toLowerCase();

        const userExists = await User.exists({ rollno: rollno });

        if (userExists) {
            console.log("User found in database.");
            return res.status(200).json({ 
                exists: true, 
                message: "User found in database." 
            });
        } else {
            console.log("User does not exist.");
            return res.status(404).json({ 
                exists: false, 
                message: "User does not exist." 
            });
        }
    } catch (error) {
        res.status(500).json({ error: "Server error checking database.", errorMessage: error.message });
    }
});

module.exports = router;