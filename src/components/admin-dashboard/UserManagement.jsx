import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSearch, FaClock } from 'react-icons/fa';
import { Route, Link, Routes, useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { AuthContext } from '../AuthContext';
import ShiftSchedule from '../user-dashboard/ShiftSchedule';
import {
  Container,
  Paper,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  DialogContentText
} from '@mui/material';

// Configuration for React Big Calendar
const localizer = momentLocalizer(moment);

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledContainer = styled(Container)`
  padding: 20px;
  margin-top: 20px;
`;

const StyledPaper = styled(Paper)`
  padding: 20px;
  margin-bottom: 20px;
`;

const UserSelector = styled(FormControl)`
  min-width: 200px;
  margin-bottom: 20px;
`;

const ScheduleContainer = styled(Box)`
  height: calc(100vh - 300px);
  margin-top: 20px;
`;

const AddButton = styled.button`
  padding: 12px 20px;
  background: rgb(24, 52, 81);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  transition: 0.3s;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  &:hover {
    background: rgb(29, 57, 87);
  }
  svg {
    margin-right: 8px;
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 10px;
  border-radius: 30px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  width: 300px;
  input {
    border: none;
    outline: none;
    flex: 1;
    margin-left: 10px;
    font-size: 16px;
  }
  svg {
    color: #888;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  background: rgb(27, 49, 73);
  color: white;
  padding: 12px;
  text-align: left;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #ddd;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  svg {
    cursor: pointer;
    transition: 0.3s;
    &:hover {
      transform: scale(1.1);
    }
  }
`;

const DialogBox = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.3s ease-in-out;
  width: 400px;
  text-align: center;
  z-index: 1000;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const CloseIcon = styled(FaTimes)`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: red;
  font-size: 20px;
  z-index: 1001;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
`;

const FormButton = styled.button`
  padding: 10px 20px;
  background: rgb(33, 56, 80);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: 0.3s;
  &:hover {
    background: rgb(16, 31, 47);
  }
`;

const DeleteConfirmationDialog = styled(DialogBox)`
  width: 300px;
`;

const DeleteButton = styled(FormButton)`
  background: rgb(130, 52, 60);
  margin-right: 10px;
  &:hover {
    background: rgb(130, 52, 60);
  }
`;

const CancelButton = styled(FormButton)`
  background: #6c757d;
  &:hover {
    background: #5a6268;
  }
`;

const UserManagement = () => {
  const { user: adminUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssignShiftDialog, setShowAssignShiftDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    userid: '',
    firstname: '',
    lastname: '',
    emailaddress: '',
    password: '',
    role: '',
    eligibleshifts: [],
    createddate: '',
    updateddate: '',
    passwordhash: '',
    shifttypeid: '',
    shiftstarttime: '',
    shiftendtime: '',
    shiftlocation: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [shiftTypes, setShiftTypes] = useState([]);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [showDeleteShiftDialog, setShowDeleteShiftDialog] = useState(false);
  const [deletingShiftId, setDeletingShiftId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Filter out admin users and sort by name
        const filteredUsers = response.data
          .filter(user => user.role !== 'Admin')
          .sort((a, b) => a.firstname.localeCompare(b.firstname));

        setUsers(filteredUsers);
        
        // Set first user as default selected if available
        if (filteredUsers.length > 0 && !selectedUserId) {
          setSelectedUserId(filteredUsers[0].userid);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (adminUser?.role === 'Admin') {
      fetchUsers();
    }
  }, [adminUser]);

  useEffect(() => {
    const fetchShiftTypes = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/shift-types`);
        setShiftTypes(response.data);
      } catch (err) {
        console.error('Error fetching shift types:', err);
      }
    };

    fetchShiftTypes();
  }, []);

  const handleAssignShift = (user) => {
    if (user.role === 'Agent') {
      navigate(`/user/${user.userid}/schedule`);
    }
  };

  const handleEditUser = (user) => {
    setFormData({ 
      ...formData,
      userid: user.userid,
      firstname: user.firstname,
      lastname: user.lastname,
      emailaddress: user.emailaddress,
      role: user.role,
      eligibleshifts: user.eligibleshifts || [],
    });
    setEditingUser(user);
    setShowUserDialog(true);
  };

  const handleDeleteUser = (id) => {
    setDeletingUserId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${deletingUserId}`);
      setUsers(users.filter((user) => user.userid !== deletingUserId));
      
      // Clear delete state and close modal
      setDeletingUserId(null);
      setShowDeleteDialog(false);
      
      // If the deleted user was selected, clear the selection
      if (deletingUserId === selectedUserId) {
        setSelectedUserId('');
      }
    } catch (error) {
      console.error("Error deleting user Please ensure the user has no pending overtime/shift swap requests :", error);
      alert(error.response?.data?.message || "Error deleting user Please ensure the user has no pending overtime/shift swap requests :");
    }
  };

  const handleEditShift = (shift) => {
    setFormData({
      shifttypeid: shift.shifttypeid,
      shiftstarttime: moment(shift.shiftstarttime).format('YYYY-MM-DDTHH:mm'),
      shiftendtime: moment(shift.shiftendtime).format('YYYY-MM-DDTHH:mm'),
      shiftlocation: shift.shiftlocation
    });
    setEditingShift(shift);
    setShowDialog(true);
  };

  const handleDeleteShift = (shiftId) => {
    setDeletingShiftId(shiftId);
    setShowDeleteShiftDialog(true);
  };

  const confirmDeleteShift = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/shifts/${deletingShiftId}`);
      // Refresh the calendar by forcing a re-render
      if (selectedUserId) {
        const currentUser = selectedUserId;
        setSelectedUserId(currentUser);
      }
      setShowDeleteShiftDialog(false);
      setDeletingShiftId(null);
    } catch (error) {
      console.error('Error deleting shift:', error);
      alert(error.response?.data?.message || 'Error deleting shift');
    }
  };

  const handleFormSubmit = async () => {
    try {
      if (!formData.shifttypeid || !formData.shiftstarttime || !formData.shiftendtime || !formData.shiftlocation) {
        alert("Please fill in all required fields");
      return;
      }

      // Format dates to ISO 8601 format without timezone offset
      const startTime = moment(formData.shiftstarttime).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      const endTime = moment(formData.shiftendtime).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

      const shiftData = {
        shifttypeid: formData.shifttypeid,
        userid: selectedUserId,
        shiftstarttime: startTime,
        shiftendtime: endTime,
        shiftlocation: formData.shiftlocation,
        assignedby: adminUser.userid
      };

      let response;
      if (editingShift) {
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/shifts/${editingShift.shiftid}`,
          shiftData
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/users/${selectedUserId}/shifts`,
          shiftData
        );
      }

      console.log('Server response:', response.data);
      
      // Clear form and close modal
      resetFormData();
      setShowDialog(false);
      setEditingShift(null);

      // Refresh the calendar by forcing a re-render
      if (selectedUserId) {
        const currentUser = selectedUserId;
        setSelectedUserId(currentUser);
      }
    } catch (error) {
      console.error('Error saving shift:', error);
      if (error.response) {
        console.error('Detailed error response:', {
          data: error.response.data,
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          request: {
            url: error.config.url,
            method: error.config.method,
            data: JSON.parse(error.config.data),
            headers: error.config.headers
          }
        });
      }
      const errorMessage = error.response?.data?.message || 'Error saving shift';
      alert(errorMessage);
    }
  };

  const handleUserFormSubmit = async () => {
    try {
      if (!formData.firstname || !formData.lastname || !formData.emailaddress || (!editingUser && !formData.password) || !formData.role) {
        alert("Please fill in all required fields");
        return;
      }

    const payload = {
      firstname: formData.firstname,
      lastname: formData.lastname,
      emailaddress: formData.emailaddress,
      role: formData.role,
    };

      if (!editingUser) {
      payload.password = formData.password;
    }

      let response;
      if (editingUser) {
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/users/${editingUser.userid}`,
          payload
        );
        setUsers(users.map((user) => 
          user.userid === editingUser.userid ? response.data : user
        ));
      } else {
        response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users`, payload);
        setUsers([...users, response.data]);
      }

      // Clear form, reset editing state, and close modal
      resetFormData();
      setEditingUser(null);
      setShowUserDialog(false);
    } catch (error) {
      console.error("Error saving user:", error);
      alert(error.response?.data?.message || "Error saving user");
    }
  };

  const filteredUsers = users.filter((user) => 
    `${user.firstname} ${user.lastname}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCloseAssignShiftDialog = () => {
    setShowAssignShiftDialog(false);
    setSelectedUser(null);
  };

  const handleNavigateToSchedule = () => {
    navigate(`/user/${selectedUser.userid}/schedule`);
    setShowAssignShiftDialog(false);
  };

  const resetFormData = () => {
    setFormData({
      userid: '',
      firstname: '',
      lastname: '',
      emailaddress: '',
      password: '',
      role: '',
      eligibleshifts: [],
      createddate: '',
      updateddate: '',
      passwordhash: '',
      shifttypeid: '',
      shiftstarttime: '',
      shiftendtime: '',
      shiftlocation: ''
    });
  };

  const handleCloseShiftDialog = () => {
    resetFormData();
    setShowDialog(false);
    setEditingShift(null);
  };

  const handleCloseUserDialog = () => {
    resetFormData();
    setEditingUser(null);
    setShowUserDialog(false);
  };

  const handleCloseDeleteDialog = () => {
    setDeletingUserId(null);
    setShowDeleteDialog(false);
  };

  if (!adminUser || adminUser.role !== 'Admin') {
    return (
      <StyledContainer>
        <Alert severity="error">
          You do not have permission to access this page.
        </Alert>
      </StyledContainer>
    );
  }

  if (loading) {
    return (
      <StyledContainer>
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <Alert severity="error">{error}</Alert>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper elevation={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <UserSelector>
                <InputLabel>Select User</InputLabel>
                <Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  label="Select User"
                >
                  {users.map((user) => (
                    <MenuItem 
                      key={user.userid} 
                      value={user.userid}
                    >
                      {`${user.firstname} ${user.lastname}`}
                    </MenuItem>
                  ))}
                </Select>
              </UserSelector>
              <Box display="flex" gap={2}>
                {selectedUserId && (
                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEditUser(users.find(u => u.userid === selectedUserId))}
                      startIcon={<FaEdit />}
                    >
                      Edit User
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteUser(selectedUserId)}
                      startIcon={<FaTrash />}
                    >
                      Delete User
                    </Button>
                  </Box>
                )}
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    setEditingUser(null);
                    setShowUserDialog(true);
                  }}
                  startIcon={<FaPlus />}
                >
                  Create User
                </Button>

                <Button
                variant="contained"
                color="primary"
                onClick={() => setShowDialog(true)}
                startIcon={<FaPlus />}
                sx={{
                  backgroundColor: 'rgb(24, 52, 81)',
                  '&:hover': {
                    backgroundColor: 'rgb(29, 57, 87)',
                  },
                }}
                >
                Create Shift
                </Button>
              </Box>
            </Box>
          </StyledPaper>
        </Grid>

        <Grid item xs={12}>
          {selectedUserId && (
            <ScheduleContainer>
              <ShiftSchedule 
                key={`${selectedUserId}-${Date.now()}`}
                userId={selectedUserId}
                isAdmin={true}
                adminId={adminUser.userid}
                shiftTypes={shiftTypes}
                hideCreateButton={true}
              />
            </ScheduleContainer>
          )}
        </Grid>
      </Grid>

      <Dialog open={showDialog} onClose={handleCloseShiftDialog}>
        <DialogTitle>{editingShift ? 'Edit Shift' : 'Create New Shift'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Shift Type</InputLabel>
              <Select
                value={formData.shifttypeid || ''}
                onChange={(e) => setFormData({ ...formData, shifttypeid: e.target.value })}
                label="Shift Type"
              >
                {shiftTypes.map((type) => (
                  <MenuItem key={type.shifttypeid} value={type.shifttypeid}>
                    {type.shiftname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Start Time"
              type="datetime-local"
              value={formData.shiftstarttime || ''}
              onChange={(e) => setFormData({ ...formData, shiftstarttime: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="End Time"
              type="datetime-local"
              value={formData.shiftendtime || ''}
              onChange={(e) => setFormData({ ...formData, shiftendtime: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Location"
              value={formData.shiftlocation || ''}
              onChange={(e) => setFormData({ ...formData, shiftlocation: e.target.value })}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShiftDialog}>Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained" color="primary">
            {editingShift ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showUserDialog} onClose={handleCloseUserDialog}>
        <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="First Name"
                value={formData.firstname}
                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Last Name"
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
              sx={{ mb: 2 }}
              />
            <TextField
              fullWidth
              label="Email Address"
                type="email"
                value={formData.emailaddress}
                onChange={(e) => setFormData({ ...formData, emailaddress: e.target.value })}
              sx={{ mb: 2 }}
              />
            {!editingUser && (
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                sx={{ mb: 2 }}
              />
            )}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                label="Role"
              >
                <MenuItem value="Agent">Agent</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Cancel</Button>
          <Button onClick={handleUserFormSubmit} variant="contained" color="primary">
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this user?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDeleteShiftDialog} onClose={() => setShowDeleteShiftDialog(false)}>
        <DialogTitle>Confirm Delete Shift</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this shift? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteShiftDialog(false)}>Cancel</Button>
          <Button onClick={confirmDeleteShift} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default UserManagement;