import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { 
  CircularProgress, 
  Alert, 
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  DialogContentText
} from '@mui/material';
import styled from '@emotion/styled';

const Container = styled.div`
  padding: 0px;
  height: 100%;
  width: 100%;
  margin-bottom: 0 auto;
`;

const CalendarContainer = styled.div`
  height: 90%;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
  position: relative;
`;

const CreateShiftButton = styled(Button)`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
`;

const FormField = styled(FormControl)`
  margin: 10px 0;
  width: 100%;
`;

const localizer = momentLocalizer(moment);

const ShiftSchedule = ({ 
  userId, 
  isAdmin = false, 
  adminId = null,
  hideCreateButton = false
}) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [shiftTypes, setShiftTypes] = useState([]);
  const [newShift, setNewShift] = useState({
    shifttypeid: '',
    shiftstarttime: '',
    shiftendtime: '',
    shiftlocation: '',
  });
  const [editingShift, setEditingShift] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingShiftId, setDeletingShiftId] = useState(null);

  // Fetch shift types
  const fetchShiftTypes = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/shift-types');
      setShiftTypes(response.data);
    } catch (error) {
      console.error('Error fetching shift types:', error);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchShiftTypes();
    }
  }, [isAdmin, fetchShiftTypes]);

  const fetchShifts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/users/${userId}/shifts`);
      console.log('Raw shift data from API:', response.data);
      
      const transformedShifts = response.data.map(shift => {
        console.log('Processing shift:', shift);
        
        const startDate = new Date(shift.shiftstarttime);
        const endDate = new Date(shift.shiftendtime);
        console.log('Start date:', startDate, 'End date:', endDate);

        return {
          id: shift.shiftid,
          title: shift.shifttype?.shiftname || 'Unnamed Shift',
          start: startDate,
          end: endDate,
          resource: {
            location: shift.shiftlocation,
            type: shift.shifttype?.shiftname || 'Unnamed Shift',
            duration: shift.shiftduration
          }
        };
      });

      // Filtering out any shifts with invalid dates
      const validShifts = transformedShifts.filter(shift => 
        !isNaN(shift.start.getTime()) && !isNaN(shift.end.getTime())
      );

      setShifts(validShifts);
      setError(null);
    } catch (error) {
      console.error('Error in fetchShifts:', error);
      setError('Failed to load shifts');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchShifts();
    }
  }, [userId, fetchShifts]);

  const handleEditShift = (shift) => {
    console.log('Editing shift:', shift); 
    if (!shift || !shift.id) {
      console.error('Invalid shift data for editing:', shift);
      setError('Cannot edit shift: Invalid shift data');
      return;
    }

    // Get the shift type ID from the shift data
    const shiftType = shiftTypes.find(type => type.shiftname === shift.title);
    console.log('Found shift type:', shiftType);

    // If no shift type is found, trying to find it by the resource type
    const shiftTypeId = shiftType ? shiftType.shifttypeid : 
      (shift.resource?.type ? shiftTypes.find(type => type.shiftname === shift.resource.type)?.shifttypeid : '');

    // Ensuring all required fields are there
    const shiftData = {
      shifttypeid: shiftTypeId || '',
      shiftstarttime: moment(shift.start).format('YYYY-MM-DDTHH:mm'),
      shiftendtime: moment(shift.end).format('YYYY-MM-DDTHH:mm'),
      shiftlocation: shift.resource?.location || ''
    };

    console.log('Setting shift data:', shiftData);

    setNewShift(shiftData);
    setEditingShift({
      ...shift,
      shiftid: shift.id
    });
    setOpenDialog(true);
  };

  const handleDeleteShift = (shiftId) => {
    if (!shiftId) {
      console.error('Invalid shift ID:', shiftId);
      setError('Cannot delete shift: Invalid shift ID');
      return;
    }
    console.log('Attempting to delete shift with ID:', shiftId);
    setDeletingShiftId(shiftId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteShift = async () => {
    if (!deletingShiftId) {
      console.error('No shift ID provided for deletion');
      setError('Cannot delete shift: No shift ID provided');
      setShowDeleteDialog(false);
      return;
    }
  
    function getFriendlyErrorMessage(rawError) {
      if (!rawError) return 'Failed to delete shift';
    
      if (rawError.includes('overtime_requests')) {
        return 'Cannot delete shift: There are pending overtime requests linked to this shift. Please resolve them first.';
      }
    
      // fallback to showing raw error but nicely formatted
      return `Cannot delete shift: ${rawError}`;
    }
    
    try {
      console.log('Confirming deletion of shift:', deletingShiftId);
      const response = await axios.delete(`http://localhost:5000/api/shifts/${deletingShiftId}`);
      console.log('Delete response:', response.data);
      
      // Refresh the shifts list after successful deletion
      await fetchShifts();
  
      // Clear error, close dialog, reset state
      setError(null);
      setShowDeleteDialog(false);
      setDeletingShiftId(null);
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      
      const data = error.response?.data || {};
      const rawError = data.error || '';
      const friendlyMessage = data.message
        ? `${data.message}. ${getFriendlyErrorMessage(rawError)}`
        : getFriendlyErrorMessage(rawError) || error.message || 'Failed to delete shift';

      setError(friendlyMessage);
      
      // Decide if you want to close dialog here or not
      setShowDeleteDialog(false);
    }
  };
  

  const handleCreateShift = async () => {
    try {
      const startTime = new Date(newShift.shiftstarttime);
      const endTime = new Date(newShift.shiftendtime);
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        setError('Invalid date format');
        return;
      }

      if (endTime <= startTime) {
        setError('End time must be after start time');
        return;
      }

      const duration = Math.round((endTime - startTime) / (1000 * 60));

      // Create base shift data
      const shiftData = {
        shifttypeid: newShift.shifttypeid,
        shiftstarttime: startTime.toISOString(),
        shiftendtime: endTime.toISOString(),
        shiftduration: duration,
        shiftlocation: newShift.shiftlocation,
        userid: userId,
        assignedby: adminId
      };

      // If editing, only including fields that have changed
      if (editingShift && editingShift.shiftid) {
        const updatedData = {};
        
        // Only include fields that are different from the original shift
        if (shiftData.shifttypeid !== editingShift.shifttypeid) {
          updatedData.shifttypeid = shiftData.shifttypeid;
        }
        if (shiftData.shiftstarttime !== editingShift.shiftstarttime) {
          updatedData.shiftstarttime = shiftData.shiftstarttime;
        }
        if (shiftData.shiftendtime !== editingShift.shiftendtime) {
          updatedData.shiftendtime = shiftData.shiftendtime;
        }
        if (shiftData.shiftlocation !== editingShift.shiftlocation) {
          updatedData.shiftlocation = shiftData.shiftlocation;
        }
        if (shiftData.shiftduration !== editingShift.shiftduration) {
          updatedData.shiftduration = shiftData.shiftduration;
        }

        console.log('Updating shift with changed fields:', updatedData);

        // Only make the API call if there are changes
        if (Object.keys(updatedData).length > 0) {
          const response = await axios.put(
            `http://localhost:5000/api/shifts/${editingShift.shiftid}`,
            updatedData
          );
          console.log('Update response:', response.data);
        } else {
          console.log('No changes detected, skipping update');
        }
      } else {
        // For new shifts, send all data
        const response = await axios.post(
          `http://localhost:5000/api/users/${userId}/shifts`,
          shiftData
        );
        console.log('Create response:', response.data);
      }

      setOpenDialog(false);
      fetchShifts(); // Refresh shifts
      setNewShift({
        shifttypeid: '',
        shiftstarttime: '',
        shiftendtime: '',
        shiftlocation: '',
      });
      setEditingShift(null);
      setError(null);
    } catch (error) {
      console.error('Error saving shift:', error);
      setError(error.response?.data?.message || 'Failed to save shift');
    }
  };

  const CustomEvent = useCallback(({ event }) => {
    const [showActions, setShowActions] = useState(false);

    return (
      <div
        style={{
          backgroundColor: 'none',
          color: 'white',
          padding: '2px',
          borderRadius: '2px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div style={{ flex: 1 }}>
          <strong>{event.title}</strong>
          {event.resource.location && (
            <div>{event.resource.location}</div>
          )}
        </div>
        
        {isAdmin && showActions && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',             
            position: 'absolute',   
            top: 0,
            right: 0,
            padding: '4px',
            zIndex: 1000, 
               
          }}>
            <Button
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteShift(event.id);
              }}
              style={{
                backgroundColor: 'white',
                color: '#f44336',
                minWidth: 'auto',
                padding: '2px 8px'
              }}
            >
              Delete
            </Button>
          </div>
        )}
      </div>
    );
  }, [isAdmin, handleEditShift, handleDeleteShift]);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <CalendarContainer>
        {isAdmin && !hideCreateButton && (
          <CreateShiftButton
            variant="contained"
            color="primary"
            onClick={() => setOpenDialog(true)}
          >
            Create Shift
          </CreateShiftButton>
        )}
        
        <Calendar
          localizer={localizer}
          events={shifts}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"       
          views={['week', 'day', 'agenda']}
          style={{ height: '100%' }}
          components={{
            event: CustomEvent
          }}
        />

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingShift ? 'Edit Shift' : 'Create New Shift'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <FormField>
                <InputLabel>Shift Type</InputLabel>
                <Select
                  value={newShift.shifttypeid || ''}
                  onChange={(e) => setNewShift({...newShift, shifttypeid: e.target.value})}
                  label="Shift Type"
                >
                  <MenuItem value="">Select Shift Type</MenuItem>
                  {shiftTypes.map((type) => (
                    <MenuItem key={type.shifttypeid} value={type.shifttypeid}>
                      {type.shiftname}
                    </MenuItem>
                  ))}
                </Select>
              </FormField>

              <FormField>
                <TextField
                  label="Start Time"
                  type="datetime-local"
                  value={newShift.shiftstarttime}
                  onChange={(e) => setNewShift({...newShift, shiftstarttime: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </FormField>

              <FormField>
                <TextField
                  label="End Time"
                  type="datetime-local"
                  value={newShift.shiftendtime}
                  onChange={(e) => setNewShift({...newShift, shiftendtime: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </FormField>

              <FormField>
                <TextField
                  label="Location"
                  value={newShift.shiftlocation}
                  onChange={(e) => setNewShift({...newShift, shiftlocation: e.target.value})}
                />
              </FormField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateShift} variant="contained" color="primary">
              {editingShift ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
          <DialogTitle>Confirm Delete Shift</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this shift? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button onClick={confirmDeleteShift} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </CalendarContainer>
    </Container>
  );
};

ShiftSchedule.propTypes = {
  userId: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool,
  adminId: PropTypes.string,
  adminId: PropTypes.string
};

export default ShiftSchedule;