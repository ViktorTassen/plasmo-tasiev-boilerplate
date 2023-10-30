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
    const [licenseStatus, setLicenseStatus] = useState('no-user');

    useEffect(() => {
        setLoadingUser(true);
        if (user) {
            const fetchLicense = async () => {
                const license = await checkLicense(user.uid);
                setLicense(license.license);
                setLicenseStatus(license.licenseStatus);
                
            }
            fetchLicense();
        }
        setLoadingUser(false);
    }, [user]);


    // useEffect(() => {
    //     if (isLoading) {
    //         setLoadingUser(true);
    //     } else {
    //         setLoadingUser(false);
    //     }
    // }, [isLoading]);



    if (user) {
        return (
            <React.Fragment>
                <Layout>
                    <MembershipPage license={license} licenseStatus={licenseStatus} user={user} />
                </Layout>
            </React.Fragment>
        )

    }

    else
        if (loadingUser) {
            console.log("loadingUser")
            return (
                <Layout>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <CircularProgress />
                    </div>
                </Layout>
            )
        }

        else

            if (!user) {
                console.log("!myUser")
                return (
                    <Layout>
                        <LoginPage />
                    </Layout>
                )
            }

};