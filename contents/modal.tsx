import React, { useEffect, useState } from "react";
// Plasmo
import type { PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetOverlayAnchor } from "plasmo"
import { useStorage } from "@plasmohq/storage/hook"
import TabulatorTable from "../components/tabulator-table/TabulatorTable";
import { checkLicense } from "~firebase";

export const config: PlasmoCSConfig = {
    matches: ["https://turo.com/*/search*"],
    run_at: "document_start",
};




// MUI
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { styled, Box, Modal, CircularProgress, Button } from "@mui/material";
import Buttons from "~components/buttons/Buttons";

// Components and Assets
import iconCropped from "data-base64:~assets/turrex-icon-cropped.png"

const TurrexModalBox = styled(Box)({
    position: 'fixed',
    left: 0,
    width: '90%',
    height: '100%',
    backgroundColor: '#fff',
    border: '1px solid #000',
    padding: 32,
    overflow: 'auto',
}) // for custom styles;


// Plasmo Anchor
export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
    document.querySelector(`#pageContainer-content`)

// Plasmo + MUI
const styleElement = document.createElement("style")
const styleCache = createCache({
    key: "plasmo-emotion-cache",
    prepend: true,
    container: styleElement
})
export const getStyle = () => styleElement


const TurrexModal = () => {
    console.log('TurrexModal');
    const [openModal, setOpenModal] = useStorage("openModalTable", false)
    const handleClose = () => {
        setOpenModal(false);
    };

    // needed for this modal to work
    const styleElement = document.createElement("style")
    const styleCache = createCache({
        key: "plasmo-emotion-cache",
        prepend: true,
        container: styleElement
    })
    document.head.appendChild(styleElement);



    const [isLoading, setIsLoading] = useState(true);
    const [uid, setUid] = useStorage("firebaseUid")
    const [license, setLicense] = useStorage("license")



    // useEffect(() => {
    //     setTimeout(() => {
    //         setIsLoading(false);
    //     }, 1500);
    // }, [])

    useEffect(() => {
        if (openModal == true) {
            (async () => {
                let licenseResult = await checkLicense(uid);
                if (licenseResult.license != license.license) {
                    await setLicense({ license: licenseResult.license, status: licenseResult.licenseStatus })
                };
                setIsLoading(false);
            })()
        };
    }, [openModal])


    return (
        <CacheProvider value={styleCache}>
            <React.Fragment>
                <Modal
                    open={openModal}
                    onClose={handleClose}
                >
                    <TurrexModalBox>
                        {!isLoading && license ? (
                            <>
                                <Box id="turrex-modal-buttons">
                                    <Buttons license={license} uid={uid} value={styleCache} />
                                </Box>
                                <Box id="turrex-table">
                                    <TabulatorTable license={license} value={styleCache} />
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                                <img src={iconCropped} style={{ width: '23px', position: "fixed" }} />
                                <CircularProgress sx={{ color: "#000" }} />
                            </Box>
                        )}
                    </TurrexModalBox>
                </Modal>
            </React.Fragment>
        </CacheProvider>
    )
}

export default TurrexModal
