import React, { useEffect, useState } from "react";
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
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

export const getInlineAnchor: PlasmoGetInlineAnchor = () => ({
  element: document.querySelector('.searchFilter'),
  insertPosition: "beforebegin",
});


// export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {

//   if (document.querySelector(`.filter-buttons`)) {
//     return document.querySelector(`.filter-buttons`)
//   } else {
//     return document.querySelector(`.searchFilter`)
//   };
// };



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

  const [openModal, setOpenModal] = useStorage({
    key: "openModalTable",
    instance: new Storage({
        area: "local",
    })
}, false)


  const [license, setLicense] = useStorage({
    key: "license",
    instance: new Storage({
        area: "local",
    })
})

const [uid, setUid] = useStorage({
    key: "firebaseUid",
    instance: new Storage({
        area: "local",
    })
})

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
        <TurrexMainButton id="goodzillo-button" sx={{ mr: 2 }} onClick={handleButtonClick}>
          <Typography sx={{ fontWeight: 700, fontFamily:font  }}>
            Raptor Explorer
          </Typography>
        </TurrexMainButton>
      </React.Fragment>
    </CacheProvider>
  )
}

export default TurrexButton









