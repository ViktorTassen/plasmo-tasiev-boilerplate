import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
const storage = new Storage() // for sync storage (isRecording)
const storageLocal = new Storage({ area: 'local' }) // for local storage (vehicles)
let vehicles = [];
let timeMS = 0;

async function getDefaultRecording() {
    isRecording = await storageLocal.get("isRecording");
    return isRecording;
};
let isRecording = getDefaultRecording() || false;

storageLocal.watch({
    "isRecording": (c) => {
        isRecording = c.newValue;
        console.log(isRecording)
    }
});

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    try {
      switch (req.body.type) {
        case "add":
          // If not recording, return early
          if (!isRecording) {
            console.log("Not recording");
            res.send({ message: "Not recording", success: false });
            return;
          }
  
          // Process new vehicles
          vehicles = (await storageLocal.get("vehicles")) || [];
          const vehicleIds = new Set(vehicles.map((vehicle) => vehicle.id));
          const uniqueElements = req.body.data.filter(
            (obj) => !vehicleIds.has(obj.id)
          );
  
          await removeUnusedDataInUniqueElements(uniqueElements);
          vehicles = vehicles.concat(uniqueElements);
  
          // Save vehicles to local storage
          await storageLocal.set("vehicles", vehicles);
  
          const currentTimeMS = Date.now();
          if (currentTimeMS - timeMS > 1000) {
            await storage.set("uniqueElementsAdded", uniqueElements.length);
            timeMS = currentTimeMS;
          }
  
          res.send({
            message: "Vehicles added",
            addedCount: uniqueElements.length,
            success: true,
          });
          break;
  
        case "clear":
          vehicles = [];
          await storageLocal.set("vehicles", []);
          res.send({ message: "Vehicles cleared", success: true });
          break;
  
        default:
          res.send({ message: "Unknown request type", success: false });
          break;
      }
    } catch (error) {
    //   console.error("Error in handler:", error);
      res.send({ message: "An error occurred", success: false });
    }
  };

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