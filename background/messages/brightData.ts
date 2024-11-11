import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { fetchDataBright } from "~utils/bright"
import { formatVehicleData, addOrUpdateVehicleInLocalStorage } from "~utils/utils"




const handler: PlasmoMessaging.MessageHandler = async (req, res) => {

    // check if this vehicle is in firebase db

    // if not, fetch the data from the targetUrls
    try {

        const vehicleData = await fetchDataBright(req.body.targetVehicleUrl);
        const vehicleDailyPricingData = await fetchDataBright(req.body.targetDailyPricingUrl);
        console.log(vehicleData, vehicleDailyPricingData.dailyPricingResponses);

        const newVehicle = await formatVehicleData(vehicleData, vehicleDailyPricingData.dailyPricingResponses);
        if (newVehicle) {
          console.log("Vehicle added or updated successfully", newVehicle);
          res.send(newVehicle);
        } else {
          res.send(false);
        }

        
        // // save the data in the local storage
        // addOrUpdateVehicleInLocalStorage(newVehicle).then(() => {
        //   console.log("Vehicle added or updated successfully", newVehicle);
        //   res.send(true)
        // })
        // send the response if new vehicle is added == true
      


      } catch (error) {
        res.send(false)
        console.error('Error fetching data:', error);
      }

    // store the data in firebase db

    // save the data in the local storage

}

export default handler


