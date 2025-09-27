import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate, useRouteError } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface RouteError {
  statusText?: string;
  message?: string;
  status?: number;
}

const Error: React.FC = () => {
  const navigate = useNavigate();
  const error = useRouteError() as RouteError;

  const handleGoHome = (): void => {
    navigate("/");
  };

  const handleGoBack = (): void => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          gap: 3,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 80, color: "error.main" }} />
        
        <Typography variant="h1" component="h1" color="error" sx={{ fontSize: "6rem", fontWeight: "bold" }}>
          {error?.status || "404"}
        </Typography>
        
        <Typography variant="h4" component="h2" gutterBottom>
          Oops! Something went wrong
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
          {error?.statusText || error?.message || 
           "The page you're looking for doesn't exist or an unexpected error occurred."}
        </Typography>
        
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button 
            variant="contained" 
            onClick={handleGoHome}
            size="large"
          >
            Go Home
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleGoBack}
            size="large"
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Error;