import { Button } from "@mui/material"
import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
const styleElement = document.createElement("style")

const Modal = () => {
  document.head?.appendChild(styleElement);
  const styleCache = createCache({
    key: "plasmo-mui-cache",
    prepend: true,
    container: styleElement
  }) // for MUI styles;

//   const handleClick = () => {
//     console.log('Button clicked');
//   };

  return (
    <CacheProvider value={styleCache}>
     
    </CacheProvider>

  )
}

export default Modal