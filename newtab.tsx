import { useFirebase } from "~firebase/hook"
import { db, app } from "~firebase"
import { collection, doc, getDoc, where, addDoc, onSnapshot, query, getDocs } from "firebase/firestore";
import { getFunctions, httpsCallable } from 'firebase/functions';


export default function IndexOptionsPage() {
  const { user, isLoading, onLogin, onLogout } = useFirebase();
  


  return (







    
    <div
      style={{
        display: "block",
        flexDirection: "column",
        padding: 16
      }}>
      <h1>
        Welcome to your <a href="https://www.plasmo.com">Plasmo</a> Extension!
      </h1>
      {!user ? (
        <button onClick={() => onLogin()}>Log in</button>
      ) : (
        <button onClick={() => onLogout()}>Log out</button>
      )}
      <div>
        {isLoading ? "Loading..." : ""}
        {!!user ? (
          <div>
            Welcome to Plasmo, {user.displayName} your email address is{" "}
            {user.email}
            {user.uid}
          </div>
        ) : (
          ""
        )}



        <button
          disabled={!user}
          onClick={async () => {
       const license = await checkLicenseStatus(user);
       console.log("license", license);
       var trialLast30Days = await checkTrialLast30Days(user);
       console.log("trialLast30Days", trialLast30Days)
       await createCheckoutSession(user, trialLast30Days);
          }}
        >
          Subscribe to Paid feature
        </button>






        <button
          disabled={!user}
          onClick={async () => {
            const subscriptionsQuery = query(collection(db, 'customers', user.uid, 'subscriptions'), where('status', 'in', ['active', 'trialing']));
            const querySnapshot = await getDocs(subscriptionsQuery);
            // quantity is the number of active licenses
            console.log(querySnapshot.size)
          
          }}>
          Test quanity
        </button>


        <button
          disabled={!user}
          onClick={async () => {
            const functions = getFunctions(app, 'us-central1');
            const createPortalLink = httpsCallable(
              functions, 
              'ext-firestore-stripe-payments-createPortalLink');
            
            // request Stripe to create a portal link, and redirect user there
            createPortalLink({
                returnUrl: "https://turrex.com" // can set this to a custom page
            }).then((result: any) => {
                window.location.assign(result.data.url);
            }).catch((error) => {
                // handle error
            });
          
          
          }}>
         Customer portal
        </button>



      </div>

      <footer>Crafted by @PlamoHQ</footer>
    </div>
  )
}



async function getCustomerDoc(user: any) {
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

async function createCheckoutSession(user: any, trialLast30Days: boolean) {
  const checkoutSessionsCollection = collection(db, 'customers', user.uid, 'checkout_sessions');
  const newCheckoutSession = {
    price: process.env.PLASMO_PUBLIC_STRIPE_PRICE_ID,
    success_url: 'https://turrex.com/success',
    cancel_url: 'https://turrex.com/cancel',
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

async function checkTrialLast30Days(user: any) {
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

async function checkLicenseStatus(user: any) {
  const subscriptionsQuery = query(collection(db, 'customers', user.uid, 'subscriptions'), where('status', 'in', ['active', 'trialing']));
  const querySnapshot = await getDocs(subscriptionsQuery);
  // quantity is the number of active licenses
  console.log(querySnapshot.size)
  if (querySnapshot.size > 0) {
    return true;
  } else {
    return false;
  };


  // need to verify if user had trial during last 30 days, 
  // if so, then don't allow them to start another trial
};

async function getLinkToCustomerPortal (user: any) {
  const functions = getFunctions(app, 'us-central1');
  const createPortalLink = httpsCallable(
    functions, 
    'ext-firestore-stripe-payments-createPortalLink');
  // request Stripe to create a portal link, and redirect user there
  createPortalLink({
      returnUrl: "https://turrex.com" // can set this to a custom page
  }).then((result: any) => {
      window.location.assign(result.data.url);
  }).catch((error) => {
      // handle error
  });
  
};


