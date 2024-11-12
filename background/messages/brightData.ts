import type { PlasmoMessaging } from "@plasmohq/messaging"
import { fetchDataBright } from "~utils/bright"
import { formatVehicleData } from "~utils/utils"


const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    try {
        const vehicleData = await fetchDataBright(req.body.targetVehicleUrl);
        const vehicleDailyPricingData = await fetchDataBright(req.body.targetDailyPricingUrl);
        // console.log(vehicleData, vehicleDailyPricingData.dailyPricingResponses);

        const newVehicle = await formatVehicleData(vehicleData, vehicleDailyPricingData.dailyPricingResponses);
        if (newVehicle) {
          // console.log("Vehicle added or updated successfully", newVehicle);
          res.send(newVehicle);
        } else {
          res.send(false);
        }

      } catch (error) {
        res.send(false)
        // console.error('Error fetching data:', error);
      }

}

export default handler


