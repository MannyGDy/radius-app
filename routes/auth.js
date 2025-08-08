const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../config/database');

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

        // Hash the phone number (password)
        const hashedPassword = await bcrypt.hash(phoneNumber, 10);

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

        // Check if user exists in radcheck
        const user = await db.query(
            'SELECT * FROM radcheck WHERE username = $1 AND attribute = $2',
            [username, 'Cleartext-Password']
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        if (user.rows[0].value !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set session
        req.session.user = {
            username: username,
            loggedIn: true
        };

        res.json({
            success: true,
            message: 'Login successful'
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
