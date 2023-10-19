// import React, { useEffect, useState } from "react";

// // Firebase stuff
// import { useFirebase } from "~firebase/hook"
// import { db, app, checkLicenseStatus, getLinkToCustomerPortal, checkTrialLast30Days, createCheckoutSession } from "~firebase"

// // MUI stuff
// import { Box, Button, Card, CardActionArea, CircularProgress, Container, Divider, Link, Paper, Stack, Typography } from '@mui/material';
// import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
// import TelegramIcon from '@mui/icons-material/Telegram';

// // import image 
// import logo from "data-base64:~assets/logo.png";
// import stripeBadge from "data-base64:~assets/stripe-badge-transparent.png";

// // rocket
// // import appBg from "data-base64:~assets/rocket-v6-bg-mini.png";

// import gIcon from "data-base64:~assets/g.png";

// // add css for html body
// import "./index.css";

// // get version for display
// import packageJson from '../package.json'
// const version = packageJson.version;


// export default function IndexOptionsPage() {
//     const { user, isLoading, onLogin, onLogout } = useFirebase();

//     const [loadingUser, setLoadingUser] = useState(true);

//     const [license, setLicense] = useState(null);
//     const [licenseStatus, setLicenseStatus] = useState(null);

//     const [isUpgrading, setIsUpgrading] = useState(false);
//     const [isManaging, setIsManaging] = useState(false);

//     useEffect(() => {
//         if (isLoading) {
//             setLoadingUser(true);
//         } else {
//             setLoadingUser(false);
//         }
//     }, [isLoading]);

//     useEffect(() => {
//         if (user) {
//             const fetchLicense = async () => {
//                 const licenseStatus = await checkLicenseStatus(user);
//                 // setLicense(true)
//                 setLicense(licenseStatus.license);
//                 setLicenseStatus(licenseStatus.licenseStatus);
//             }
//             fetchLicense();
//         }
//     }, [user]);


    

//     const handleUpgradeClick = async () => {
//         setIsUpgrading(true);
//         const trialLast30Days = await checkTrialLast30Days(user);
//         await createCheckoutSession(user, trialLast30Days);
//         // setIsUpgrading(false);
//     };

//     const handleManageClick = async () => {
//         setIsManaging(true);
//         await getLinkToCustomerPortal(user);
//         setIsManaging(false);
//     };


//     return (
//         <Container component="main" maxWidth="sm">

//             {/* Logo */}
//             <Box sx={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 my: 2,
//             }}>
//                 <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
//                     <img src={logo} alt="TurrexLogo" style={{ height: '25px' }} />
//                     <Typography variant="body1">Turrex Explorer</Typography>
//                 </Stack>
//                 {/* {user && (
//                     <Button variant="outlined" size="small" onClick={() => onLogout()}
//                         sx={{
//                             textTransform: 'none',
//                             color: '#593cfb',
//                             borderColor: '#593cfb',
//                         }}> Log out </Button>
//                 )} */}
//             </Box>


//             {loadingUser ? (
//                 <CircularProgress />
//             ) : !user ? (
//                 <React.Fragment>   {/* Sign In with Google */}
//                     <Box sx={{ justifyContent: "center", display: 'flex' }}>
//                         <Paper sx={{
//                             my: 2,
//                             p: { xs: 4, sm: 6, md: 8 },
//                             maxWidth: "400px",
//                             textAlign: "center",
//                             justifyContent: "center",
//                             borderRadius: '16px',

//                         }}>
//                             {/* <img src={appBg} alt="logo" style={{ maxHeight: '200px', marginBottom: 10 }} /> */}
//                             <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Find profitable cars in seconds
//                             </Typography>
//                             <Button
//                                 onClick={() => onLogin()}
//                                 sx={{
//                                     textTransform: 'none',
//                                     backgroundColor: '#fff',
//                                     color: '#000',
//                                     padding: '8px',
//                                     width: '250px',
//                                     borderRadius: '8px',
//                                     mb: 2,
//                                 }}
//                                 variant="outlined"
//                                 startIcon={
//                                     <img src={gIcon} alt="logo" style={{ height: '18px' }} />
//                                 }
//                             >
//                                 Sign in with Google
//                             </Button>
//                             <Typography variant="body2">
//                                 By signing up, you acknowledge that you have read and understood, and agree to{' '}
//                                 <Link href="https://turrex.com/terms">Turrex’s Terms</Link> and{' '}
//                                 <Link href="https://turrex.com/privacy">Privacy Policy</Link>.
//                             </Typography>
//                         </Paper>
//                     </Box>
//                 </React.Fragment>
//             ) : (
//                 <React.Fragment>   {/* Membership Panel */}

//                     <Paper elevation={1} sx={{
//                         my: { xs: 2 },
//                         p: { xs: 4, md: 5 },
//                         borderRadius: '16px',
//                         margin: "0 auto",
//                     }}>

//                         {!license ? (
//                             <React.Fragment>
//                                 <Stack sx={{ margin: "0 auto" }}>
//                                     <Typography variant="h5">
//                                         Hello, {user.displayName}
//                                     </Typography>
//                                     <Box sx={{ mt: 2 }}>
//                                         <Typography>Your current plan is <b>Free</b>.</Typography>
//                                         <Typography>Search results are limited to 5.</Typography>
//                                         <Divider sx={{ my: 2 }}>
//                                         </Divider>
//                                         <Typography>Unlock Unlimited Access to Turo Data + Export to CSV.</Typography>
//                                         <Typography>$14.99/mo, cancel anytime!</Typography>
//                                     </Box>
//                                     <Button variant="contained"
//                                         onClick={handleUpgradeClick}
//                                         sx={{
//                                             borderRadius: '8px',
//                                             p: "10px 20px",
//                                             width: '100%',
//                                             textTransform: 'none',

