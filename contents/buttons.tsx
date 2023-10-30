import React, { useEffect } from "react";

// Plasmo
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"
import { sendToBackground } from "@plasmohq/messaging"


export const config: PlasmoCSConfig = {
    matches: ["https://turo.com/*/search*"],
    run_at: "document_start",
};

// MUI
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { styled, Button, Typography, Box, Stack, IconButton, Modal } from "@mui/material";
import { Close } from "@mui/icons-material";



// Components and Assets
import iconCropped from "data-base64:~assets/turrex-icon-cropped.png"
import { useFirebase } from "~firebase/hook";
import { on } from "events";

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
export const getStyle = () => styleElement





const TurrexModalButtons = () => {

    const { user, isLoading, onLogin, onLogout } = useFirebase()
    
    useEffect(() => {
        if (user) {
            console.log("user", user)
        } else {
            console.log("no user", user)
        }
    }, [user])

    
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
    };

    useEffect(() => {   
        if (isProcess === false) {
            setIsEnrichingButton(false)
            // setIsRecording(false)
        }
    }, [isProcess])

    return (
        <CacheProvider value={styleCache}>
            <Box>
                {/* Header */}
                <Stack direction="row" spacing={2}>
                    <img src={iconCropped} style={{ width: '33px', marginLeft: 10 }} />
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        Turrex Explorer
                    </Typography>
                </Stack>
                {/* Close button */}
                <CloseButton onClick={handleClose}>
                    <Close />
                </CloseButton>
                {/* Buttons Row - Recording, Enrich, Export, Clear */}
                <Stack direction="row" spacing={2}>
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
                            </Typography>
                        </Stack>
                    </TurrexButton>

                    <TurrexButton
                        onClick={handleExport}
                    >
                        <Typography>Export to CSV ↧</Typography>
                    </TurrexButton>

                    <TurrexButton onClick={() => {
                        sendToBackground({
                            name: "vehiclesCache",
                            body: { type: "clear" }
                        });
                    }}>
                        <Typography>Clear Results</Typography>
                    </TurrexButton>
                </Stack>
                {/* InfoText */}
                <Typography sx={{ marginTop: 2 }}>
                    Check the <a id="info" href="https://turrex.com/#s_faq" target="_blank" rel="noreferrer">FAQ section</a> for detailed instructions on how to use the extension.
                </Typography>
            </Box>

        </CacheProvider>
    )



}


export default TurrexModalButtons
