import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
const storage = new Storage();

let isRecording = false;
async function getDefaultRecording() {
    isRecording = await storage.get("isRecording");
}
getDefaultRecording();

storage.watch({
    "isRecording": (c) => {
        isRecording = c.newValue;
        console.log(isRecording)
    }
});


let vehicles = [];

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    switch (req.body.type) {
        case 'add': // add new vehicles from intercepted response
            if (!isRecording) { console.log('not recording'); return; };
            console.log('add req.body.data to vehicles');
            // add req.body.data unique vehicles to array
            const vehicleIds = new Set(vehicles.map(vehicle => vehicle.id));
            const uniqueElements = req.body.data.filter(obj => !vehicleIds.has(obj.id));
            vehicles = vehicles.concat(uniqueElements);
            console.log('vehicles length: ', vehicles.length, vehicles);
            break;
        case 'update': // update (enrich) vehicle
            console.log('enriching vehicle id: ');
            break;
    };

    // here send vehicles to content script to save to local storage,
    // 







    console.log(await storage.getAll())

    // res.send({
    //     statusText
    // });
}

export default handler