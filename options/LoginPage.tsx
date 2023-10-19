import { Box, Paper, Typography, Button, Link } from "@mui/material";
import React from "react";
import { useFirebase } from "~firebase/hook"

import gIcon from "data-base64:~assets/g.png";


export default function LoginPage() {
    const { onLogin } = useFirebase();
    return (
        <React.Fragment>   {/* Sign In with Google */}
        <Box sx={{ justifyContent: "center", display: 'flex' }}>
            <Paper sx={{
                my: 2,
                p: { xs: 4, sm: 6, md: 8 },
                maxWidth: "400px",
                textAlign: "center",
                justifyContent: "center",
                borderRadius: '16px',

            }}>
                {/* <img src={appBg} alt="logo" style={{ maxHeight: '200px', marginBottom: 10 }} /> */}
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Find profitable cars in seconds
                </Typography>
                <Button
                    onClick={() => onLogin()}
                    sx={{
                        textTransform: 'none',
                        backgroundColor: '#fff',
                        color: '#000',
                        padding: '8px',
                        width: '250px',
                        borderRadius: '8px',
                        mb: 2,
                    }}
                    variant="outlined"
                    startIcon={
                        <img src={gIcon} alt="logo" style={{ height: '18px' }} />
                    }
                >
                    Sign in with Google
                </Button>
                <Typography variant="body2">
                    By signing up, you acknowledge that you have read and understood, and agree to{' '}
                    <Link href="https://turrex.com/terms">Turrex’s Terms</Link> and{' '}
                    <Link href="https://turrex.com/privacy">Privacy Policy</Link>.
                </Typography>
            </Paper>
        </Box>
    </React.Fragment>
    )
}