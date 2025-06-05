import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from "./AdminHeader";
import Sidebar from './AdminSidebar';
import UserManagement from './UserManagement';
import ShiftManagement from './ShiftManagement';
import OvertimeManagement from './OvertimeManagement';
import SwapRequestManagement from './SwapRequests';
import React, { useState } from "react";
import styled from "styled-components";
import Home from "./AdminHome";

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  padding: 0px;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 0px;
  height: 100vh;
  background: linear-gradient(135deg, #1e1e30, #3d3d61);
  
`;

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("home");

  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return <Home />;
      case "user-management":
        return <UserManagement />;
      case "shift-management":
        return <ShiftManagement />;
      case "swap-requests":
        return <SwapRequestManagement />;
      case "overtime-management":
        return <OvertimeManagement />;
      default:
        return <Home />;
    }
  };

  return (
    <>
      <Header />
      <DashboardContainer>
        <Sidebar setActiveSection={setActiveSection} />
        <MainContent>{renderSection()}</MainContent>
      </DashboardContainer>
    </>
  );
};

export default Dashboard;