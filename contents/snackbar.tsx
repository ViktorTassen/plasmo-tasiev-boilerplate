import React, { useEffect, useState } from "react";
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { Storage } from "@plasmohq/storage"
const storage = new Storage();

export const config: PlasmoCSConfig = {
  matches: ["https://turo.com/*/search*"],
  run_at: "document_start",
}

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { Typography, Snackbar, Alert } from "@mui/material";

// Plasmo Anchor
export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
    document.querySelector(`body`)


const styleElement = document.createElement("style")
const styleCache = createCache({
  key: "plasmo-emotion-cache",
  prepend: true,
  container: styleElement
})
export const getStyle = () => styleElement  

const font = "BasisGrotesque,Avenir,Helvetica Neue,Helvetica,sans-serif"

const MySnackbar = () => {
  console.log("Snackbar")
  const [openSnack, setOpenSnack] = React.useState({ open: false, quantity: 0 });
  
  useEffect(() => {
    storage.watch({
      "uniqueElementsAdded": (c) => {
        // open snackbar with message 
        console.log("Unique vehicles added: +" + c.newValue)
        setOpenSnack({ open: true, quantity: c.newValue });
      }
    });
  }, []);

  const handleCloseSnack = () => {
    setOpenSnack({ open: false, quantity: openSnack.quantity });
  }


  return (
    <CacheProvider value={styleCache}>
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "right"
        }}
        open={openSnack.open}
        autoHideDuration={4000}
        sx={{ color: "#fff", zIndex: 119000, mt: 7.6 }}
        onClose={handleCloseSnack}
      >
        <Alert
          onClose={handleCloseSnack}
          sx={{
            width: '100%',
            backgroundColor: "#593cfb",
            color: "#fff",
            zIndex: 119000,
            '& .MuiAlert-icon': {
              color: '#fff', // Set your custom color here
            },
            
          }}>
          <Typography sx={{fontFamily:font}}><b>{openSnack.quantity}</b> unique vehicles added to Raptor</Typography>
        </Alert>
      </Snackbar>
    </CacheProvider>
  )
}

export default MySnackbar









