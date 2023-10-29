import React, { useEffect } from "react";
import { DateTime } from "luxon";
// Plasmo
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"
import { sendToBackground } from "@plasmohq/messaging"

// import TabulatorTable from "components/tabulator-table/tabulator"
import IndexOptionsPage from "../options/index"

export const config: PlasmoCSConfig = {
    matches: ["https://turo.com/*/search*"],
    run_at: "document_start",
};

// MUI
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { styled, Button, Typography, Box, Stack, IconButton, Modal } from "@mui/material";
import { Close } from "@mui/icons-material";



// Components and Assets
import iconCropped from "data-base64:~assets/turrex-icon-cropped.png"

// Plasmo Anchor
export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
    document.querySelector(`#pageContainer-content`)

// Plasmo + MUI
const styleElement = document.createElement("style")
const styleCache = createCache({
    key: "plasmo-emotion-cache",
    prepend: true,
    container: styleElement
})
export const getStyle = () => styleElement


const TurrexModal = () => {
    
    console.log('TurrexModal');

    document.head.appendChild(styleElement)
    const TurrexButton = styled(Button)({
        textTransform: 'none',
        border: '1px solid #231f20',
        borderRadius: 0,
        color: '#231f20',
        cursor: 'pointer',
        height: 34,
        lineHeight: '33px',
        padding: '0 14px',
        backgroundColor: '#fff',
    }); // for custom styles;
    const TurrexModalBox = styled(Box)({
        position: 'fixed',
        left: 0,
        // transform: 'translateY(-50%)',
        width: '90%',
        height: '100%',
        backgroundColor: '#fff',
        border: '1px solid #000',
        padding: 32,
        overflow: 'auto',


    }) // for custom styles;
    const CloseButton = styled(IconButton)({
        position: 'absolute',
        top: 10,
        right: 10,
    }); // for custom styles;


    // const [openModal, setOpenModal] = useStorage("openModalTable", false)
    const [isRecording, setIsRecording] = useStorage("isRecording", false)
    const [isEnriching, setIsEnriching] = useStorage("isEnriching", false)




    const handleClose = () => {
        // setOpenModal(false);
    }

    const handleRecording = () => {
        setIsEnriching(false)
        setIsRecording(!isRecording)
        console.log('isRecording', isRecording);
        console.log('isEnriching', isEnriching);
    }
    const handleEnrich = () => {
        setIsEnriching(!isEnriching) // this is for disabling buttons  while enriching
        setIsRecording(false) // turn off recording
        startEnriching();
        console.log('isRecording', isRecording);
        console.log('isEnriching', isEnriching);
    }
    const handleExport = () => saveTrueToDownloadTrigger()


    return (
        <CacheProvider value={styleCache}>
            <React.Fragment>
                <Modal
                    open={true}
                    onClose={handleClose}>
                    <TurrexModalBox>
                        {/* Header */}
                        <Stack direction="row" spacing={2}>
                            <img src={iconCropped} style={{ width: '33px', marginLeft: 10 }} />
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                Turrex Explorer
                            </Typography>
                        </Stack>
                        {/* Close button */}
                        <CloseButton onClick={handleClose}>
                            <Close />
                        </CloseButton>
                        {/* Buttons Row - Recording, Enrich, Export, Clear */}
                        <Stack direction="row" spacing={2}>
                            <TurrexButton
                                onClick={handleRecording}
                                sx={{
                                    width: '150px',
                                    backgroundColor: isRecording ? '#3dfbb8' : '#000',
                                    color: isRecording ? '#000' : '#fff',
                                    '&:hover': {
                                        backgroundColor: isRecording ? '#3dfbb8' : '#000',
                                        color: isRecording ? '#000' : '#fff',
                                    },
                                }}
                            >
                                <Typography>
                                    {!isRecording ? 'Start recording' : 'Stop recording' }
                                </Typography>
                            </TurrexButton>

                            <TurrexButton
                                onClick={handleEnrich}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                <Typography>
                                    {!isEnriching ? 'Enrich vehicle data ►' : 'Stop enriching'}
                                </Typography>
                                </Stack>
                            </TurrexButton>

                            <TurrexButton
                                onClick={handleExport}
                            >
                                <Typography>Export to CSV ↧</Typography>
                            </TurrexButton>

                            <TurrexButton onClick={() => {
                                sendMessageToClearResults();
                            }}>
                                <Typography>Clear Results</Typography>
                            </TurrexButton>
                        </Stack>
                        {/* InfoText */}
                        <Typography sx={{ marginTop: 2 }}>
                            Check the <a id="info" href="https://turrex.com/#s_faq" target="_blank" rel="noreferrer">FAQ section</a> for detailed instructions on how to use the extension.
                        </Typography>
                        {/* Table */}
                        <Box id="turrex-table">
                        </Box>

                        {/* <TabulatorTable /> */}
         

                    </TurrexModalBox>
                </Modal>
            </React.Fragment>
        </CacheProvider>
    )
}

export default TurrexModal




// Functions
async function startEnriching() {
    const storage = new Storage({ area: 'local' })
    const vehicles = await storage.get('vehicles')
    await processVehicles(vehicles)
};


