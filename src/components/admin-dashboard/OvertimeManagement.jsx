import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  TextField
} from '@mui/material';
import axios from 'axios';

const OvertimeManagement = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchOvertimeRequests();
  }, []);

  const fetchOvertimeRequests = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/overtime`);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching overtime requests:', error);
      setError('Failed to fetch overtime requests');
    }
  };

  const handleOpenDialog = (request) => {
    setSelectedRequest(request);
    setStatus(request.status);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
    setStatus('');
    setError(null);
    setSuccess(null);
  };

  const handleStatusUpdate = async () => {
    try {
      if (!selectedRequest || !status) {
        setError('Please select a status');
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/overtime/${selectedRequest.requestid}/status`,
        { status }
      );

      setSuccess('Status updated successfully');
      handleCloseDialog();
      fetchOvertimeRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.response?.data?.message || 'Failed to update status');
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

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Shift Type</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.requestid}>
                <TableCell>
                  {request.user.firstname} {request.user.lastname}
                </TableCell>
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
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenDialog(request)}
                    disabled={request.status !== 'pending'}
                  >
                    Update Status
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Update Overtime Request Status</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <>
              <TextField
                fullWidth
                label="Employee"
                value={`${selectedRequest.user.firstname} ${selectedRequest.user.lastname}`}
                disabled
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Shift Type"
                value={selectedRequest.shift.shifttype.shiftname}
                disabled
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Reason"
                value={selectedRequest.reason}
                disabled
                multiline
                rows={2}
                sx={{ mt: 2 }}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OvertimeManagement;