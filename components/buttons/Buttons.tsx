import styled from "@emotion/styled";
import { Close } from "@mui/icons-material";
import { Button, IconButton, Box, Stack, Typography, CircularProgress } from "@mui/material";
import { sendToBackground } from "@plasmohq/messaging";
import React, { useEffect, useState } from "react";

// Components and Assets
import iconCropped from "data-base64:~assets/turrex-icon-cropped.png"

import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"

const storageLocal = new Storage({ area: 'local' });

const TurrexModalButtons = () => {
    const [license, setLicense] = useStorage("license")
    const [uid, setUid] = useStorage("firebaseUid")

    const [tableData, setTableData] = useStorage({
        key: "vehicles",
        instance: new Storage({
          area: "local",
        })
      }) // get vehicles from local storage

    const [qtyLength, setQtyLength] = useState(false)

    const [loading, setLoading] = useState(true)
    // buttons
    const [openModal, setOpenModal] = useStorage("openModalTable")
    const [isRecording, setIsRecording] = useStorage("isRecording", false)

    const [isEnrichingButton, setIsEnrichingButton] = useStorage("isEnriching")
    const [qtyAll, setQtyAll] = useStorage("qtyAll")

    const [download, setDownload] = useStorage("download", false)

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

    const TurrexSignButton = styled(    TurrexButton)({
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
        width: 'max-content',
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
        setQtyAll('')
    }
    const handleExport = () => {
        setDownload(true)
    }
    const handleClearClick = () => {
        sendToBackground({
            name: "vehiclesCache",
            body: { type: "clear" }
        });
        setQtyLength(false);
    }

    useEffect(() => {
        if (openModal) {
           const getVehiclesLength = async () => {
           let x = await storageLocal.get('vehicles');
           if (x?.length > 0) setQtyLength(true);
           
           }
        getVehiclesLength();
        }
    }, [tableData])

    useEffect(() => {
        if (openModal) {
            setTimeout(() => {
                setLoading(false);
            }, 300);
        }
    }, [openModal])

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

                {!loading && (
                <React.Fragment>
                    <Stack direction="row" spacing={2}>
                        {uid ? (
                            <React.Fragment>
                                <TurrexRecordingButton onClick={handleRecording}>
                                    <Typography>
                                        {!isRecording ? "Start recording" : "Stop recording"}
                                    </Typography>
                                </TurrexRecordingButton>

                                {/* Enrich button */}
                                { qtyLength && (
                                <React.Fragment>
                                    <TurrexEnrichingButton onClick={handleEnriching}>
                                        <Stack direction="row" alignItems="center">
                                            <Typography>
                                                {!isEnrichingButton ? "Enrich vehicle data ►" : "Stop enriching"}
                                            </Typography>
                                            <Typography>
                                                {isEnrichingButton && qtyAll && (
                                                    <span style={{ marginLeft: 10 }}>{qtyAll}</span>
                                                )}
                                            </Typography>
                                            <Typography>
                                                {isEnrichingButton && (
                                                    <CircularProgress size={11} sx={{ color: "#000", ml: "10px" }} />
                                                )}
                                            </Typography>
                                        </Stack>
                                    </TurrexEnrichingButton>

                                    <TurrexButton onClick={handleExport}>
                                        <Typography>Export to CSV ↧</Typography>
                                    </TurrexButton>

                                    <TurrexButton onClick={handleClearClick}>
                                        <Typography>Clear Results</Typography>
                                    </TurrexButton>
                                </React.Fragment>
                                 )}

                            </React.Fragment>
                           
                        ) : (
                            <React.Fragment>
                                {/* Sign in button: no uid */}
                                <TurrexSignButton onClick={handleLoginClick}>
                                    <Typography>Sign in with Google</Typography>
                                </TurrexSignButton>
                            </React.Fragment>
                        )}
                    </Stack>
                   
                </React.Fragment>
                )}

            {/* InfoText */}
            <Box sx={{ marginTop: 2 }} >
                {!uid && !loading && (
                    <Typography>
                        Please{' '}
                        <a href='' id="login-link" target="_blank" onClick={handleLoginClick} rel="noreferrer">
                            Sign in with Google
                        </a>{' '}
                        to start using the Turrex Explorer.
                    </Typography>
                )}

                {license?.status == 'off' && uid && (
                    <Typography>
                        Table is limited to first 5 saved results. Unlock all features by {' '}
                        <a id="login-link" href='' target="_blank" onClick={handleLoginClick}>
                            upgrading to Pro</a>{' '}and refresh the page.
                    </Typography>
                )}

                <Typography>
                    Check the <a id="info" href="https://turrex.com/#s_faq" target="_blank" rel="noreferrer">FAQ section</a> for detailed instructions on how to use the extension.
                </Typography>
            </Box>
        </Box >
    )

}

export default TurrexModalButtons


function handleLoginClick(event: any) {
    event.preventDefault();
    sendToBackground({
        name: "openOptions",
    });
}