async function processVehicles(vehicles) {

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    for (const vehicle of vehicles) {
        if (vehicle.createdAt === undefined) {

            if ( !(await getIsEnriching()) ) {
                break;
            } // stop processing if user clicked on "Stop enriching" button

            console.log('this vehicle will be enriched: ', vehicle);
            // fetching Turo for raw data
            let vehicleDetails = await fetchVehicle(vehicle.id); // Turo API
            await delay(500);
            let vehicleDailyPricing = await fetchDailyPricing(vehicle.id); // Turo API
            await delay(500);


            // adding Turo raw data to vehicle object
            vehicle.vehicleDetails = vehicleDetails;
            vehicle.vehicleDailyPricing = vehicleDailyPricing.dailyPricingResponses;



            // await fetchMarketValue(); // VIN API
            // await fetchOwnershipCost(); // VIN API

            // final step to process raw data and add it to vehicle object for display it table
            addProcessedDataToVehicle(vehicle, vehicle.vehicleDetails, vehicle.vehicleDailyPricing);

            const storage = new Storage({ area: 'local' })
            await storage.set('vehicles', vehicles)

            // break; // remove this to process all vehicles
        }
    };
}


async function sendMessageToClearResults() {
    const storage = new Storage({ area: 'local' })
    await storage.set('vehicles', []);
    const resp = await sendToBackground({
        name: "vehiclesCache",
        body: { type: "clear" }
    });
};

const fetchVehicle = async (vehicleId: any) => {
    try {
        const response = await fetch("https://turo.com/api/vehicle/detail?vehicleId=" + vehicleId, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            mode: "cors",
            credentials: "include",
        });

        if (response.ok) {
            const data = await response.json();
            console.log('fetchVehicle', data);
            return data;
        } else {
            console.error("Response is not OK. Status: " + response.status);
        }
    } catch (error) {
        console.error(error);
    }
};
const fetchDailyPricing = async (vehicleId: any) => {
    let endDate = DateTime.now().plus({ year: 1 }).toFormat('MM/dd/yyyy');
    let startDate = DateTime.now().minus({ year: 1 }).toFormat('MM/dd/yyyy');
    let endDateEncoded = encodeURIComponent(endDate.toString());
    let startDateEncoded = encodeURIComponent(startDate.toString());

    try {
        const response = await fetch(`https://turo.com/api/vehicle/daily_pricing?end=${endDateEncoded}&start=${startDateEncoded}&vehicleId=${vehicleId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            mode: "cors",
            credentials: "include",
        });
        if (response.ok) {
            const data = await response.json();
            console.log('fetchDailyPricing', data);
            return data;
        } else {
            console.error("Response is not OK. Status: " + response.status);
        }
    } catch (error) {
        console.error(error);
    };
};



const addProcessedDataToVehicle = async (vehicle, vehicleDetails, vehicleDailyPricing) => {

    const result30 = calculateBusyDaysAndIncome(vehicleDailyPricing, 30);
    const result90 = calculateBusyDaysAndIncome(vehicleDailyPricing, 90);
    const result365 = calculateBusyDaysAndIncome(vehicleDailyPricing, 365);

    // vehicleDetails
    vehicle.color = vehicleDetails.color;
    vehicle.trim = vehicleDetails.vehicle.trim;
    vehicle.vin = vehicleDetails.vehicle.vin;
    vehicle.features = convertArrayToString(vehicleDetails.badges);
    vehicle.numberOfFavorites = vehicleDetails.numberOfFavorites;
    vehicle.numberOfReviews = vehicleDetails.numberOfReviews;
    vehicle.url = vehicleDetails.vehicle.url;

    vehicle.createdAt = new Date(vehicleDetails.vehicle.listingCreatedTime).toLocaleDateString();
    vehicle.daysOn = ((Date.now() - vehicleDetails.vehicle.listingCreatedTime) / (1000 * 3600 * 24)).toFixed(0);

    vehicle.plan = vehicleDetails.currentVehicleProtection.displayName;
  

    // vehicleDailyPricing

    vehicle.busy30 = result30.days;
    vehicle.busy90 = result90.days;
    vehicle.busy365 = result365.days;

    vehicle.totalEarned30 = result30.income;
    vehicle.totalEarned90 = result90.income;
    vehicle.totalEarned365 = result365.income;

    vehicle.averagePrice = (vehicle.totalEarned365 / vehicle.busy365 ).toFixed(0)
    if (vehicle.averagePrice === 'NaN') {
        vehicle.averagePrice = '';
    };

    vehicle.tripDayRatio = ((vehicle.completedTrips / vehicle.daysOn).toFixed(2));
    if (vehicle.tripDayRatio === 'NaN') {
        vehicle.tripDayRatio = '';
    };

};

function convertArrayToString(arr: any[]) {
    const labels = arr.map(item => item.label);
    return labels.join(", ");
}

function calculateBusyDaysAndIncome(data, days) {
    let endDate = DateTime.now().toFormat('MM/dd/yyyy');
    let startDate = DateTime.now().minus({ days: days }).toFormat('MM/dd/yyyy');
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filter the objects based on the date range
    const filteredDates = data.filter(obj => {
        const objDate = new Date(obj.date);
        return objDate >= start && objDate <= end;
    });


    let daysUnavailable = 0;
    let totalEarned = 0;

    filteredDates.forEach(day => {
        if (day.wholeDayUnavailable) {
            daysUnavailable++;
            totalEarned += day.price;
            // calculate average price
        }
        
    });

    return { days: daysUnavailable, income: totalEarned };
};

async function saveTrueToDownloadTrigger() {
    const storage = new Storage()
    await storage.set('downloadTrigger', true);
};

async function getIsEnriching () {
    const storage = new Storage()
    const isEnriching = await storage.get('isEnriching') 
    return isEnriching;
}