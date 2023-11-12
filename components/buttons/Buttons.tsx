import styled from "@emotion/styled";
import { Close } from "@mui/icons-material";
import { Button, IconButton, Box, Stack, Typography, CircularProgress } from "@mui/material";
import { sendToBackground } from "@plasmohq/messaging";
import { useStorage } from "@plasmohq/storage/hook";
import React, { useEffect } from "react";

// Components and Assets
import iconCropped from "data-base64:~assets/turrex-icon-cropped.png"


const TurrexModalButtons = (props) => {
    const license = props.license
    const uid = props.uid;

    // buttons
    const [openModal, setOpenModal] = useStorage("openModalTable", false)
    const [isRecording, setIsRecording] = useStorage("isRecording", false)

    const [isEnrichingButton, setIsEnrichingButton] = useStorage("isEnriching", false)

    const [download, setDownload] = useStorage("download", false)
    const [isProcess, setIsProcess] = useStorage("isProcess")


    const TurrexButton = styled(Button)({
        textTransform: 'none',
        border: '1px solid #231f20',
        borderRadius: 0,
        color: '#000',
        cursor: 'pointer',
        height: 34,
        lineHeight: '33px',
        padding: '0 14px',
    }); // for custom styles;

    const TurrexSignButton = styled(TurrexButton)({
        width: '200px',
        backgroundColor: '#000',
        color: '#fff',
        '&:hover': {
            backgroundColor: '#000',
            color: '#fff',
        },
    });

    const TurrexRecordingButton = styled(TurrexButton)({
        width: '150px',
        backgroundColor: isRecording ? '#3dfbb8' : '#000',
        color: isRecording ? '#000' : '#fff!important',
        '&:hover': {
            backgroundColor: isRecording ? '#3dfbb8' : '#000',
            color: isRecording ? '#000' : '#fff',
        },
    });

    const TurrexEnrichingButton = styled(TurrexButton)({
        width: '200px',
        backgroundColor: isEnrichingButton ? '#3dfbb8' : 'defaultBackgroundColor',
        color: isEnrichingButton ? '#000' : 'defaultTextColor',
        '&:hover': {
            backgroundColor: isEnrichingButton ? '#3dfbb8' : 'defaultBackgroundColor',
            color: isEnrichingButton ? '#000' : 'defaultTextColor',
        },
    });

    const CloseButton = styled(IconButton)({
        position: 'absolute',
        top: 10,
        right: 10,
    }); // for custom styles;


    const handleClose = () => {
        setOpenModal(false);
    }
    const handleRecording = () => {
        setIsRecording(!isRecording);
        setIsEnrichingButton(false);

    }
    const handleEnriching = () => {
        setIsEnrichingButton(!isEnrichingButton) // this is for disabling buttons  while enriching
        setIsRecording(false) // turn off recording
    }
    const handleExport = () => {
        setDownload(true)
    }
    const handleClearClick = () => {    
        sendToBackground({
            name: "vehiclesCache",
            body: { type: "clear" }
        });
    }
    useEffect(() => {
        if (isProcess === false) {
            setIsEnrichingButton(false)
        }
    }, [isProcess])

    useEffect(() => {
        if (isProcess === false) {
            setIsEnrichingButton(false)
        }
    }, []) // when page is refreshed


    return (
        <Box>
            {/* Header and close button */}
            <Stack direction="row" spacing={2}>
                <img src={iconCropped} style={{ width: '33px', marginLeft: 10 }} />
                <Typography sx={{ fontWeight: 700 }}> Turrex Explorer </Typography>
            </Stack>
            <CloseButton onClick={handleClose}>
                <Close />
            </CloseButton>

            {/* Buttons Row */}
            <Stack direction="row" spacing={2}>
                {uid ? (
                    <React.Fragment>
                        <TurrexRecordingButton onClick={handleRecording}>
                            <Typography>
                                {!isRecording ? 'Start recording' : 'Stop recording'}
                            </Typography>
                        </TurrexRecordingButton>

                        {/* Enrich button */}
                        <TurrexEnrichingButton onClick={handleEnriching}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography>
                                    {!isEnrichingButton ? 'Enrich vehicle data ►' : 'Stop enriching'}
                                    {isEnrichingButton && <CircularProgress size={11} sx={{ ml: 2, color: "#000" }} />}
                                </Typography>
                            </Stack>
                        </TurrexEnrichingButton>

                        {/* Export button */}
                        <TurrexButton onClick={handleExport}>
                            <Typography>Export to CSV ↧</Typography>
                        </TurrexButton>


                        {/* Clear button */}
                        <TurrexButton onClick={handleClearClick}>
                            <Typography>Clear Results</Typography>
                        </TurrexButton>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        {/* Sign in button:  no uid */}
                        <TurrexSignButton onClick={handleLoginClick}>
                            <Typography>
                                Sign in with Google
                            </Typography>
                        </TurrexSignButton>
                    </React.Fragment>
                )}

            </Stack>

            {/* InfoText */}
            <Box sx={{ marginTop: 2 }} >

                {uid == null && (
                    <Typography>
                        Please{' '}
                        <a href='' id="login-link" target="_blank" onClick={handleLoginClick} rel="noreferrer">
                            Sign in with Google
                        </a>{' '}
                        to start using the Turrex Explorer and refresh the page.
                    </Typography>
                )}

                {license.status == 'off' && uid && (
                    <Typography>
                        Table is displaying first 5 saved results. Unlock all features by {' '}
                        <a id="login-link" href='' target="_blank" onClick={handleLoginClick}>
                            upgrading to Pro.</a>
                    </Typography>
                )}

                <Typography>
                    Check the <a id="info" href="https://turrex.com/#s_faq" target="_blank" rel="noreferrer">FAQ section</a> for detailed instructions on how to use the extension.
                </Typography>
            </Box>
        </Box>
    )

}

export default TurrexModalButtons


function handleLoginClick(event: any) {
    event.preventDefault();
    sendToBackground({
        name: "openOptions",
    });
}