import React, { useEffect, useState } from "react";
import packageJson from '../package.json';
import { Box, Button, Card, CardActionArea, CircularProgress, Divider, Paper, Stack, Typography } from "@mui/material";
import { checkTrialLast30Days, createCheckoutSession, getLinkToCustomerPortal } from "~firebase";

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TelegramIcon from '@mui/icons-material/Telegram';

import stripeBadge from "data-base64:~assets/stripe-badge-transparent.png";


interface MembershipPageProps {
    license: boolean;
    licenseStatus: string;
    user: any;
  }

export default function MembershipPage(props: MembershipPageProps) {

    const { license, licenseStatus, user } = props;


    const [isUpgrading, setIsUpgrading] = useState(false);
    const [isManaging, setIsManaging] = useState(false);

    useEffect(() => {
        console.log('isManaging', isManaging)
    }, [isManaging])



    const handleUpgradeClick = async () => {
        setIsUpgrading(true);
        // const trialLast30Days = await checkTrialLast30Days(user);
        const trialLast30Days = true; // if true means no more trial
        await createCheckoutSession(user, trialLast30Days);
        // setIsUpgrading(false);
    };

    const handleManageClick = async () => {
        setIsManaging(true);
        await getLinkToCustomerPortal(user, setIsManaging);
        setIsManaging(false);
    }; 



    return (
        <React.Fragment>   {/* Membership Panel */}

        <Paper elevation={1} sx={{
            my: { xs: 2 },
            p: { xs: 4, md: 5 },
            borderRadius: '16px',
            margin: "0 auto",
        }}>

            {!license ? (
                <React.Fragment>
                    <Stack sx={{ margin: "0 auto" }}>
                        <Typography variant="h5">
                            Hello, {user.displayName}
                        </Typography>
                        <Typography>License ID: <b>{user.uid}</b></Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography>Your current plan is <b>Free</b>.</Typography>
                            <Typography>Search results are limited to 5 for testing purposes.</Typography>
                            <Divider sx={{ my: 2 }}>
                            </Divider>
                            <Typography>Unlock Unlimited Access to Turo Data + Export to CSV.</Typography>
                            <Typography>$14.99/mo, cancel anytime!</Typography>
                        </Box>
                        <Button variant="contained"
                            onClick={handleUpgradeClick}
                            sx={{
                                borderRadius: '8px',
                                p: "10px 20px",
                                width: '100%',
                                textTransform: 'none',

                                fontWeight: 500,
                                mt: '20px',
                                backgroundColor: '#593cfb',
                                '&:hover': {
                                    backgroundColor: "#3cfbb8",
                                    borderColor: "#3cfbb8",
                                    color: "#000",
                                },
                            }}>
                            {isUpgrading ? <CircularProgress size={37} /> :
                                <Typography variant="h6">Upgrade to PRO</Typography>
                            }
                        </Button>
                        <img src={stripeBadge} alt="logo" />
                    </Stack>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <Typography variant="h5">
                        Hello, {user.displayName}
                    </Typography>
                    <Typography sx={{ mt: 2 }}>Status: <b>{licenseStatus}</b></Typography>
                    <Typography>License email: <b>{user.email}</b></Typography>
                    <Typography>License ID: <b>{user.uid}</b></Typography>
                    <Typography>Extension version: {packageJson.version} </Typography>

                    <Button variant="contained"
                        onClick={handleManageClick}
                        sx={{
                            borderRadius: '8px',
                            p: "10px 20px",
                            width: '100%',
                            textTransform: 'none',
                            fontWeight: 500,
                            mt: '20px',
                            backgroundColor: '#593cfb',
                            '&:hover': {
                                backgroundColor: "#3cfbb8",
                                borderColor: "#3cfbb8",
                                color: "#000",
                            },
                        }}>
                        {isManaging ? <CircularProgress size={37} /> :
                            <Typography variant="h6">Manage subscription</Typography>
                        }
                    </Button>
                </React.Fragment>
            )}
            <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography variant="body2">Email support: {' '}
                    <Typography variant="body2" component="a" href="mailto:teamturrex@gmail.com">teamturrex@gmail.com</Typography>
                </Typography>
            </Box>
        </Paper>


        {/* Action Buttons Row */}
        <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{
                '& > *': {
                    width: { xs: '100%', md: 'calc(100% / 2)' },
                },
                justifyContent: 'center',
            }}
        >
            <Card sx={{ borderRadius: '16px' }}>
                <CardActionArea
                    sx={{
                        height: '100px',
                        width: '100%',
                        backgroundColor: '#e3e3e3',
                        padding: '16px',
                        boxSizing: 'border-box',
                        alignItems: 'center',
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}
                    href="https://turrex.com/#s_faq"
                    target="_blank"
                >
                    <Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            User Guide
                        </Typography>
                        <Typography variant="caption">
                            Frequent questions + video
                        </Typography>
                    </Stack>

                    <Box
                        sx={{
                            borderRadius: '50%',
                            backgroundColor: '#c6c7c6',
                            display: 'flex',
                            height: '48px',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '48px',
                        }}
                    >
                        <InfoOutlinedIcon
                            sx={{
                                height: '24px',
                                width: '24px',
                            }}
                        />
                    </Box>
                </CardActionArea>
            </Card>



            <Card sx={{ borderRadius: '16px' }}>
                <CardActionArea
                    sx={{
                        height: '100px',
                        backgroundColor: '#bfeeff',
                        padding: '16px',
                        boxSizing: 'border-box',
                        alignItems: 'center',
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}
                    href="https://t.me/turrex"
                    target="_blank"
                >
                    <Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            Telegram support
                        </Typography>
                        <Typography variant="caption">
                            Chat with me
                        </Typography>
                    </Stack>

                    <Box
                        sx={{
                            borderRadius: '50%',
                            backgroundColor: '#229ED9',
                            display: 'flex',
                            height: '48px',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '48px',
                            marginLeft: '15px',
                        }}
                    >
                        <TelegramIcon
                            sx={{
                                color: "#fff",
                                height: '24px',
                                width: '24px',
                            }}
                        />
                    </Box>
                </CardActionArea>
            </Card>

        </Stack>
    </React.Fragment>
    )
}