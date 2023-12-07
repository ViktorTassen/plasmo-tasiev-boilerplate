import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
const storage = new Storage() // for sync storage (isRecording)
const storageLocal = new Storage({ area: 'local' }) // for local storage (vehicles)
let vehicles = [];
let timeMS = 0;

async function getDefaultRecording() {
    isRecording = await storage.get("isRecording");
    return isRecording;
};
let isRecording = getDefaultRecording() || false;

storage.watch({
    "isRecording": (c) => {
        isRecording = c.newValue;
        console.log(isRecording)
    }
});

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    switch (req.body.type) {
        case 'add': // process new vehicles from intercepted response
            // if not recording, do nothing
            if (!isRecording) {
                console.log('not recording');
                return;
            };
            // add unique vehicles to array
            vehicles = await storageLocal.get('vehicles') || [];
            const vehicleIds = new Set(vehicles.map(vehicle => vehicle.id));
            const uniqueElements = req.body.data.filter(obj => !vehicleIds.has(obj.id));
            await removeUnusedDataInUniqueElements(uniqueElements)
            vehicles = vehicles.concat(uniqueElements);

            // save vehicles to local storage
            await storageLocal.set('vehicles', vehicles);
            let currentTimeMS = Date.now();
            if (currentTimeMS - timeMS > 1000) {
                await storage.set('uniqueElementsAdded', uniqueElements.length);
                console.log('vehicles length: ', vehicles.length, vehicles);
                timeMS = currentTimeMS;
            }
            timeMS = Date.now();
            break;

        case 'clear': // update (enrich) vehicles
            vehicles = [];
            await storageLocal.set('vehicles', []);
            break;
    };
}

export default handler



// FUNCTIONS
// remove unused data from uniqueElements
const removeUnusedDataInUniqueElements = async (uniqueElements) => {
    const propertiesToKeep = [
        'id',
        'completedTrips',
        'hostId',
        'isAllStarHost',
        'location',
        'make',
        'model',
        'year',
        'rating',
        'type',
        'avgDailyPrice',
    ];
    for (const vehicle of uniqueElements) {
        for (const key in vehicle) {
            if (!propertiesToKeep.includes(key)) {
                delete vehicle[key];
            }
        }
    }


}