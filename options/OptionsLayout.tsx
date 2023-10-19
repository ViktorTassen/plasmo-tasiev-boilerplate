import React from 'react';
import { Container, Box, Stack, Typography, Button } from '@mui/material';
import { useFirebase } from '~firebase/hook';

import logo from "data-base64:~assets/logo.png";

import "./index.css";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoading, onLogin, onLogout } = useFirebase();
  
    return (
      <Container component="main" maxWidth="sm">
        {/* Logo and Title */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            my: 2,
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <img src={logo} alt="Turrex Logo" style={{ height: '25px' }} />
            <Typography variant="body1">Turrex Explorer</Typography>
          </Stack>
          {user && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onLogout()}
              sx={{
                textTransform: 'none',
                color: '#593cfb',
                borderColor: '#593cfb',
              }}
            >
              Log out
            </Button>
          )}
        </Box>
        {children}
      </Container>
    );
  };
  
  export default Layout;