//                                             fontWeight: 500,
//                                             mt: '20px',
//                                             backgroundColor: '#593cfb',
//                                             '&:hover': {
//                                                 backgroundColor: "#3cfbb8",
//                                                 borderColor: "#3cfbb8",
//                                                 color: "#000",
//                                             },
//                                         }}>
//                                         {isUpgrading ? <CircularProgress size={37} /> :
//                                             <Typography variant="h6">Upgrade to PRO</Typography>
//                                         }
//                                     </Button>
//                                     <img src={stripeBadge} alt="logo" />
//                                 </Stack>
//                             </React.Fragment>
//                         ) : (
//                             <React.Fragment>
//                                 <Typography variant="h5">
//                                     Hello, {user.displayName}
//                                 </Typography>
//                                 <Typography sx={{ mt: 2 }}>Status: <b>{licenseStatus}</b></Typography>
//                                 <Typography>License email: <b>{user.email}</b></Typography>
//                                 <Typography>License ID: <b>{user.uid}</b></Typography>
//                                 <Typography>Extension version: {version} </Typography>

//                                 <Button variant="contained"
//                                     onClick={handleManageClick}
//                                     sx={{
//                                         borderRadius: '8px',
//                                         p: "10px 20px",
//                                         width: '100%',
//                                         textTransform: 'none',
//                                         fontWeight: 500,
//                                         mt: '20px',
//                                         backgroundColor: '#593cfb',
//                                         '&:hover': {
//                                             backgroundColor: "#3cfbb8",
//                                             borderColor: "#3cfbb8",
//                                             color: "#000",
//                                         },
//                                     }}>
//                                     {isManaging ? <CircularProgress size={37} /> :

//                                         <Typography variant="h6">Manage subscription</Typography>
//                                         // <Typography variant="caption">Billing info, invoices</Typography>

//                                     }
//                                 </Button>
//                             </React.Fragment>
//                         )}
//                         <Box sx={{ mt: 2, textAlign: "center" }}>
//                             <Typography variant="body2">Email support: {' '}
//                                 <Typography variant="body2" component="a" href="mailto:teamturrex@gmail.com">teamturrex@gmail.com</Typography>
//                             </Typography>
//                         </Box>
//                     </Paper>


//                     {/* Action Buttons Row */}
//                     <Stack
//                         direction={{ xs: 'column', md: 'row' }}
//                         spacing={2}
//                         sx={{
//                             '& > *': {
//                                 width: { xs: '100%', md: 'calc(100% / 2)' },
//                             },
//                             justifyContent: 'center',
//                         }}
//                     >
//                         <Card sx={{ borderRadius: '16px' }}>
//                             <CardActionArea
//                                 sx={{
//                                     height: '100px',
//                                     width: '100%',
//                                     backgroundColor: '#e3e3e3',
//                                     padding: '16px',
//                                     boxSizing: 'border-box',
//                                     alignItems: 'center',
//                                     display: 'flex',
//                                     justifyContent: 'space-between',
//                                 }}
//                                 href="https://turrex.com/#s_faq"
//                                 target="_blank"
//                             >
//                                 <Stack>
//                                     <Typography variant="body1" sx={{ fontWeight: 500 }}>
//                                         User Guide
//                                     </Typography>
//                                     <Typography variant="caption">
//                                         Frequent questions + video
//                                     </Typography>
//                                 </Stack>

//                                 <Box
//                                     sx={{
//                                         borderRadius: '50%',
//                                         backgroundColor: '#c6c7c6',
//                                         display: 'flex',
//                                         height: '48px',
//                                         justifyContent: 'center',
//                                         alignItems: 'center',
//                                         width: '48px',
//                                     }}
//                                 >
//                                     <InfoOutlinedIcon
//                                         sx={{
//                                             height: '24px',
//                                             width: '24px',
//                                         }}
//                                     />
//                                 </Box>
//                             </CardActionArea>
//                         </Card>



//                         <Card sx={{ borderRadius: '16px' }}>
//                             <CardActionArea
//                                 sx={{
//                                     height: '100px',
//                                     backgroundColor: '#bfeeff',
//                                     padding: '16px',
//                                     boxSizing: 'border-box',
//                                     alignItems: 'center',
//                                     display: 'flex',
//                                     justifyContent: 'space-between',
//                                 }}
//                                 href="https://t.me/turrex"
//                                 target="_blank"
//                             >
//                                 <Stack>
//                                     <Typography variant="body1" sx={{ fontWeight: 500 }}>
//                                         Telegram support
//                                     </Typography>
//                                     <Typography variant="caption">
//                                         Chat with me
//                                     </Typography>
//                                 </Stack>

//                                 <Box
//                                     sx={{
//                                         borderRadius: '50%',
//                                         backgroundColor: '#229ED9',
//                                         display: 'flex',
//                                         height: '48px',
//                                         justifyContent: 'center',
//                                         alignItems: 'center',
//                                         width: '48px',
//                                         marginLeft: '15px',
//                                     }}
//                                 >
//                                     <TelegramIcon
//                                         sx={{
//                                             color: "#fff",
//                                             height: '24px',
//                                             width: '24px',
//                                         }}
//                                     />
//                                 </Box>
//                             </CardActionArea>
//                         </Card>

//                     </Stack>
//                 </React.Fragment>

//             )};
//             {/* Email */}


//         </Container>
//     )
// };