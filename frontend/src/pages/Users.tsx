import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { 
  useGetUsersQuery, 
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '../services/api';
import { User } from '../types';
import { toast } from 'react-hot-toast';

const Users = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openNewUser, setOpenNewUser] = useState(false);
  const [openEditUser, setOpenEditUser] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'BARBER',
    status: 'ACTIVE',
  });

  const { 
    data: users = [], 
    isLoading, 
    error 
  } = useGetUsersQuery();

  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenNewUser = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'BARBER',
      status: 'ACTIVE',
    });
    setOpenNewUser(true);
  };

  const handleCloseNewUser = () => {
    setOpenNewUser(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'BARBER',
      status: 'ACTIVE',
    });
  };

  const handleOpenEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
    });
    setOpenEditUser(true);
  };

  const handleCloseEditUser = () => {
    setOpenEditUser(false);
    setSelectedUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'BARBER',
      status: 'ACTIVE',
    });
  };

  const handleOpenDeleteConfirm = (user: User) => {
    setSelectedUser(user);
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateUser = async () => {
    try {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        toast.error('Por favor completa todos los campos requeridos');
        return;
      }

      await createUser(formData).unwrap();
      toast.success('Usuario creado exitosamente');
      handleCloseNewUser();
    } catch (error) {
      console.error('Error al crear usuario:', error);
      toast.error('Error al crear el usuario');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const updateData = {
        ...formData,
        password: formData.password || undefined, // Solo incluir password si se modificó
      };

      await updateUser({
        id: selectedUser.id,
        user: updateData
      }).unwrap();
      
      toast.success('Usuario actualizado exitosamente');
      handleCloseEditUser();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      toast.error('Error al actualizar el usuario');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id).unwrap();
      toast.success('Usuario eliminado exitosamente');
      handleCloseDeleteConfirm();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast.error('Error al eliminar el usuario');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error al cargar los usuarios</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenNewUser}
        >
          Nuevo Usuario
        </Button>
      </Box>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton onClick={() => handleOpenEditUser(user)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton onClick={() => handleOpenDeleteConfirm(user)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
        />
      </Paper>

      {/* Diálogo para Nuevo Usuario */}
      <Dialog open={openNewUser} onClose={handleCloseNewUser} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Usuario</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              name="firstName"
              label="Nombre"
              value={formData.firstName}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="lastName"
              label="Apellido"
              value={formData.lastName}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="password"
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleSelectChange}
                label="Rol"
              >
                <MenuItem value="ADMIN">Administrador</MenuItem>
                <MenuItem value="BARBER">Barbero</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleSelectChange}
                label="Estado"
              >
                <MenuItem value="ACTIVE">Activo</MenuItem>
                <MenuItem value="INACTIVE">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewUser}>Cancelar</Button>
          <Button onClick={handleCreateUser} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para Editar Usuario */}
      <Dialog open={openEditUser} onClose={handleCloseEditUser} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              name="firstName"
              label="Nombre"
              value={formData.firstName}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="lastName"
              label="Apellido"
              value={formData.lastName}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="password"
              label="Contraseña (dejar en blanco para mantener)"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleSelectChange}
                label="Rol"
              >
                <MenuItem value="ADMIN">Administrador</MenuItem>
                <MenuItem value="BARBER">Barbero</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleSelectChange}
                label="Estado"
              >
                <MenuItem value="ACTIVE">Activo</MenuItem>
                <MenuItem value="INACTIVE">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditUser}>Cancelar</Button>
          <Button onClick={handleUpdateUser} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Confirmación de Eliminación */}
      <Dialog open={openDeleteConfirm} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar al usuario {selectedUser?.firstName} {selectedUser?.lastName}?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancelar</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users; 