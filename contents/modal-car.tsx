import React, { useEffect, useState } from "react";
// Plasmo
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"

export const config: PlasmoCSConfig = {
    matches: ["https://turo.com/*/search*"],
    run_at: "document_start",
};

// MUI
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { styled, Box, Modal, IconButton, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";





const TurrexModalBox = styled(Box)({
    position: 'fixed',
    left: 0,
    width: '70%',
    height: '100%',
    backgroundColor: '#fff',
    border: '1px solid #000',
    padding: 32,
    overflow: 'auto',
    zIndex: 9999,
}) // for custom styles;


// Plasmo Anchor
export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
    document.querySelector(`body`)

// Plasmo + MUI
const styleElement = document.createElement("style")
const styleCache = createCache({
    key: "plasmo-emotion-cache",
    prepend: true,
    container: styleElement
})
export const getStyle = () => styleElement


const TurrexModalCar = () => {
    // needed for this modal styles to work
    const styleElement = document.createElement("style")
    const styleCache = createCache({
        key: "plasmo-emotion-cache",
        prepend: true,
        container: styleElement
    })
    document.head.appendChild(styleElement);

    const CloseButton = styled(IconButton)({
        position: 'absolute',
        top: 10,
        right: 10,
    }); // for custom styles;



    // const [openModalCar, setOpenModalCar] = useState(false)
    // const [selectedCar, setSelectedCar] = useStorage("selectedCar")
    // const [vehicles, setVehicles] = useStorage({
    //     key: "vehicles",
    //     instance: new Storage({
    //       area: "local",
    //     })
    //   }) // get vehicles from local storage


    // useEffect(() => {
    //     if (selectedCar) {
    //         setOpenModalCar(true)
    //         let selectedVehicle = vehicles.filter((vehicle) => vehicle.id === selectedCar)
    //         console.log(selectedVehicle);
    //     }
    // }, [selectedCar])


    // const handleClose = () => {
    //     setOpenModalCar(false);
    // };

    return (
        <CacheProvider value={styleCache}>
            {/* {openModalCar && (
                <React.Fragment>
                    <Modal open={openModalCar} onClose={handleClose}>
                        <TurrexModalBox>
                            <CloseButton onClick={handleClose}>
                                <Close />   
                            </CloseButton>
                            <Typography sx={{ fontWeight: 700 }}>{selectedCar}</Typography>
                        </TurrexModalBox>
                    </Modal>
                </React.Fragment>
            )} */}
        </CacheProvider>
    );
}

export default TurrexModalCar
