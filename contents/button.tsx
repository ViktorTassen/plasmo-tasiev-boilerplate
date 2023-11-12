import React, { useEffect, useState } from "react";
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useStorage } from "@plasmohq/storage/hook"

export const config: PlasmoCSConfig = {
  matches: ["https://turo.com/*/search*"],
  run_at: "document_start",
}

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { styled, Button, Typography, Box } from "@mui/material";
import { checkLicense } from "~firebase";

export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
  document.querySelector(`.desktopMoreFilters`)



const styleElement = document.createElement("style")
const styleCache = createCache({
  key: "plasmo-emotion-cache",
  prepend: true,
  container: styleElement
})
export const getStyle = () => styleElement



const TurrexButton = () => {
  const [openModal, setOpenModal] = useStorage("openModalTable", false)
  
  const [isEnriching, setIsEnriching] = useStorage("isEnriching", false)

  const [isLoading, setIsLoading] = useState(true);
  const [uid, setUid] = useStorage("firebaseUid", null)
  const [license, setLicense] = useStorage("license", { license: true, status: "active" })
  
  useEffect(() => {
      (async () => {
          // setIsLoading(true);
          if (uid == null) {
              console.log('buttons uid', uid);
              await setLicense({ license: false, status: "off" })
          } else {
              console.log('buttons uid', uid);
              let licenseResult = await checkLicense(uid)
              await setLicense({ license: licenseResult.license, status: licenseResult.licenseStatus })
          }
          // setIsLoading(false)
      })()
  }, [uid]);



  useEffect(() => {
    setOpenModal(false)
    setIsEnriching(false)
  }, [])

  const handleButtonClick = () => {
    setOpenModal(!openModal);
    console.log('openModal', openModal);
  }

  const TurrexMainButton = styled(Button)({
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

  return (
    <CacheProvider value={styleCache}>
      <React.Fragment>
        <TurrexMainButton
          sx={{ mr: 2 }}
          onClick={handleButtonClick}
        >
          <Typography sx={{ fontWeight: 700 }}>
            Turrex Explorer
          </Typography>

        </TurrexMainButton>

      </React.Fragment>
    </CacheProvider>
  )
}

export default TurrexButton









