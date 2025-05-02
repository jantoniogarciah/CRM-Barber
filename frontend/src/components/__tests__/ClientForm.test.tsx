import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ClientForm from '../ClientForm';
import { createClient } from '../../services/clientService';

// Mock the client service
jest.mock('../../services/clientService', () => ({
  createClient: jest.fn(),
  updateClient: jest.fn(),
}));

// Create a mock store
const mockStore = configureStore([thunk]);
const initialState = {
  auth: {
    user: {
      id: 1,
      role: 'admin',
      name: 'Admin User',
    },
    token: 'mock-token',
  },
};

describe('ClientForm Component', () => {
  let store;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Initialize store with initial state
    store = mockStore(initialState);
  });

  const renderComponent = (props = {}) => {
    return render(
      <Provider store={store}>
        <SnackbarProvider>
          <BrowserRouter>
            <ClientForm {...props} />
          </BrowserRouter>
        </SnackbarProvider>
      </Provider>
    );
  };

  it('renders the form with all fields', () => {
    renderComponent();

    // Check if form elements are rendered
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/barber/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('displays validation errors when form is submitted with empty fields', async () => {
    renderComponent();

    // Submit the form without filling any fields
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone is required/i)).toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    // Mock the createClient function to return a successful response
    (createClient as jest.Mock).mockResolvedValueOnce({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      barberId: 2,
    });

    renderComponent();

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: '1234567890' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    // Check if the createClient function was called with the correct data
    await waitFor(() => {
      expect(createClient).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        barberId: undefined, // Default value
      });
    });
  });

  it('displays a success message after successful submission', async () => {
    // Mock the createClient function to return a successful response
    (createClient as jest.Mock).mockResolvedValueOnce({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      barberId: 2,
    });

    renderComponent();

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: '1234567890' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    // Check if a success message is displayed
    await waitFor(() => {
      expect(screen.getByText(/client created successfully/i)).toBeInTheDocument();
    });
  });

  it('displays an error message when submission fails', async () => {
    // Mock the createClient function to throw an error
    (createClient as jest.Mock).mockRejectedValueOnce(new Error('Failed to create client'));

    renderComponent();

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: '1234567890' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    // Check if an error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to create client/i)).toBeInTheDocument();
    });
  });

  it('pre-fills the form when editing an existing client', () => {
    const existingClient = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      barberId: 2,
    };

    renderComponent({ client: existingClient, isEditing: true });

    // Check if form fields are pre-filled with the client data
    expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe');
    expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com');
    expect(screen.getByLabelText(/phone/i)).toHaveValue('1234567890');
    expect(screen.getByLabelText(/barber/i)).toHaveValue('2');
  });

  it('calls updateClient instead of createClient when editing', async () => {
    const existingClient = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      barberId: 2,
    };

    // Mock the updateClient function
    const { updateClient } = require('../../services/clientService');
    (updateClient as jest.Mock).mockResolvedValueOnce({
      ...existingClient,
      name: 'Updated Name',
    });

    renderComponent({ client: existingClient, isEditing: true });

    // Change a field
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Updated Name' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    // Check if updateClient was called instead of createClient
    await waitFor(() => {
      expect(updateClient).toHaveBeenCalledWith(1, {
        name: 'Updated Name',
        email: 'john@example.com',
        phone: '1234567890',
        barberId: 2,
      });
      expect(createClient).not.toHaveBeenCalled();
    });
  });
});
