import React, { useState, useContext } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert
} from "@mui/material";
import axios from "axios";
import { AuthContext } from "../AuthContext"; // Adjust if path differs

const HeaderContainer = styled.header`
  background: #ffffff;
  color: #2f3b52;
  padding: 15px 30px;
  display: flex;
  width: 95%;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease-in-out;
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Logo = styled.div`
  font-size: 1.5em;
  font-weight: bold;
  color: black;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Tagline = styled.span`
  font-size: 0.85em;
  color: #666;
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: color 0.3s ease-in-out;

  &:hover {
    color: #d3d3d3;
  }
`;

const ProfileName = styled.span`
  font-size: 1em;
  color: #2f3b52;
`;

const Header = () => {
  const { user } = useContext(AuthContext);
  const [showDialog, setShowDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordUpdate = async () => {
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${user.userid}/update-password`, {
        currentPassword,
        newPassword
      });

      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowDialog(false), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <>
      <HeaderContainer>
        <LogoContainer>
          <Logo>Clokyn</Logo>
          <Tagline>Personalised Shift Management</Tagline>
        </LogoContainer>
        <ActionsContainer>
          <ProfileContainer onClick={() => setShowDialog(true)}>
            <FontAwesomeIcon icon={faUserCircle} />
            <ProfileName>{user?.role || "Agent"}</ProfileName>
          </ProfileContainer>
        </ActionsContainer>
      </HeaderContainer>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            sx={{ mb: 2 }}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            sx={{ mb: 2 }}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            sx={{ mb: 2 }}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordUpdate} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;