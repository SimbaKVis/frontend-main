import React, { useState } from "react";
import styled, { keyframes } from "styled-components";

// Keyframe Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const floating = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
`;

// Styled Components
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  width: 100%;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  color: white;
  text-align: center;
  padding: 20px;
`;

const WelcomeSection = styled.div`
  max-width: 500px;
  padding: 50px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 1.2s ease-in-out, ${floating} 6s infinite ease-in-out;
`;

const WelcomeTitle = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 15px;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.3rem;
  opacity: 0.9;
  line-height: 1.6;
`;

// CTA Buttons
const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
`;



const Home = () => {

  return (
    <HomeContainer>
      <WelcomeSection>
        <WelcomeTitle>Welcome to Clokyn</WelcomeTitle>
        <WelcomeSubtitle>
          Easily manage your shifts.
          Set your preferences, request shift swaps and more.
        .
        </WelcomeSubtitle>
      
      </WelcomeSection>
    </HomeContainer>
  );
};

export default Home;
