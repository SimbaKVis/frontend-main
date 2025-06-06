import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip
} from '@mui/material';
import axios from 'axios';

const OvertimeRequest = () => {
  const [open, setOpen] = useState(false);
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState('');
  const [reason, setReason] = useState('');
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.userid;

  useEffect(() => {
    if (userId) {
      fetchEligibleShifts();
      fetchOvertimeRequests();
    } else {
      setError('User ID not found. Please log in again.');
    }
  }, [userId]);

  const fetchEligibleShifts = async () => {
    if (!userId) {
      console.log('No userId found:', userId);
      setError('User ID not found');
      return;
    }

    try {
      console.log('Fetching shifts for user:', userId);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}/shifts`);
      console.log('Raw API response:', response);
      console.log('All shifts from API:', response.data);
      
      if (!Array.isArray(response.data)) {
        console.log('Response data is not an array:', response.data);
        setError('Invalid response format from server');
        return;
      }

      if (response.data.length === 0) {
        console.log('No shifts found in response');
        return;
      }

      const currentDate = new Date();
      console.log('Current date for comparison:', currentDate);

      const eligibleShifts = response.data.filter(shift => {
        if (!shift) {
          console.log('Found null or undefined shift');
          return false;
        }

        console.log('Processing shift:', {
          id: shift.shiftid,
          startTime: shift.shiftstarttime,
          type: shift.shifttype,
          category: shift.shifttype?.shiftcategory
        });

        if (!shift.shifttype) {
          console.log('Shift has no shifttype:', shift);
          return false;
        }

        if (!shift.shiftstarttime) {
          console.log('Shift has no start time:', shift);
          return false;
        }

        const shiftStartTime = new Date(shift.shiftstarttime);
        
        // Set both dates to start of their respective days for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const shiftDate = new Date(shiftStartTime);
        shiftDate.setHours(0, 0, 0, 0);

        const isOvertime = shift.shifttype.shiftcategory === 'Overtime';
        const isFuture = shiftDate >= today;

        console.log('Shift evaluation:', {
          shiftDate: shiftDate.toISOString(),
          today: today.toISOString(),
          isOvertime,
          isFuture
        });
        
        return isOvertime && isFuture;
      });
      
      console.log('Final eligible shifts:', eligibleShifts);
      console.log('Setting shifts state with:', eligibleShifts);
      setShifts(eligibleShifts);
    } catch (error) {
      console.error('Error in fetchEligibleShifts:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      setError('Failed to fetch eligible shifts');
    }
  };

  const fetchOvertimeRequests = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/overtime/user/${userId}`);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching overtime requests:', error);
      setError('Failed to fetch overtime requests');
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedShift('');
    setReason('');
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async () => {
    try {
      if (!selectedShift || !reason) {
        setError('Please select a shift and provide a reason');
        return;
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/api/overtime`, {
        userid: userId,
        shiftid: selectedShift,
        reason: reason
      });

      setSuccess('Overtime request submitted successfully');
      handleClose();
      fetchOvertimeRequests();
    } catch (error) {
      console.error('Error submitting overtime request:', error);
      setError(error.response?.data?.message || 'Failed to submit overtime request');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Overtime Requests</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Request Overtime
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Request Overtime</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Shift</InputLabel>
            <Select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              label="Select Shift"
            >
              {shifts.map((shift) => (
                <MenuItem key={shift.shiftid} value={shift.shiftid}>
                  {shift.shifttype.shiftname} - {formatDate(shift.shiftstarttime)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for Overtime"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mt: 2 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Shift Type</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.requestid}>
                <TableCell>{request.shift.shifttype.shiftname}</TableCell>
                <TableCell>{formatDate(request.shift.shiftstarttime)}</TableCell>
                <TableCell>{formatDate(request.shift.shiftendtime)}</TableCell>
                <TableCell>{formatDuration(request.overtimeduration)}</TableCell>
                <TableCell>{request.reason}</TableCell>
                <TableCell>
                  <Chip
                    label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    color={getStatusColor(request.status)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OvertimeRequest;