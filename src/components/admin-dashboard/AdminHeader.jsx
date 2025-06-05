import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle, faBell, faCogs } from "@fortawesome/free-solid-svg-icons";

const HeaderContainer = styled.header`
  background: #ffffff;
  color: #2f3b52;
  padding: 15px 30px;
  display: flex;
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
`

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

const IconContainer = styled.div`
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.1);
  }
`;


const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: color 0.3s ease-in-out;

  &:hover {
    color: #D3D3D3;
  }
`;

const ProfileName = styled.span`
  font-size: 1em;
  color: #2f3b52;
`;

const DashboardHeader = () => {

  return (
    <HeaderContainer>
      <LogoContainer>
        <Logo>Clokyn Admin Dashboard</Logo>
        <Tagline>optimizing schedules while accommodating employee needs</Tagline>
      </LogoContainer>
      <ActionsContainer>
        <ProfileContainer>
          <FontAwesomeIcon icon={faUserCircle} />
          <ProfileName>Admin</ProfileName>
        </ProfileContainer>
      </ActionsContainer>
    </HeaderContainer>
  );
};

export default DashboardHeader;
