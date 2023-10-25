import {
  browserLocalPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithCredential,
  User
} from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { useEffect, useMemo, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging" // manually added

import { app, auth } from "~firebase"

setPersistence(auth, browserLocalPersistence)

export const useFirebase = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User>(null)

  const firestore = useMemo(() => (user ? getFirestore(app) : null), [user])

  const onLogout = async () => {
    setIsLoading(true)
    if (user) {
      await auth.signOut()
      // manually added 
      await sendToBackground({
        name: "removeAuth",
        body: {}
      })
    }
  }

  const onLogin = () => {
    setIsLoading(true)
    chrome.identity.getAuthToken({ interactive: true }, async function (token) {
      if (chrome.runtime.lastError || !token) {
        console.error(chrome.runtime.lastError.message)
        setIsLoading(false)
        return
      }
      if (token) {
        const credential = GoogleAuthProvider.credential(null, token)
        console.log(credential)
        try {
          let x = await signInWithCredential(auth, credential)
          console.log(x)

          // manually added
          const uid = x.user.uid
          await sendToBackground({
            name: "saveAuth",
            body: {
              token,
              uid,
            }
          })
        } catch (e) {
          console.error("Could not log in. ", e)
        }
      }
    })
  }

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setIsLoading(false)
      setUser(user)
    })
  }, [])

  return {
    isLoading,
    user,
    firestore,
    onLogin,
    onLogout
  }
}
