import React, { useState, useContext } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #f0f2f5;
  animation: ${fadeIn} 0.8s ease-in-out;
`;

const FormContainer = styled.div`
  width: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  animation: ${fadeIn} 0.5s ease-in-out;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
`;

const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 1s ease-in-out;
`;

const InputField = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    border-color: rgb(53, 69, 98);
    box-shadow: 0 0 6px rgba(53, 69, 98, 0.5);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  color: white;
  background-color: rgb(53, 69, 98);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease, transform 0.3s ease;

  &:hover {
    background-color: rgb(33, 50, 78);
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: bold;
`;

const Login = () => {
  const { login } = useContext(AuthContext); // Consume the login function from AuthContext
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        emailaddress: email,
        password,
      });
      
      if (response.data.token && response.data.user) {

        console.log('Login response:', response.data);
        
        const userData = {
          ...response.data.user,
          userid: response.data.user.userid || response.data.user.userId || response.data.user.id // Handle different possible ID property names
        };
        
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(userData));
        
        login(userData);
        
        const dashboardPath = userData.role === 'Admin' 
          ? "/admin-dashboard" 
          : "/user-dashboard";
        
        navigate(dashboardPath);
      } else {
        setError("Invalid response from server");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          "Login failed. Please try again.";
      setError(errorMessage);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <FormContainer>
        <FormContent>
          <h1 style={{ 
            textAlign: "center", 
            marginBottom: "1.5rem", 
            color: "#555", 
            fontWeight: "bold" 
          }}>
            Clokyn
          </h1>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <form onSubmit={handleLogin}>
            <InputField>
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="Enter  email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </InputField>
            
            <InputField>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </InputField>
            
            <Button type="submit" disabled={loading}>
              {loading ? "Authenticating..." : "Login"}
            </Button>
          </form>
        </FormContent>
      </FormContainer>
    </PageContainer>
  );
};

export default Login;