import React, { useEffect, useState } from "react";
// Plasmo
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useStorage } from "@plasmohq/storage/hook"
import { sendToBackground } from "@plasmohq/messaging"
import { checkLicense } from "~firebase/index"

export const config: PlasmoCSConfig = {
    matches: ["https://turo.com/*/search*"],
    run_at: "document_start",
};
// MUI
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { styled, Button, Typography, Box, Stack, IconButton, CircularProgress } from "@mui/material";
import { Close } from "@mui/icons-material";

// Components and Assets
import iconCropped from "data-base64:~assets/turrex-icon-cropped.png"

// Plasmo Anchor
export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
    document.querySelector('#turrex-modal-buttons')

// Plasmo + MUI
const styleElement = document.createElement("style")
const styleCache = createCache({
    key: "plasmo-emotion-cache",
    prepend: true,
    container: styleElement
})
export const getStyle = () => styleElement;


const TurrexModalButtons = () => {
    const TurrexButton = styled(Button)({
        textTransform: 'none',
        border: '1px solid #231f20',
        borderRadius: 0,
        color: '#231f20',
        cursor: 'pointer',
        height: 34,
        lineHeight: '33px',
        padding: '0 14px',
        backgroundColor: '#fff',
    }); // for custom styles;
    const CloseButton = styled(IconButton)({
        position: 'absolute',
        top: 10,
        right: 10,
    }); // for custom styles;


    // license
    const [isLoading, setIsLoading] = useState(true);
    const [uid, setUid] = useStorage("firebaseUid", null)
    const [license, setLicense] = useStorage("license", { license: true, status: "active" })
    useEffect(() => {
        (async () => {
            setIsLoading(true);
            if (uid == null) {
                console.log('buttons uid', uid);
                setLicense({ license: false, status: "off" })
            } else {
                console.log('buttons uid', uid);
                let licenseResult = await checkLicense(uid)
                setLicense({ license: licenseResult.license, status: licenseResult.licenseStatus })
            }
            setTimeout(() => {
                setIsLoading(false)
            }, 500); // ?
        })()
    }, [uid]);


    // buttons
    const [openModal, setOpenModal] = useStorage("openModalTable", false)
    const [isRecording, setIsRecording] = useStorage("isRecording", false)
    const [isEnrichingButton, setIsEnrichingButton] = useStorage("isEnriching", false)
    const [download, setDownload] = useStorage("download", false)
    const [isProcess, setIsProcess] = useStorage("isProcess")

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
        <CacheProvider value={styleCache}>
            {!isLoading ? (
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
                                {/* Recording button */}
                                <TurrexButton
                                    onClick={handleRecording}
                                    sx={{
                                        width: '150px',
                                        backgroundColor: isRecording ? '#3dfbb8' : '#000',
                                        color: isRecording ? '#000' : '#fff',
                                        '&:hover': {
                                            backgroundColor: isRecording ? '#3dfbb8' : '#000',
                                            color: isRecording ? '#000' : '#fff',
                                        },
                                    }}
                                >
                                    <Typography>
                                        {!isRecording ? 'Start recording' : 'Stop recording'}
                                    </Typography>
                                </TurrexButton>

                                {/* Enrich button */}
                                <TurrexButton
                                    onClick={handleEnriching}
                                    sx={{
                                        backgroundColor: isEnrichingButton ? '#3dfbb8' : 'defaultBackgroundColor',
                                        color: isEnrichingButton ? '#000' : 'defaultTextColor',
                                        '&:hover': {
                                            backgroundColor: isEnrichingButton ? '#3dfbb8' : 'defaultBackgroundColor',
                                            color: isEnrichingButton ? '#000' : 'defaultTextColor',
                                        },
                                    }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography>
                                            {!isEnrichingButton ? 'Enrich vehicle data ►' : 'Stop enriching'}
                                            {isEnrichingButton && <CircularProgress size={11} sx={{ ml: 2, color: "#000" }}  />}
                                        </Typography>
                                    </Stack>
                                </TurrexButton>

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
                                <TurrexButton
                                    onClick={handleLoginClick}
                                    sx={{
                                        width: '200px',
                                        backgroundColor: '#000',
                                        color: '#fff',
                                        '&:hover': {
                                            backgroundColor: '#000',
                                            color: '#fff',
                                        },
                                    }}
                                >
                                    <Typography>
                                        Sign in with Google
                                    </Typography>
                                </TurrexButton>
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
            ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                    <img src={iconCropped} style={{ width: '23px', position: "fixed"}} />
                    <CircularProgress sx={{color:"#000"}} />
                </Box>
            )}

        </CacheProvider>
    )

}

export default TurrexModalButtons


function handleLoginClick(event: any) {
    event.preventDefault();
    sendToBackground({
        name: "openOptions",
    });
}