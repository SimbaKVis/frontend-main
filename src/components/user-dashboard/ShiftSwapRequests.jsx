import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import moment from 'moment';
import {
  Container,
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import styled from '@emotion/styled';

const StyledContainer = styled(Container)`
  padding: 20px;
  margin-top: 20px;
`;

const StyledPaper = styled(Paper)`
  padding: 20px;
  margin-bottom: 20px;
`;

const FormField = styled(FormControl)`
  margin: 10px 0;
  width: 100%;
`;

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '0.95rem',
  backgroundColor: '#f5f5f5'
}));

const StatusChip = styled(Chip)(({ status }) => ({
  width: '100px',
  color: '#fff',
  backgroundColor: 
    status === 'Approved' ? '#4caf50' :
    status === 'Rejected' ? '#f44336' :
    '#ff9800', // default color for 'Pending'
}));

const ShiftCell = styled(TableCell)`
  min-width: 250px;
`;

const ShiftSwapRequests = ({ userId, isAdmin = false }) => {
  const [userShifts, setUserShifts] = useState([]);
  const [colleagues, setColleagues] = useState([]);
  const [selectedColleague, setSelectedColleague] = useState('');
  const [colleagueShifts, setColleagueShifts] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    shiftToSwap: '',
    colleague: '',
    shiftToSwapWith: '',
    reason: ''
  });

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [shiftsResponse, colleaguesResponse, requestsResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}/shifts`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/users`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/shift-swap-requests`)
      ]);

      setUserShifts(shiftsResponse.data);
      const filteredColleagues = colleaguesResponse.data.filter(
        user => user.role === 'Agent' && user.userid !== userId
      );
      setColleagues(filteredColleagues);
      setSwapRequests(requestsResponse.data);
      setError(null);
        } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch colleague's shifts when selected
  const fetchColleagueShifts = useCallback(async (colleagueId) => {
    if (!colleagueId) return;
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${colleagueId}/shifts`);
      setColleagueShifts(response.data);
    } catch (error) {
      console.error('Error fetching colleague shifts:', error);
      setError('Failed to load colleague shifts');
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Fetch colleague shifts when colleague is selected
  useEffect(() => {
    if (formData.colleague) {
      fetchColleagueShifts(formData.colleague);
    } else {
      setColleagueShifts([]);
    }
  }, [formData.colleague, fetchColleagueShifts]);

  const handleSubmit = async () => {
    try {
      const swapRequestData = {
        requestingUserId: userId,
        requestedShiftId: formData.shiftToSwap,
        colleagueId: formData.colleague,
        colleagueShiftId: formData.shiftToSwapWith,
        reason: formData.reason,
        status: 'Pending'
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/api/shift-swap-requests`, swapRequestData);
      setOpenDialog(false);
      setFormData({
        shiftToSwap: '',
        colleague: '',
        shiftToSwapWith: '',
        reason: ''
      });
      fetchInitialData(); // Refresh all data
        } catch (error) {
      console.error('Error creating swap request:', error);
      setError('Failed to create swap request');
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/shift-swap-requests/${requestId}`, { status: newStatus });
      fetchInitialData(); // Refresh all data
    } catch (error) {
      console.error('Error updating swap request status:', error);
      setError('Failed to update swap request status');
    }
  };

  const formatShiftInfo = (shift) => {
    if (!shift) return 'N/A';
    
    const startTime = moment(shift.shiftstarttime).format('MMM D, YYYY h:mm A');
    const endTime = moment(shift.shiftendtime).format('h:mm A');
    const location = shift.shiftlocation || 'No location';
    const shiftName = shift.shifttype?.shiftname || 'Unnamed Shift';
    
    return (
      <>
        <Typography variant="body2" component="div">
          <strong>{shiftName}</strong>
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {startTime} - {endTime}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {location}
        </Typography>
      </>
    );
  };

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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Typography variant="h5" gutterBottom>
        Shift Swap Requests
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 3 }}
      >
        Request Shift Swap
      </Button>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Shift Swap</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormField>
              <InputLabel>Shift To Swap</InputLabel>
              <Select
                value={formData.shiftToSwap || ''}
                onChange={(e) => setFormData({ ...formData, shiftToSwap: e.target.value })}
                label="Shift To Swap"
              >
                <MenuItem value="">Select Shift</MenuItem>
                {userShifts.map((shift) => (
                  <MenuItem key={shift.shiftid} value={shift.shiftid}>
                    {moment(shift.shiftstarttime).format('MMM D, YYYY h:mm A')} - {shift.shifttype?.shiftname || 'Unnamed Shift'}
                  </MenuItem>
                ))}
              </Select>
            </FormField>

            <FormField>
              <InputLabel>Colleague</InputLabel>
              <Select
                value={formData.colleague || ''}
                onChange={(e) => setFormData({ ...formData, colleague: e.target.value })}
                label="Colleague"
              >
                <MenuItem value="">Select Colleague</MenuItem>
                {colleagues.map((colleague) => (
                  <MenuItem key={colleague.userid} value={colleague.userid}>
                    {colleague.firstname} {colleague.lastname}
                  </MenuItem>
                ))}
              </Select>
            </FormField>

            <FormField>
              <InputLabel>Shift To Swap With</InputLabel>
              <Select
                value={formData.shiftToSwapWith || ''}
                onChange={(e) => setFormData({ ...formData, shiftToSwapWith: e.target.value })}
                label="Shift To Swap With"
                disabled={!formData.colleague}
              >
                <MenuItem value="">Select Shift</MenuItem>
                {colleagueShifts.map((shift) => (
                  <MenuItem key={shift.shiftid} value={shift.shiftid}>
                    {moment(shift.shiftstarttime).format('MMM D, YYYY h:mm A')} - {shift.shifttype?.shiftname || 'Unnamed Shift'}
                  </MenuItem>
                ))}
              </Select>
            </FormField>

            <FormField>
              <TextField
                label="Reason"
                multiline
                rows={4}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
            </FormField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Shift To Swap</StyledTableCell>
              <StyledTableCell>Colleague</StyledTableCell>
              <StyledTableCell>Shift To Swap With</StyledTableCell>
              <StyledTableCell>Reason</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              {isAdmin && <StyledTableCell>Actions</StyledTableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {swapRequests.map((request) => (
              <TableRow 
                key={request.id}
                sx={{
                  backgroundColor: 
                    request.status === 'Approved' ? '#e8f5e9' :
                    request.status === 'Rejected' ? '#ffebee' :
                    'inherit'
                }}
              >
                <ShiftCell>
                  {formatShiftInfo(request.requestedShift)}
                </ShiftCell>
                <TableCell>
                  {request.colleague?.firstname} {request.colleague?.lastname}
                </TableCell>
                <ShiftCell>
                  {formatShiftInfo(request.colleagueShift)}
                </ShiftCell>
                <TableCell>{request.reason}</TableCell>
                <TableCell>
                  <StatusChip
                    label={request.status}
                    status={request.status}
                  />
                </TableCell>
                {isAdmin && request.status === 'Pending' && (
                  <TableCell>
                    <Box>
                      <Button
                        size="small"
                        color="success"
                        onClick={() => handleStatusUpdate(request.id, 'Approved')}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleStatusUpdate(request.id, 'Rejected')}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </StyledContainer>
  );
};

ShiftSwapRequests.propTypes = {
  userId: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool
};

export default ShiftSwapRequests;