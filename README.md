# Barber Shop CRM

A comprehensive Customer Relationship Management system designed specifically for barber shops. This application helps manage clients, appointments, services, and staff efficiently.

## Features

- 👥 **Client Management**
  - Client profiles with contact information
  - Appointment history
  - Service preferences
  - Notes and special requests

- 📅 **Appointment Scheduling**
  - Real-time availability checking
  - Online booking system
  - Automated reminders
  - Conflict prevention

- 💇 **Service Management**
  - Service catalog
  - Pricing management
  - Duration tracking
  - Service categories

- 👨‍💼 **Staff Management**
  - Barber profiles
  - Schedule management
  - Performance tracking
  - Commission tracking

- 🔔 **Notifications**
  - Real-time notifications
  - Email notifications
  - SMS notifications (optional)
  - Appointment reminders

- 📊 **Reporting**
  - Daily/weekly/monthly reports
  - Revenue tracking
  - Client analytics
  - Staff performance metrics

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- Knex.js (Query Builder)
- Socket.IO (Real-time features)
- JWT Authentication

### Frontend
- React
- Material-UI
- Redux Toolkit
- React Query
- Socket.IO Client

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/barber-shop-crm.git
cd barber-shop-crm
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
```bash
# In the backend directory
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
# In the backend directory
npm run migrate
npm run seed
```

5. Start the development servers:
```bash
# Start backend server (from backend directory)
npm run dev

# Start frontend server (from frontend directory)
npm start
```

## Environment Variables

The application requires several environment variables to be set. See `.env.example` for all required variables and their descriptions.

Key variables include:
- Database configuration
- JWT secret
- Email settings
- Frontend URL
- API keys (if using external services)

## API Documentation

The API documentation is available at `/api-docs` when running the server in development mode.

Key endpoints:
- `/api/users` - User management
- `/api/clients` - Client management
- `/api/services` - Service management
- `/api/appointments` - Appointment management
- `/api/notifications` - Notification management

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Style
- ESLint for JavaScript/TypeScript
- Prettier for code formatting
- Husky for pre-commit hooks

## Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Set up production environment variables:
```bash
# In the backend directory
cp .env.example .env.production
# Edit .env.production with production values
```

3. Start the production server:
```bash
cd backend
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@barbershopcrm.com or open an issue in the GitHub repository.

## Acknowledgments

- Material-UI for the component library
- PostgreSQL for the database
- All contributors who have helped with the project 