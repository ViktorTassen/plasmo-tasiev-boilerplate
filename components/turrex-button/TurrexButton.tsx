import { useState } from "react"
import { Box, Button, Modal, Stack, Typography, styled } from "@mui/material"
import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
const styleElement = document.createElement("style")

import iconCropped from "data-base64:~assets/turrex-icon-cropped.png";
import { theme } from "webextension-polyfill"

const TurrexButton = () => {

  document.head?.appendChild(styleElement);
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
      display: 'inline-block',
      fontSize: 16,
      fontWeight: 700,
      height: 34,
      lineHeight: '33px',
      outline: 'none',
      padding: '0 14px',
      position: 'relative',
      textAlign: 'center',
      verticalAlign: 'top',
      whiteSpace: 'nowrap'
  });

  const TurrexModal = styled(Box)({
    position: 'absolute',
    top: '50%',
    left: 0,
    transform: 'translateY(-50%)',
    width: '80vw',
    height: '100vh',
    backgroundColor: '#fff',
    border: '1px solid #000',
    padding: 32,

  })


  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <CacheProvider value={styleCache}>
      <TurrexButton
        sx={{mr: 10}}
        onClick={handleOpen}
      >
        Turrex Explorer
      </TurrexButton>

      <Modal
        keepMounted
        open={open}
        onClose={handleClose}
      >
        <TurrexModal>

          <Stack direction="row" spacing={2} alignItems="center">
            <img src={iconCropped} alt="logo" style={{ width: '33px', marginLeft: 10 }} />
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              Turrex Explorer
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <TurrexButton sx={{
              backgroundColor: '#000',
              color: '#fff',
              // add hover
              '&:hover': {
                backgroundColor: '#3dfbb8',
                color: '#000',
              }
            }}>
              <Typography>
                Start recording
              </Typography>
            </TurrexButton>
            <TurrexButton variant="outlined">
              <Typography variant="body1">
              Enrich vehicle data ►
              </Typography>
            </TurrexButton>
            <TurrexButton variant="outlined">
              <Typography variant="body1">
                Export to CSV ↧
              </Typography>
            </TurrexButton>
            <TurrexButton variant="outlined">
              <Typography variant="body1">
                Clear Results
              </Typography>
            </TurrexButton>
          </Stack>
          <Typography variant="body1" sx={{marginTop: 2 }}>
          Check the <a id="info" href="https://turrex.com/#s_faq" target="_blank" rel="noreferrer">FAQ section</a> for detailed instructions on how to use the extension.
          </Typography>


          {/* <Typography id="keep-mounted-modal-title" variant="h6" component="h2">
            Text in a modal
          </Typography>
          <Typography id="keep-mounted-modal-description" sx={{ mt: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography> */}
        </TurrexModal>
      </Modal>


    </CacheProvider>

  )
}

export default TurrexButton