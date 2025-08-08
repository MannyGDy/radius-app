const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
    if (!req.session.admin) {
        return res.status(401).json({ error: 'Admin access required' });
    }
    next();
};

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // You can configure admin credentials in environment variables
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        if (username === adminUsername && password === adminPassword) {
            req.session.admin = true;
            res.json({ success: true, message: 'Admin login successful' });
        } else {
            res.status(401).json({ error: 'Invalid admin credentials' });
        }

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Admin login failed' });
    }
});

// Get all user registrations (admin only)
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM user_registrations ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            users: result.rows
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user statistics (admin only)
router.get('/stats', requireAdmin, async (req, res) => {
    try {
        const totalUsers = await db.query('SELECT COUNT(*) FROM user_registrations');
        const todayUsers = await db.query(
            'SELECT COUNT(*) FROM user_registrations WHERE DATE(created_at) = CURRENT_DATE'
        );
        const thisWeekUsers = await db.query(
            'SELECT COUNT(*) FROM user_registrations WHERE created_at >= NOW() - INTERVAL \'7 days\''
        );

        res.json({
            success: true,
            stats: {
                total: parseInt(totalUsers.rows[0].count),
                today: parseInt(todayUsers.rows[0].count),
                thisWeek: parseInt(thisWeekUsers.rows[0].count)
            }
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Export users data as CSV (admin only)
router.get('/export', requireAdmin, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT full_name, company_name, email, phone_number, created_at FROM user_registrations ORDER BY created_at DESC'
        );

        // Create CSV content
        let csv = 'Full Name,Company Name,Email,Phone Number,Registration Date\n';
        
        result.rows.forEach(user => {
            csv += `"${user.full_name}","${user.company_name}","${user.email}","${user.phone_number}","${user.created_at}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="user_registrations.csv"');
        res.send(csv);

    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

// Admin logout
router.post('/logout', (req, res) => {
    req.session.admin = false;
    res.json({ success: true, message: 'Admin logged out successfully' });
});

module.exports = router;
