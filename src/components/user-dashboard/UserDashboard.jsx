import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import { AuthContext, useAdmin } from "../AuthContext"; 
import Header from "./UserHeader"; 
import Sidebar from "./UserSidebar"; 
import Home from "./UserHome"; 
import ShiftPreferences from "./ShiftPreferences"; 
import ShiftSchedule from "./ShiftSchedule"; 
import ShiftSwapRequests from "./ShiftSwapRequests"; 
import OvertimeRequest from "./OvertimeRequest"; 
import UserManagement from "../admin-dashboard/UserManagement";
import { CircularProgress, Alert } from "@mui/material";

const UserDashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
`;

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const { user } = useContext(AuthContext);
  const { isAdmin, adminId } = useAdmin(); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.userid) {
      setLoading(false);
    } else {
      setError("User not authenticated");
      setLoading(false);
    }
  }, [user]);

  const renderSection = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <CircularProgress size={60} />
        </LoadingContainer>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ margin: 2 }}>
          {error}
        </Alert>
      );
    }

    if (!user || !user.userid) {
      return (
        <Alert severity="error" sx={{ margin: 2 }}>
          User data not available
        </Alert>
      );
    }

    switch (activeSection) {
      case "home":
        return <Home />;
      case "shift-preferences":
        return <ShiftPreferences userId={user.userid} />;
      case "shift-schedule":
        return <ShiftSchedule 
          userId={user.userid}
          isAdmin={isAdmin}
          adminId={adminId}
        />;
      case "shift-swap-requests":
        return <ShiftSwapRequests userId={user.userid} />;
      case "overtime-management":
        return <OvertimeRequest userId={user.userid} />;
      case "user-management":
        return isAdmin ? (
          <UserManagement adminId={adminId} />
        ) : (
          <Alert severity="error">Access denied</Alert>
        );
      default:
        return <Home />;
    }
  };

  return (
    <>
      <Header user={user} />
      <UserDashboardContainer>
        <Sidebar 
          setActiveSection={setActiveSection} 
          userRole={user?.role} 
          activeSection={activeSection}
        />
        <MainContent>{renderSection()}</MainContent>
      </UserDashboardContainer>
    </>
  );
};

export default Dashboard;