import React from "react";
import { useState, useEffect } from "react";

// Firebase stuff
import { useFirebase } from "~firebase/hook"
import { checkLicense } from "~firebase"

// MUI stuff
import { CircularProgress } from '@mui/material';

import Layout from "./OptionsLayout";
import LoginPage from "./LoginPage";
import MembershipPage from "./MembershipPage";


export default function IndexOptionsPage() {
    const { user, isLoading } = useFirebase();

    const [loadingUser, setLoadingUser] = useState(true);
    const [license, setLicense] = useState(false);
    const [licenseStatus, setLicenseStatus] = useState('');
    

    useEffect(() => {
        setLoadingUser(true);
        (async () => {
            console.log("useEffect user", user, Date.now());

            if (user) {
                let licenseResult = await checkLicense(user.uid)
                setLicense(licenseResult.license);
                setLicenseStatus(licenseResult.licenseStatus); 
                setLoadingUser(false);
            }
            if (!user) {
                setTimeout(() => {
                setLoadingUser(false);
                }, 1500);
            }
            
        })();
    }, [user]);


    if (loadingUser) {
        return (
            <Layout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </div>
            </Layout>
        );
    }
    
    if (!user && !isLoading) {
        console.log("!myUser");
        return (
            <Layout>
                <LoginPage />
            </Layout>
        );
    }
    
    return (
        <Layout>
            <MembershipPage license={license} licenseStatus={licenseStatus} user={user} />
        </Layout>
    );
    

};