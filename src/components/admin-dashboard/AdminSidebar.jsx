import React, { useState } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHome, 
  faCalendarAlt, 
  faExchangeAlt, 
  faUsers, 
  faSignOutAlt, 
  faBars, 
  faTimes,
  faClock
} from "@fortawesome/free-solid-svg-icons";

const SidebarContainer = styled.nav`
  background: linear-gradient(145deg, #2f3b52, #1c2639);
  color: white;
  width: ${(props) => (props.isOpen ? "250px" : "70px")};
  height: 100vh;
  padding: 20px;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: width 0.3s ease-in-out;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5em;
  cursor: pointer;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px 15px;
  &:focus { outline: none; }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  flex-grow: 1;
`;

const NavItem = styled.li`
  margin: 15px 0;
  cursor: pointer;
  font-size: 1.1em;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  transition: all 0.3s ease-in-out;

  &:hover {
    background-color: #D3D3D3;
    color: white;
    transform: scale(1.05);
  }
  &:active {
    background-color: #a4a2a5;
  }

  & > span {
    opacity: ${(props) => (props.isOpen ? 1 : 0)};
    max-width: ${(props) => (props.isOpen ? "200px" : "0")};
    overflow: hidden;
    white-space: nowrap;
    transition: opacity 0.3s ease-in-out, max-width 0.3s ease-in-out;
    display: inline-block;
  }
`;

const LogoutItem = styled(NavItem)`
  background: none;
  color: #D3D3D3;
  font-weight: bold;

  &:hover {
    background-color: #D3D3D3;
    color: white;
  }
`;

const Sidebar = ({ setActiveSection }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    window.location.href = "/login";
  };

  return (
    <SidebarContainer isOpen={isOpen}>
      <ToggleButton onClick={toggleSidebar} isOpen={isOpen}>
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
      </ToggleButton>
      <NavList>
        <NavItem isOpen={isOpen} onClick={() => setActiveSection("home")}>
          <FontAwesomeIcon icon={faHome} />
          <span>Home</span>
        </NavItem>
        <NavItem isOpen={isOpen} onClick={() => setActiveSection("user-management")}>
          <FontAwesomeIcon icon={faUsers} />
          <span>User Management</span>
        </NavItem>
        <NavItem isOpen={isOpen} onClick={() => setActiveSection("shift-management")}>
          <FontAwesomeIcon icon={faCalendarAlt} />
          <span>Shift Management</span>
        </NavItem>
        <NavItem isOpen={isOpen} onClick={() => setActiveSection("swap-requests")}>
          <FontAwesomeIcon icon={faExchangeAlt} />
          <span>Swap Requests</span>
        </NavItem>
        <NavItem isOpen={isOpen} onClick={() => setActiveSection("overtime-management")}>
          <FontAwesomeIcon icon={faClock} />
          <span>Overtime Management</span>
        </NavItem>
        <LogoutItem isOpen={isOpen} onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Logout</span>
        </LogoutItem>
      </NavList>
    </SidebarContainer>
  );
};

export default Sidebar;

