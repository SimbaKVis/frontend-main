import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
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
    '#ff9800', 
}));

const ShiftCell = styled(TableCell)`
  min-width: 250px;
`;

const SwapRequests = ({ isAgent = false }) => {
  const [swapRequests, setSwapRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user from localStorage
  const getCurrentUser = useCallback(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) throw new Error('No user found in localStorage');
      
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Error getting current user from localStorage:', error);
      setError('Failed to get user information.');
      return null;
    }
  }, []);

  // Fetch swap requests
  const fetchSwapRequests = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const user = currentUser || getCurrentUser();
      if (!user && isAgent) {
        throw new Error('No user information found');
      }

      let url = 'http://localhost:5000/api/shift-swap-requests';
      if (isAgent && user) {
        url = `http://localhost:5000/api/shift-swap-requests/user/${user.userid}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Swap Requests from API:', response.data);
      setSwapRequests(response.data);
      setError(null);
        } catch (error) {
      console.error('Error fetching swap requests:', error);
      setError('Failed to load swap requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [isAgent, currentUser, getCurrentUser]);

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  useEffect(() => {
    fetchSwapRequests();
  }, [fetchSwapRequests]);

  const handleAction = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setOpenDialog(true);
  };

  const handleConfirmAction = async () => {
    try {
      setLoading(true);
      
      if (!selectedRequest || !selectedRequest.id) {
        throw new Error('No request selected or invalid request ID');
      }

      // Log the entire request object for debugging
      console.log('Processing swap request:', selectedRequest);

      // Update the swap request status - this will trigger the backend's updateRequestStatus function
      const response = await axios.put(`http://localhost:5000/api/shift-swap-requests/${selectedRequest.id}`, {
        status: actionType
      });

      console.log('Server response:', response.data);

      // Refresh the swap requests list
      await fetchSwapRequests();
      setOpenDialog(false);
      setSelectedRequest(null);
      setActionType(null);
        } catch (error) {
      console.error('Error processing swap request:', error);
      if (error.response?.data) {
        console.error('Server error details:', error.response.data);
      }
      setError(`Failed to ${actionType?.toLowerCase() || 'process'} swap request: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  const formatShiftInfo = (shift) => {
    if (!shift) return 'N/A';
    
    const startTime = moment(shift.shiftstarttime).format('MMM D, YYYY h:mm A');
    const endTime = moment(shift.shiftendtime).format('h:mm A');
    const location = shift.shiftlocation || 'No location';
    const shiftName = shift.shifttype?.title || 'Unnamed shift';
    
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

  if (loading && !swapRequests.length) {
    return (
      <StyledContainer>
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Requesting User</StyledTableCell>
              <StyledTableCell>Current Shift</StyledTableCell>
              <StyledTableCell>Colleague</StyledTableCell>
              <StyledTableCell>Requested Shift</StyledTableCell>
              <StyledTableCell>Reason</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
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
                <TableCell>
                  {request.requestingUser?.firstname} {request.requestingUser?.lastname}
                </TableCell>
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
                <TableCell>
                  {request.status === 'Pending' && (
                    <Box>
                      {!isAgent && (
                        <>
                          <Button
                            size="small"
                            color="success"
                            onClick={() => handleAction(request, 'Approved')}
                            sx={{ mr: 1 }}
                                >
                                    Approve
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleAction(request, 'Rejected')}
                                >
                                    Reject
                          </Button>
                        </>
                      )}
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>
          {actionType === 'Approved' ? 'Approve Shift Swap' : 'Reject Shift Swap'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionType === 'Approved' 
              ? 'Are you sure you want to approve this shift swap? This will update the shift assignments for both users.'
              : 'Are you sure you want to reject this shift swap request?'
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmAction}
            color={actionType === 'Approved' ? 'success' : 'error'}
            variant="contained"
          >
            Confirm {actionType}
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default SwapRequests;