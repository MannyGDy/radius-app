// Admin Panel JavaScript

// DOM elements
const adminLoginSection = document.getElementById('adminLoginSection');
const adminDashboard = document.getElementById('adminDashboard');
const adminLoginForm = document.getElementById('adminLoginForm');
const loadingOverlay = document.getElementById('loadingOverlay');
const notification = document.getElementById('notification');

// Stats elements
const totalUsers = document.getElementById('totalUsers');
const todayUsers = document.getElementById('todayUsers');
const weekUsers = document.getElementById('weekUsers');

// Table elements
const usersTableBody = document.getElementById('usersTableBody');

// Check admin authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    // For now, we'll show the login form
    // In a real implementation, you might want to check for existing admin session
    showAdminLogin();
});

// Admin login form handler
adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();

    const formData = {
        username: document.getElementById('adminUsername').value.trim(),
        password: document.getElementById('adminPassword').value.trim()
    };

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showAdminDashboard();
            await loadDashboardData();
            showNotification('Admin login successful!', 'success');
        } else {
            throw new Error(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Admin login error:', error);
        showNotification(error.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
        hideLoading();
    }
});

// Show admin login
function showAdminLogin() {
    adminLoginSection.style.display = 'block';
    adminDashboard.style.display = 'none';
}

// Show admin dashboard
function showAdminDashboard() {
    adminLoginSection.style.display = 'none';
    adminDashboard.style.display = 'block';
}

// Load dashboard data
async function loadDashboardData() {
    try {
        await Promise.all([
            loadStats(),
            loadUsers()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();

        if (data.success) {
            totalUsers.textContent = data.stats.total;
            todayUsers.textContent = data.stats.today;
            weekUsers.textContent = data.stats.thisWeek;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        totalUsers.textContent = 'Error';
        todayUsers.textContent = 'Error';
        weekUsers.textContent = 'Error';
    }
}

// Load users
async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users');
        const data = await response.json();

        if (data.success) {
            displayUsers(data.users);
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Failed to load users', 'error');
    }
}

// Display users in table
function displayUsers(users) {
    usersTableBody.innerHTML = '';

    if (users.length === 0) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                    No users registered yet
                </td>
            </tr>
        `;
        return;
    }

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(user.full_name)}</td>
            <td>${escapeHtml(user.company_name)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td>${escapeHtml(user.phone_number)}</td>
            <td>${formatDate(user.created_at)}</td>
        `;
        usersTableBody.appendChild(row);
    });
}

// Export data as CSV
async function exportData() {
    try {
        showLoading();
        const response = await fetch('/api/admin/export');
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `user_registrations_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showNotification('Data exported successfully!', 'success');
        } else {
            throw new Error('Export failed');
        }
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export data', 'error');
    } finally {
        hideLoading();
    }
}

// Refresh data
async function refreshData() {
    showLoading();
    await loadDashboardData();
    hideLoading();
    showNotification('Data refreshed!', 'success');
}

// Admin logout
async function adminLogout() {
    try {
        const response = await fetch('/api/admin/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (data.success) {
            showAdminLogin();
            showNotification('Logged out successfully', 'success');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Logout failed', 'error');
    }
}

// Utility functions
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Auto-refresh data every 30 seconds
setInterval(() => {
    if (adminDashboard.style.display !== 'none') {
        loadDashboardData();
    }
}, 30000);
