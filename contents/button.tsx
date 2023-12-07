import React, { useEffect, useState } from "react";
import type { PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoMountShadowHost } from "plasmo"
import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"

export const config: PlasmoCSConfig = {
  matches: ["https://turo.com/*/search*"],
  run_at: "document_start",
}

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { styled, Button, Typography} from "@mui/material";
import { checkLicense } from "~firebase";

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  if (document.querySelector(`.desktopMoreFilters`)) {
    return document.querySelector(`.desktopMoreFilters`)
  } else {
    return document.querySelector(`.searchFilter`)
  };
};



const styleElement = document.createElement("style")
const styleCache = createCache({
  key: "plasmo-emotion-cache",
  prepend: true,
  container: styleElement
})
export const getStyle = () => styleElement

const font = "BasisGrotesque,Avenir,Helvetica Neue,Helvetica,sans-serif"

const TurrexButton = () => {
  console.log("TurrexButton")
  const [openModal, setOpenModal] = useStorage("openModalTable", false)
  const [uid, setUid] = useStorage("firebaseUid")
  const [license, setLicense] = useStorage("license")

  const fetchData = async () => {
      let licenseResult = await checkLicense(uid);
      if (licenseResult.license !== license?.license) {
        await setLicense({
          license: licenseResult.license,
          status: licenseResult.licenseStatus,
        });
      }
  };

  useEffect(() => {
    if (uid && openModal) {
      fetchData();
    };

  }, [uid, openModal]);


  const handleButtonClick = () => {
    setOpenModal(!openModal);
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
        <TurrexMainButton sx={{ mr: 2 }} onClick={handleButtonClick}>
          <Typography sx={{ fontWeight: 700, fontFamily:font  }}>
            Turrex Explorer
          </Typography>
        </TurrexMainButton>
      </React.Fragment>
    </CacheProvider>
  )
}

export default TurrexButton









