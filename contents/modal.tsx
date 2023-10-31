import React from "react";
// Plasmo
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useStorage } from "@plasmohq/storage/hook"
import TabulatorTable from "../components/tabulator-table/TabulatorTable";

export const config: PlasmoCSConfig = {
    matches: ["https://turo.com/*/search*"],
    run_at: "document_end",
};

// MUI
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { styled, Box, IconButton, Modal } from "@mui/material";

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

    document.head.appendChild(styleElement)
    const TurrexModalBox = styled(Box)({
        position: 'fixed',
        left: 0,
        // transform: 'translateY(-50%)',
        width: '90%',
        height: '100%',
        backgroundColor: '#fff',
        border: '1px solid #000',
        padding: 32,
        overflow: 'auto',
    }) // for custom styles;

    const [openModal, setOpenModal] = useStorage("openModalTable", false)
    const handleClose = () => {
        setOpenModal(false);
    };
    
    const modalContent = (
        <TurrexModalBox>
          <Box id="turrex-modal-buttons">
            {/* Your modal buttons content */}
          </Box>
          <Box id="turrex-table">
            <TabulatorTable />
          </Box>
        </TurrexModalBox>
    );

    return (
        <CacheProvider value={styleCache}>
            <React.Fragment>
                <Modal
                    open={openModal}
                    onClose={handleClose}>
                    {modalContent}
                </Modal>
            </React.Fragment>
        </CacheProvider>
    )
}

export default TurrexModal