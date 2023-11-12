import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
const storage = new Storage() // for sync storage (isRecording)

let vehicles = [];

async function getDefaultRecording() {
    isRecording = await storage.get("isRecording");
    return isRecording;
};
let isRecording =  getDefaultRecording() || false;

// async function getDefaultLicense() {
//     license = await storage.get("license");
//     return license;
// };
// let license = getDefaultLicense() || { license: true, status: "active" }

storage.watch({
    "isRecording": (c) => {
        isRecording = c.newValue;
        console.log(isRecording)
    }
});

// storage.watch({
//     "license": (c) => {
//         license = c.newValue;
//         console.log(license)
//     }
// });


const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const storage = new Storage({ area: 'local' }) // for local storage (vehicles)

    switch (req.body.type) {
        case 'add': // process new vehicles from intercepted response
            console.log('r.body.data: ', req.body)
            // if not recording, do nothing
            if (!isRecording) { 
                console.log('not recording'); 
                return; 
            };
            // add unique vehicles to array
            vehicles = await storage.get('vehicles') || [];
            const vehicleIds = new Set(vehicles.map(vehicle => vehicle.id));
            const uniqueElements = req.body.data.filter(obj => !vehicleIds.has(obj.id));
            vehicles = vehicles.concat(uniqueElements);

            // // if license is not active, limit vehicles to 5
            // if (license.license === false) {
            //     vehicles =  vehicles.slice(0, 5);
            // };

            // save vehicles to local storage
            await storage.set('vehicles', vehicles);
            console.log('vehicles length: ', vehicles.length, vehicles);
            break;

        case 'clear': // update (enrich) vehicles
            vehicles = [];
            await storage.set('vehicles', []);
            break;
    };
}

export default handler

