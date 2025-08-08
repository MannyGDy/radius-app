# Radius Captive Portal

A beautiful, modern captive portal web application designed for MikroTik routers with FreeRADIUS integration. This application allows users to register and authenticate through a stunning web interface, with automatic credential generation for FreeRADIUS authentication.

## 🌟 Features

- **Beautiful Modern UI**: Responsive design with smooth animations and modern aesthetics
- **User Registration**: Collect user information (name, company, email, phone)
- **Auto-Credential Generation**: Username = email, Password = phone number
- **FreeRADIUS Integration**: Automatic user addition to radcheck table
- **Admin Panel**: Complete admin dashboard with user management and reporting
- **CSV Export**: Download user registration data as CSV reports
- **Mobile Responsive**: Works perfectly on all devices
- **Session Management**: Secure user sessions with automatic logout
- **Real-time Statistics**: Live user registration statistics

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- FreeRADIUS server
- MikroTik router

### Installation

1. **Clone or download the project**
   ```bash
   cd radius-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3000
   SESSION_SECRET=your-super-secret-session-key
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=radius
   DB_USER=postgres
   DB_PASSWORD=your_database_password
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```

4. **Set up the database**
   ```bash
   # Connect to your PostgreSQL database and run:
   psql -U postgres -d radius -f database-setup.sql
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Main Portal: `http://localhost:3000`
   - Admin Panel: `http://localhost:3000/admin.html`

## 📋 Database Setup

The application requires two main tables:

1. **`user_registrations`** - Stores user registration data
2. **`radcheck`** - FreeRADIUS authentication table (should already exist)

Run the provided `database-setup.sql` script to create the necessary tables and indexes.

## 🔧 MikroTik Configuration

### Hotspot Setup

1. Configure your MikroTik router's hotspot
2. Set the captive portal URL to your server's IP address and port
3. Example: `http://192.168.1.100:3000`

### FreeRADIUS Integration

Ensure your FreeRADIUS server is configured to:
- Use PostgreSQL as the database backend
- Read from the `radcheck` table for authentication
- Accept the credentials format used by this application

## 🎨 Features in Detail

### User Registration Flow

1. User connects to WiFi
2. Gets redirected to captive portal
3. Clicks "Register" button
4. Fills out registration form:
   - Full Name
   - Company Name
   - Email Address
   - Phone Number
5. System automatically creates:
   - Username = email address
   - Password = phone number
6. Credentials are added to FreeRADIUS database
7. User can immediately connect to internet

### Admin Panel Features

- **Dashboard Statistics**: Total users, today's registrations, weekly registrations
- **User Management**: View all registered users in a searchable table
- **Data Export**: Download user data as CSV file
- **Real-time Updates**: Auto-refresh data every 30 seconds
- **Secure Access**: Admin authentication required

### Security Features

- Session-based authentication
- Input validation and sanitization
- SQL injection protection
- XSS protection
- Secure password handling

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Mobile phones
- Tablets
- Desktop computers
- All modern browsers

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get statistics
- `GET /api/admin/export` - Export CSV data
- `POST /api/admin/logout` - Admin logout

### Portal
- `GET /api/portal/status` - Check authentication status
- `GET /api/portal/user` - Get user info

## 🛠️ Customization

### Styling
- Edit `public/styles.css` to customize the appearance
- Modify colors, fonts, and layout as needed
- Add your company branding

### Functionality
- Modify `routes/auth.js` for custom registration logic
- Update `routes/admin.js` for additional admin features
- Customize database queries in the route files

### Configuration
- Update environment variables in `.env` file
- Modify database connection settings
- Change admin credentials

## 🚀 Deployment

### Production Setup

1. **Set environment variables for production**
   ```env
   NODE_ENV=production
   SESSION_SECRET=your-production-secret-key
   ```

2. **Use a process manager like PM2**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "radius-portal"
   pm2 startup
   pm2 save
   ```

3. **Set up reverse proxy (Nginx/Apache)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable HTTPS with Let's Encrypt**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check database credentials in `.env`
   - Ensure PostgreSQL is running
   - Verify database exists

2. **FreeRADIUS Integration Issues**
   - Confirm radcheck table exists
   - Check FreeRADIUS configuration
   - Verify database permissions

3. **MikroTik Redirect Issues**
   - Check hotspot configuration
   - Verify portal URL is correct
   - Ensure server is accessible from router

### Logs

Check application logs for detailed error information:
```bash
# If using PM2
pm2 logs radius-portal

# Direct logging
npm run dev
```

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review the code comments
- Create an issue on the repository

---

**Built with ❤️ for seamless WiFi authentication**
