# Clipper Cut CRM Frontend

This is the frontend application for the Clipper Cut CRM system, built with React, TypeScript, and Material-UI.

## Features

- User authentication and authorization
- Client management
- Service management
- Appointment scheduling
- Barber management
- Real-time notifications using WebSocket
- Responsive design
- Dark/light theme support

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Backend server running on port 3001

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/CRM-Barber.git
cd CRM-Barber/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add the following environment variables:
```bash
REACT_APP_API_URL=http://localhost:3001/api
```

## Development

To start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Building for Production

To create a production build:

```bash
npm run build
```

The build files will be available in the `build` directory.

## Testing

To run tests:

```bash
npm test
```

## Linting

To run the linter:

```bash
npm run lint
```

To fix linting issues automatically:

```bash
npm run lint:fix
```

## Code Formatting

To format code:

```bash
npm run format
```

## Project Structure

```
src/
  ├── assets/         # Static assets like images and icons
  ├── components/     # Reusable React components
  ├── contexts/       # React context providers
  ├── hooks/         # Custom React hooks
  ├── pages/         # Page components
  ├── services/      # API services and utilities
  ├── store/         # Redux store configuration and slices
  ├── types/         # TypeScript type definitions
  ├── utils/         # Utility functions
  ├── App.tsx        # Main application component
  └── index.tsx      # Application entry point
```

## Dependencies

- React
- TypeScript
- Material-UI
- Redux Toolkit
- React Router
- Formik
- Yup
- Socket.IO Client
- Date-fns
- React Hot Toast
- Notistack

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 