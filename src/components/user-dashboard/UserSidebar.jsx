import React, { useState } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHome, 
  faCalendarAlt, 
  faClock, 
  faExchangeAlt, 
  faBusinessTime, 
  faUsers, 
  faSignOutAlt, 
  faBars, 
  faTimes 
} from "@fortawesome/free-solid-svg-icons";

const SidebarContainer = styled.nav`
  background: linear-gradient(145deg, #2f3b52, #1c2639);
  color: white;
  width: ${(props) => (props.isOpen ? "250px" : "70px")};
  height: 150vh;
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
  align-self: ${(props) => (props.isOpen ? "flex-end" : "center")};
  &:focus { outline: none; }
`;

const Logo = styled.div`
  font-size: ${(props) => (props.isOpen ? "1.5em" : "1em")};
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
  width: 100%;
  color: #D3D3D3;
  text-transform: uppercase;
  letter-spacing: 2px;
  overflow: hidden;
  white-space: nowrap;
  transition: font-size 0.3s ease-in-out;
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
  overflow: hidden;
  &:hover {
    background-color: #D3D3D3;
    color: white;
    transform: scale(1.05);
  }
  &:active {
    background-color: #a4a2a5;
  }
  & > span {
    display: ${(props) => (props.isOpen ? "inline" : "none")};
    transition: display 0.3s ease-in-out;
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

const handleLogout = () => {
  localStorage.removeItem("token");
  sessionStorage.clear();
  window.location.href = "/login";
};

const Sidebar = ({ setActiveSection }) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
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
        <NavItem isOpen={isOpen} onClick={() => setActiveSection("shift-preferences")}>
          <FontAwesomeIcon icon={faCalendarAlt} />
          <span>Shift Preferences</span>
        </NavItem>
        <NavItem isOpen={isOpen} onClick={() => setActiveSection("shift-schedule")}>
          <FontAwesomeIcon icon={faClock} />
          <span>Shift Schedule</span>
        </NavItem>
        <NavItem isOpen={isOpen} onClick={() => setActiveSection("shift-swap-requests")}>
          <FontAwesomeIcon icon={faExchangeAlt} />
          <span>Shift Swap Requests</span>
        </NavItem>
        <NavItem isOpen={isOpen} onClick={() => setActiveSection("overtime-management")}>
          <FontAwesomeIcon icon={faBusinessTime} />
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
