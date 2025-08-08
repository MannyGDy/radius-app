const express = require('express');
const router = express.Router();

// Check if user is authenticated
router.get('/status', (req, res) => {
    if (req.session.user && req.session.user.loggedIn) {
        res.json({
            authenticated: true,
            username: req.session.user.username
        });
    } else {
        res.json({
            authenticated: false
        });
    }
});

// Get user info
router.get('/user', (req, res) => {
    if (req.session.user && req.session.user.loggedIn) {
        res.json({
            success: true,
            user: {
                username: req.session.user.username
            }
        });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

module.exports = router;
