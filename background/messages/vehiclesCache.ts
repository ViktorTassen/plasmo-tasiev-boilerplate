import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
const storage = new Storage() // for sync storage (isRecording)


async function getDefaultRecording() {
    isRecording = await storage.get("isRecording");
    return isRecording;
}
let isRecording =  getDefaultRecording() || false;
let vehicles = [];

storage.watch({
    "isRecording": (c) => {
        isRecording = c.newValue;
        console.log(isRecording)
    }
});


const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const storage = new Storage({ area: 'local' }) // for local storage (vehicles)

    switch (req.body.type) {
        case 'add': // add new vehicles from intercepted response
        console.log('r.body.data: ', req.body)
            if (!isRecording) { console.log('not recording'); return; };
            // add req.body.data unique vehicles to array
            vehicles = await storage.get('vehicles') || [];
            const vehicleIds = new Set(vehicles.map(vehicle => vehicle.id));
            const uniqueElements = req.body.data.filter(obj => !vehicleIds.has(obj.id));
            vehicles = vehicles.concat(uniqueElements);
            // save vehicles to local storage
            await storage.set('vehicles', vehicles);
            console.log('vehicles length: ', vehicles.length, vehicles);
            break;
        case 'clear': // update (enrich) vehicles
            vehicles = [];
            break;
    };

    console.log(await storage.getAll())
    res.send({ status: 'ok' });
}

export default handler

