import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

import { collection, getDocs, doc, getDoc, addDoc, onSnapshot, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.PLASMO_PUBLIC_FIREBASE_PUBLIC_API_KEY,
  authDomain: process.env.PLASMO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.PLASMO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.PLASMO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.PLASMO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.PLASMO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.PLASMO_PUBLIC_FIREBASE_MEASUREMENT_ID
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app);


export async function createCheckoutSession(user: any, trialLast30Days: boolean) {
  const checkoutSessionsCollection = collection(db, 'customers', user.uid, 'checkout_sessions');
  const newCheckoutSession = {
    price: process.env.PLASMO_PUBLIC_STRIPE_PRICE_ID,
    success_url: process.env.PLASMO_PUBLIC_STRIPE_SUCCESS_URL,
    cancel_url: process.env.PLASMO_PUBLIC_STRIPE_CANCEL_URL,
    trial_from_plan: !trialLast30Days,
  };

  addDoc(checkoutSessionsCollection, newCheckoutSession).then((docRef) => {
    console.log('Checkout session created with ID: ', docRef.id);
    onSnapshot(docRef, (snap) => {
      const { error, url } = snap.data();
      if (error) {
        // Show an error to your customer and
        // inspect your Cloud Function logs in the Firebase console.
        alert(`An error occured: ${error.message}`);
      }
      if (url) {
        console.log(url)
        // We have a Stripe Checkout URL, let's redirect.
        window.location.assign(url);
      }
    });
  }).catch((error) => {
    console.error('Error creating checkout session: ', error);
  });

};

export async function checkTrialLast30Days(user: any) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const subscriptionsQuery = query(collection(db, 'customers', user.uid, 'subscriptions'), where('trial_end', '>', thirtyDaysAgo));
  const querySnapshot = await getDocs(subscriptionsQuery);
  // quantity is the number of active licenses
  console.log("trial was used less than 30 days ago", querySnapshot.size)
  if (querySnapshot.size > 0) {
    return true;
  } else {
    return false;
  };
};

export async function checkLicenseStatus(user: any) {
  if (!user.uid) {
    return {license: false, licenseStatus: "no-user"};
  }
  console.log('sending query to firestore', new Date())
  const subscriptionsQuery = query(collection(db, 'customers', user.uid, 'subscriptions'), where('status', 'in', ['active', 'trialing']));
  console.log('query sent to firestore', new Date())
  const querySnapshot = await getDocs(subscriptionsQuery);
  console.log('query received from firestore', new Date())

   console.log("querySnapshot.size", querySnapshot.size)
  if (querySnapshot.size > 0) {
    console.log("querySnapshot.size", querySnapshot.size)
    return {license: true, licenseStatus: querySnapshot.docs[0].data().status};
  } else {
    return {license: false, licenseStatus: "off"};
  };
};

export async function getLinkToCustomerPortal(user: any) {
  const functions = getFunctions(app, 'us-central1');
  const createPortalLink = httpsCallable(
      functions,
      'ext-firestore-stripe-payments-createPortalLink');
  // request Stripe to create a portal link, and redirect user there
  createPortalLink({
      // get current browser URL
      // returnUrl: "chrome-extension://ledkinjhgknjnbkibicjgaemihkealfg/options.html" // not working
      returnUrl: "https://turrex.com" // can set this to a custom page
  }).then((result: any) => {
      // open new tab with Stripe portal link
      window.open(result.data.url, '_blank');
  }).catch((error) => {
      // handle error
  });

};

export async function getCustomerDoc(user: any) {
  const customerRef = doc(collection(db, "customers"), user.uid);
  const customerDoc = await getDoc(customerRef);
  if (customerDoc.exists()) {
    console.log("Customer exists:", customerDoc.data());
    return true;
  } else {
    console.log("Customer does not exist");
    return false;
  };
};





