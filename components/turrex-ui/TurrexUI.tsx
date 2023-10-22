import { useEffect, useState } from "react"
import { CacheProvider } from "@emotion/react"
import createCache from "@emotion/cache"
const styleElement = document.createElement("style")

import { Box, Button, IconButton, Modal, Stack, Typography, styled } from "@mui/material"
import { Close } from "@mui/icons-material"
import iconCropped from "data-base64:~assets/turrex-icon-cropped.png"
import TabulatorTable from "components/tabulator-table/TabulatorTable"



const TurrexUI = () => {



  

  // add MUI styles to the head of the document;
  document.head?.appendChild(styleElement)
  const styleCache = createCache({
    key: "plasmo-mui-cache",
    prepend: true,
    container: styleElement
  }) // for MUI styles;
  const TurrexButton = styled(Button)({
    textTransform: 'none',
    border: '1px solid #231f20',
    borderRadius: 0,
    color: '#231f20',
    cursor: 'pointer',
    height: 34,
    lineHeight: '33px',
    padding: '0 14px',
  }); // for custom styles;
  const TurrexModal = styled(Box)({
    position: 'fixed',
    top: '0',
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

  // Modal Open/Close
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);




  return (
    <CacheProvider value={styleCache}>
      
      <TurrexButton
        sx={{ mr: 2 }}
        onClick={handleOpen}
      >
        <Typography variant="body1" sx={{
          fontWeight: 700,
        }}
        >
          Turrex Explorer
        </Typography>
      
      </TurrexButton>
    

      <Modal
        keepMounted
        open={open}
        onClose={handleClose}
      >
        <TurrexModal>
          <Stack direction="row" spacing={2}>
            <img src={iconCropped} style={{ width: '33px', marginLeft: 10 }} />
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              Turrex Explorer
            </Typography>
          </Stack>

          <CloseButton onClick={handleClose}>
            <Close />
          </CloseButton>


          <Stack direction="row" spacing={2}>

            <TurrexButton
              onClick={() => setIsRecording(!isRecording)}
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

            <Box>
            <TabulatorTable/>
            </Box>
         

        </TurrexModal>
      </Modal>
    </CacheProvider>
  )
}

export default TurrexUI