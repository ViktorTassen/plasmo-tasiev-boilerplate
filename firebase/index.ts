import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, getDocs, doc, getDoc, addDoc, onSnapshot, query, where } from "firebase/firestore";

// old realtime database !!!
import { getDatabase } from 'firebase/database';
import { ref, get, set } from 'firebase/database';

// new
import { getStorage } from "firebase/storage"

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

// old realtime database !!!
const database = getDatabase(app); 



// new
export const storage = getStorage(app)


export async function createCheckoutSession(user: any, trialLast30Days: boolean) {
  const checkoutSessionsCollection = collection(db, 'customers', user.uid, 'checkout_sessions');
  const newCheckoutSession = {
    price: process.env.PLASMO_PUBLIC_STRIPE_PRICE_ID,
    success_url: process.env.PLASMO_PUBLIC_STRIPE_SUCCESS_URL,
    cancel_url: process.env.PLASMO_PUBLIC_STRIPE_CANCEL_URL,
    trial_from_plan: !trialLast30Days,
    allow_promotion_codes: true,
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

export async function checkLicense(uid) {
  if (!uid) {
    return {license: false, licenseStatus: "no-user"};
  };

  const subscriptionsQuery = query(collection(db, 'customers', uid, 'subscriptions'), where('status', 'in', ['active', 'trialing']));
  const querySnapshot = await getDocs(subscriptionsQuery);
  if (querySnapshot.size > 0) {
    return {license: true, licenseStatus: querySnapshot.docs[0].data().status};
  } else {
    // check if user has a license in the old realtime database
    // all old users need to have document with stripeId in the new database to generate links to customer portal
    const snapshot = await get(ref(database, 'users/' + uid + '/subscriptionStatus'));
    console.log('subscription status', snapshot.val());

    if (snapshot.val() == "active" || snapshot.val() == "trialing") {
      return {license: true, licenseStatus: snapshot.val()};
    } else {
      return {license: false, licenseStatus: "off"};
    };

  };
};


export async function updateApiCounter(uid, incrementValue) {
  try {
    const counterDocRef = doc(db, 'customers', uid);

    if (!counterDocRef) {
      return;
    }

    const counterDoc = await getDoc(counterDocRef);

    if (counterDoc.exists()) {
      // Increment existing value by incrementValue
      const currentValue = counterDoc.data().api_counter || 0;
      await updateDoc(counterDocRef, {
        api_counter: currentValue + incrementValue
      });
    } else {
      // Set the initial value if it doesn't exist
      await setDoc(counterDocRef, {
        api_counter: incrementValue
      });
    }
  } catch (error) {
    console.log("Error updating API counter: ", error);
  }
}


export async function updateApiLimit(uid, incrementValue) {
  try {
    const counterDocRef = doc(db, 'customers', uid);

    if (!counterDocRef) {
      return false;
    }

    const counterDoc = await getDoc(counterDocRef);

    if (counterDoc.exists()) {
      // Increment existing value by incrementValue
      const currentValue = counterDoc.data().api_limit || 2650;
      const newValue = currentValue - incrementValue;

      // Update document with new value
      await updateDoc(counterDocRef, {
        api_limit: newValue
      });

      // Return based on the new value
      return newValue > 0;
    } else {
      // Set the initial value if it doesn't exist
      const newValue = 2650 - incrementValue;
      await setDoc(counterDocRef, {
        api_limit: newValue
      });

      // Return based on the new value
      return newValue > 0;
    }
  } catch (error) {
    console.log("Error updating API counter: ", error);
    return false;
  }
}




export async function getLinkToCustomerPortal(user: any, setIsManaging) {
  const functions = getFunctions(app, 'us-central1');
  const createPortalLink = httpsCallable(
      functions,
      'ext-firestore-stripe-payments-createPortalLink');
  // request Stripe to create a portal link, and redirect user there
  await createPortalLink({
      // get current browser URL
      // returnUrl: "chrome-extension://ledkinjhgknjnbkibicjgaemihkealfg/options.html" // not working
      returnUrl: "https://raptorexplorer.com" // can set this to a custom page
  }).then((result: any) => {
      // open new tab with Stripe portal link
      window.open(result.data.url, '_blank');
      return result.data.url;
      
  }).catch((error) => {
      // handle error
  });

};






