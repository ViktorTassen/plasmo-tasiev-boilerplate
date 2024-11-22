import React, { useEffect } from "react";
// Plasmo
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo";
import { useStorage } from "@plasmohq/storage/hook";
import { Storage } from "@plasmohq/storage";
import TabulatorTable from "../components/tabulator-table/TabulatorTable";

// Custom Styles
import customStyles from "data-text:./style.css";
const font = "RLBasisGrotesque,Avenir,Helvetica Neue,Helvetica,sans-serif";

export const config: PlasmoCSConfig = {
  matches: ["https://turo.com/*/search*"],
};

// MUI
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { styled, Box, Modal, Typography } from "@mui/material";
import Buttons from "~components/buttons/Buttons";

// Styled Box for the Modal
const TurrexModalBox = styled(Box)({
  position: "fixed",
  left: 0,
  width: "90%",
  height: "100%",
  backgroundColor: "#fff",
  border: "1px solid #000",
  padding: 32,
  overflow: "auto",
});

// Plasmo Anchor
export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
  document.querySelector(`body`);

const TurrexModal = () => {
  // Load custom CSS dynamically
  useEffect(() => {
    const myStyles = document.createElement("style");
    myStyles.textContent = customStyles;
    document.head.appendChild(myStyles);

    return () => {
      document.head.removeChild(myStyles);
    };
  }, []);

  // Create Emotion Cache for MUI styles
  const styleCache = React.useMemo(
    () =>
      createCache({
        key: "plasmo-emotion-cache",
        prepend: true,
      }),
    []
  );

  const [openModal, setOpenModal] = useStorage({
    key: "openModalTable",
    instance: new Storage({
      area: "local",
    }),
  });

  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <CacheProvider value={styleCache}>
      <Modal open={openModal || false} onClose={handleClose}>
        <TurrexModalBox>
          <Box id="turrex-modal-buttons">
            <Buttons />
          </Box>
          <Box id="turrex-table">
            <TabulatorTable />
          </Box>
          <Typography sx={{ fontFamily: font }}>
            Have ideas for additional features or improvements? Share them by
            filling out our simple{" "}
            <a
              id="info"
              href="https://forms.gle/E3dKmf4La1BUMRai8"
              target="_blank"
              rel="noreferrer"
            >
              Google form.
            </a>{" "}
            Your feedback shapes next updates!
          </Typography>
        </TurrexModalBox>
      </Modal>
    </CacheProvider>
  );
};

export default TurrexModal;
