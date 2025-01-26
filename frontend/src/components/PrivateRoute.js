import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { CircularProgress, Container } from "@mui/material";
import authService from "../services/auth.service";

const PrivateRoute = ({ children }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          setIsVerifying(false);
          return;
        }

        await authService.verifyToken();
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Token verification failed:", error);
        authService.clearStorage();
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAuth();
  }, []);

  if (isVerifying) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
