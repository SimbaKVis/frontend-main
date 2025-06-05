import React, { useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import ShiftSchedule from './ShiftSchedule';

const ShiftScheduleWrapper = () => {
  const { user } = useContext(AuthContext);
  const params = useParams();
  const navigate = useNavigate();
  const userId = params.userId;

  useEffect(() => {
    // Check authorization
    if (!user) {
      navigate('/login');
      return;
    }

    // If user is not Admin and trying to view someone else's schedule
    if (user.role !== 'Admin' && user.userid !== userId) {
      navigate('/user-dashboard');
      return;
    }
  }, [user, userId, navigate]);

  // If no user or unauthorized, don't render anything
  if (!user || (user.role !== 'Admin' && user.userid !== userId)) {
    return null;
  }

  return <ShiftSchedule userId={userId} />;
};

export default ShiftScheduleWrapper;