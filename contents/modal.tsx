import React from "react";
// Plasmo
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useStorage } from "@plasmohq/storage/hook"
import TabulatorTable from "../components/tabulator-table/TabulatorTable";

import customStyles from "data-text:./style.css"
const font = "RLBasisGrotesque,Avenir,Helvetica Neue,Helvetica,sans-serif"

export const config: PlasmoCSConfig = {
  matches: ["https://turo.com/*/search*"],
  run_at: "document_start",
};

// MUI
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { styled, Box, Modal, Typography } from "@mui/material";
import Buttons from "~components/buttons/Buttons";

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
  document.querySelector(`body`)

// Plasmo + MUI
const styleElement = document.createElement("style")
const styleCache = createCache({
  key: "plasmo-emotion-cache",
  prepend: true,
  container: styleElement
})
// export const getStyle = () => styleElement



const TurrexModal = () => {
  // custom css
  const myStyles = document.createElement("style")
  myStyles.textContent = customStyles
  document.head.appendChild(myStyles);
  // needed for this modal styles to work
  const styleElement = document.createElement("style")
  const styleCache = createCache({
    key: "plasmo-emotion-cache",
    prepend: true,
    container: styleElement
  })
  document.head.appendChild(styleElement);



  const [openModal, setOpenModal] = useStorage("openModalTable")
  const handleClose = () => {
    setOpenModal(false);
  };


  return (
    <CacheProvider value={styleCache}>
      {openModal && (
        <React.Fragment>
          <Modal open={openModal} onClose={handleClose}>
            <TurrexModalBox>
              <Box id="turrex-modal-buttons">
                <Buttons />
              </Box>
              <Box id="turrex-table">
                <TabulatorTable />
              </Box>
              <Typography sx={{fontFamily:font}}>
                Have ideas for additional features or improvements? Share them by filling out our simple <a id="info" href="https://forms.gle/E3dKmf4La1BUMRai8" target="_blank" rel="noreferrer">Google form.</a> Your feedback shapes next updates!
              </Typography>
            </TurrexModalBox>
          </Modal>
        </React.Fragment>
      )}
    </CacheProvider>
  );
}

export default TurrexModal
