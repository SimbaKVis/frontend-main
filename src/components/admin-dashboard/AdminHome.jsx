import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { FaUsers, FaClock } from "react-icons/fa";

// Styled Components
const AdminContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  width: 100%;
  background: linear-gradient(135deg, #1e1e30, #3d3d61);
  color: white;
  text-align: center;
`;

const AdminSection = styled.div`
  max-width: 700px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const AdminTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 15px;
`;

const AdminSubtitle = styled.p`
  font-size: 1.4rem;
  opacity: 0.9;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  gap: 20px;
`;

const StatBox = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 20px;
  border-radius: 10px;
  width: 200px;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const StatIcon = styled.div`
  font-size: 2rem;
  color: #ff4d4d;
`;

const EncouragingText = styled.p`
  margin-top: 25px;
  font-size: 1.2rem;
  color: #ffcccb;
  font-weight: bold;
`;

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    // Fetch count of users
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTotalUsers(data.length);
        }
      })
      .catch((err) => console.error("Error fetching users:", err));

    // Fetch pending requests
    fetch("http://localhost:5000/api/shift-swap-requests")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPendingRequests(data.length);
        }
      })
      .catch((err) => console.error("Error fetching pending requests:", err));
  }, []);

  return (
    <AdminContainer>
      <AdminSection>
        <AdminTitle>Welcome to Admin Dashboard</AdminTitle>
        <AdminSubtitle>Manage shift schedules, employees, and reports all in one place.</AdminSubtitle>

        <StatsContainer>
          <StatBox>
            <StatIcon><FaUsers /></StatIcon>
            Total Users: {totalUsers}
          </StatBox>

          <StatBox>
            <StatIcon><FaClock /></StatIcon>
            Pending Requests: {pendingRequests}
          </StatBox>
        </StatsContainer>

        <EncouragingText>Explore employee performance & improve scheduling efficiency!</EncouragingText>
      </AdminSection>
    </AdminContainer>
  );
};

export default AdminDashboard;
