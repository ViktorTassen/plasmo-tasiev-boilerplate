import React from "react";
import { useState, useEffect } from "react";

// Firebase stuff
import { useFirebase } from "~firebase/hook"
import { db, app, checkLicenseStatus, getLinkToCustomerPortal, checkTrialLast30Days, createCheckoutSession } from "~firebase"

// MUI stuff
import { Box, Button, Card, CardActionArea, CircularProgress, Container, Divider, Link, Paper, Stack, Typography } from '@mui/material';

import Layout from "./OptionsLayout";
import LoginPage from "./LoginPage";
import MembershipPage from "./MembershipPage";


export default function IndexOptionsPage() {
    const { user, isLoading, onLogin, onLogout } = useFirebase();
    const [loadingUser, setLoadingUser] = useState(true);

    const [myUser, setMyUser] = useState(null);

    const [license, setLicense] = useState(false);
    const [licenseStatus, setLicenseStatus] = useState(null);

    useEffect(() => {
        setMyUser(user)
        if (user) {
            const fetchLicense = async () => {
                const licenseStatus = await checkLicenseStatus(user);
                // setLicense(true)
                setLicense(licenseStatus.license);
                setLicenseStatus(licenseStatus.licenseStatus);
            }
            fetchLicense();
        }
        
    }, [user]);


    useEffect(() => {
        if (isLoading) {
            setLoadingUser(true);
        } else {
            setTimeout(() => {
            setLoadingUser(false);
            }, 1000);
        }
    }, [isLoading]);


    if (user) {
        return (
            <React.Fragment>
                <Layout>
                    <MembershipPage license={license} licenseStatus={licenseStatus} user={user} />
                </Layout>
            </React.Fragment>
        )
        
    } else
    

    if (loadingUser) {
        console.log("loadingUser")
        return (
            <Typography variant="h6" component="h2" gutterBottom>
                Loading...
            </Typography>
        )
    } else

    if (!myUser) {
        console.log("!myUser")
            return (
                <Layout>
                    <LoginPage />
                </Layout>
            )
    }

};