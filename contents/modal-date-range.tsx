import React, { useEffect, useState } from "react";
// Plasmo
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"
import DateRange from "../components/tabulator-table/DateRange";

export const config: PlasmoCSConfig = {
    matches: ["https://turo.com/*/search*"],
    run_at: "document_start",
};

// MUI
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { styled, Box, Modal, IconButton, Typography, Button, Stack } from "@mui/material";
import { Close } from "@mui/icons-material";

const TurrexModalBox = styled(Box)({
    position: 'fixed',
    left: 0,
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


const TurrexModalDateRange = () => {
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


    const [openModalDateRange, setOpenModalDateRange] = useStorage({
        key: "openModalDateRange",
        instance: new Storage({
            area: "local",
        })
    }, false)

    const [selectedDateRangeId, setSelectedDateRangeId] = useStorage({
        key: "selectedDateRangeId",
        instance: new Storage({
            area: "local",
        })
    }, null)


    useEffect(() => {
        if (selectedDateRangeId) {
            setOpenModalDateRange(true)
        } else {
            setOpenModalDateRange(false)
        }
    }, [selectedDateRangeId])


    const handleClose = () => {
        setOpenModalDateRange(false);
        setSelectedDateRangeId(null);
    };

    return (
        <CacheProvider value={styleCache}>
            {openModalDateRange && (
                <React.Fragment>
                    <Modal open={openModalDateRange} onClose={handleClose}>
                        <TurrexModalBox>
                            <CloseButton onClick={handleClose}>
                                <Close />   
                            </CloseButton>
                            <Stack spacing={2}>
                            <Typography sx={{ fontWeight: 700 }}>Date Range for Column {selectedDateRangeId}</Typography>
                            <Typography>Select dates within the range of 1 year before today and 1 month after.</Typography>
                            <DateRange date-range-id={selectedDateRangeId} />
                            </Stack>
                        </TurrexModalBox>
                    </Modal>
                </React.Fragment>
            )}
        </CacheProvider>
    );
}

export default TurrexModalDateRange
