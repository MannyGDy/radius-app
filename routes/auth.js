const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../config/database');
const radiusClient = require('../config/radius');

// RADIUS Authentication Helper Function
async function authenticateWithRadius(username, password) {
    try {
        // First, verify the user exists in our database
        const user = await db.query(
            'SELECT * FROM radcheck WHERE username = $1 AND attribute = $2',
            [username, 'Cleartext-Password']
        );

        if (user.rows.length === 0) {
            return { success: false, error: 'User not found' };
        }

        // Verify password
        if (user.rows[0].value !== password) {
            return { success: false, error: 'Invalid password' };
        }

        // Now authenticate with the actual RADIUS server
        const radiusResult = await radiusClient.authenticate(username, password);
        
        if (!radiusResult.success) {
            console.error('RADIUS authentication failed:', radiusResult.error);
            return { success: false, error: 'RADIUS authentication failed' };
        }

        return { success: true, user: user.rows[0], radiusMessage: radiusResult.message };
    } catch (error) {
        console.error('RADIUS authentication error:', error);
        return { success: false, error: 'Authentication failed' };
    }
}

// User Registration
router.post('/register', async (req, res) => {
    try {
        const { fullName, companyName, email, phoneNumber } = req.body;

        // Validate input
        if (!fullName || !companyName || !email || !phoneNumber) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await db.query(
            'SELECT * FROM radcheck WHERE username = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Insert into radcheck table (FreeRADIUS authentication)
        await db.query(
            'INSERT INTO radcheck (username, attribute, op, value) VALUES ($1, $2, $3, $4)',
            [email, 'Cleartext-Password', ':=', phoneNumber]
        );

        // Insert user details into custom table for reporting
        await db.query(
            'INSERT INTO user_registrations (full_name, company_name, email, phone_number, created_at) VALUES ($1, $2, $3, $4, NOW())',
            [fullName, companyName, email, phoneNumber]
        );

        res.json({
            success: true,
            message: 'Registration successful',
            credentials: {
                username: email,
                password: phoneNumber
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// User Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Authenticate with RADIUS
        const authResult = await authenticateWithRadius(username, password);

        if (!authResult.success) {
            return res.status(401).json({ error: authResult.error });
        }

        // Set session
        req.session.user = {
            username: username,
            loggedIn: true
        };

        res.json({
            success: true,
            message: 'Login successful. You can now access the internet.',
            instructions: 'Try accessing any website to test your connection.'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

module.exports = router;
