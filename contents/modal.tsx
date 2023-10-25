import React, { useState } from "react";
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useStorage } from "@plasmohq/storage/hook"


export const config: PlasmoCSConfig = {
    matches: ["https://turo.com/*/search*"],
    run_at: "document_end",
}

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { styled, Button, Typography, Box, Stack, IconButton, Modal } from "@mui/material";
import { Close } from "@mui/icons-material";
import TabulatorTable from "~components/tabulator-table/TabulatorTable";
import { extractVehicles } from "./utils"
import iconCropped from "data-base64:~assets/turrex-icon-cropped.png"


export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
    document.querySelector(`.searchFilterBar`)


const styleElement = document.createElement("style")
const styleCache = createCache({
    key: "plasmo-emotion-cache",
    prepend: true,
    container: styleElement
})
export const getStyle = () => styleElement




const TurrexModal = () => {

    document.head.appendChild(styleElement)
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
    const TurrexModalBox = styled(Box)({
        position: 'fixed',
        left: 0,
        // transform: 'translateY(-50%)',
        width: '80%',
        height: '100%',
        backgroundColor: '#fff',
        border: '1px solid #000',
        padding: 32,
        overflow: 'auto',


    }) // for custom styles;
    const CloseButton = styled(IconButton)({
        position: 'absolute',
        top: 10,
        right: 10,
    }); // for custom styles;


    const [openModal, setOpenModal] = useStorage("openModalTable", false)
    const [isRecording, setIsRecording] = useStorage("isRecording", false)
    


    const handleClose = () => setOpenModal(false);
    const handleRecording = () => setIsRecording(!isRecording)

    const [tableData, setTableData] = useState([{ id: 1 }]);

    return (
        <CacheProvider value={styleCache}>
            <React.Fragment>
                <Modal
                    open={openModal}
                    onClose={handleClose}>
                    <TurrexModalBox>
                        <Stack direction="row" spacing={2}>
                            <img src={iconCropped} style={{ width: '33px', marginLeft: 10 }} />
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                Turrex Explorer {openModal}
                            </Typography>
                        </Stack>

                      
                            <CloseButton onClick={handleClose}>
                                <Close />
                            </CloseButton>


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
                                    }
                                }}
                            >
                                <Typography>
                                    {isRecording ? 'Stop recording' : 'Start recording'}
                                </Typography>
                            </TurrexButton>

                            <TurrexButton onClick={() => {
                                console.log('clicked');
                                setTableData([{ id: 2 }])
                            }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography>Enrich vehicle data 1</Typography>
                                    <Typography> ► </Typography>
                                </Stack>
                            </TurrexButton>

                            <TurrexButton>
                                <Typography>Export to CSV ↧</Typography>
                            </TurrexButton>

                            <TurrexButton>
                                <Typography>Clear Results</Typography>
                            </TurrexButton>
                        </Stack>

                        <Typography sx={{ marginTop: 2 }}>
                            Check the <a id="info" href="https://turrex.com/#s_faq" target="_blank" rel="noreferrer">FAQ section</a> for detailed instructions on how to use the extension.
                        </Typography>

                        <TabulatorTable data={tableData} />
                    </TurrexModalBox>
                </Modal>

            </React.Fragment>
        </CacheProvider>
    )
}

export default TurrexModal







// window.addEventListener(
//   'ListToContentPost',
//   async function (evt: any) {
//     console.log('ListToContentPost', evt.detail);
//     vehiclesData = extractVehicles(evt.detail);
//   },
//   false,
// );


// waitForElm(".searchFilterBar").then((elm) => {
//   DrawTurrexUI(elm);
// });












