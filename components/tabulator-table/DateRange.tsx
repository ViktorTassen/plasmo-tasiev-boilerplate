
import { DateRangePicker } from 'react-date-range';
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file

import { addDays, isSameDay, startOfDay, startOfYear, subDays, subMonths, subYears } from 'date-fns';

import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"
const storage = new Storage({ area: "local" });

import { Button, Stack, styled } from '@mui/material';

const SaveButton = styled(Button)({
backgroundColor: '#593cfb',
'&:hover': {
  backgroundColor: '#593cfb',
},
}); // for custom styles;



function DateRange(props) {
  // console.log(props);
  
  const [savedDateRange, setSavedDateRange, { setRenderValue, setStoreValue }] = useStorage({
    key: props["date-range-id"],
    instance: new Storage({
      area: "local"
    }),
  }, (v) => v === undefined
  ? [{ startDate: subMonths(new Date(), 1), endDate: new Date(), key: 'selection' }]
  : v);


  const handleSave = async () => {
    setStoreValue();
    storage.set('openModalDateRange', false);
    storage.set('selectedDateRangeId', null);
  };

  return (
    <Stack spacing={2}>
    <DateRangePicker
      editableDateInputs={true}
      onChange={item => setRenderValue([item.selection])}
      moveRangeOnFirstSelection={false}
      ranges={
        [{
          startDate: new Date(savedDateRange[0].startDate),
          endDate: new Date(savedDateRange[0].endDate),
          key: savedDateRange[0].key
        }]
      }
      maxDate={addDays(new Date(), 30)}
      staticRanges={[
        ...customRanges
      ]}
      rangeColors={['#593cfb', '#593cfb', '#593cfb']}
    />
    <SaveButton variant="contained" onClick={handleSave}>Save Date Range</SaveButton>
    </Stack>
  )
}


const customRanges = [
  {
    label: 'Future 30 Days',
    range: () => ({
      startDate: startOfDay(new Date()),
      endDate: startOfDay(addDays(new Date(), 30)),
    }),
    isSelected(range) {
      const definedRange = this.range();
      return (
        isSameDay(range.startDate, definedRange.startDate) &&
        isSameDay(range.endDate, definedRange.endDate)
      );
    },
  },

  {
    label: 'Last 30 Days',
    range: () => ({
      startDate: startOfDay(subDays(new Date(), 30)),
      endDate: startOfDay(new Date()),
    }),
    isSelected(range) {
      const definedRange = this.range();
      return (
        isSameDay(range.startDate, definedRange.startDate) &&
        isSameDay(range.endDate, definedRange.endDate)
      );
    },
  },
  {
    label: 'Last 90 Days',
    range: () => ({
      startDate: startOfDay(subDays(new Date(), 90)),
      endDate: startOfDay(new Date()),
    }),
    isSelected(range) {
      const definedRange = this.range();
      return (
        isSameDay(range.startDate, definedRange.startDate) &&
        isSameDay(range.endDate, definedRange.endDate)
      );
    },
  },
  {
    label: 'Last 180 Days',
    range: () => ({
      startDate: startOfDay(subDays(new Date(), 180)),
      endDate: startOfDay(new Date()),
    }),
    isSelected(range) {
      const definedRange = this.range();
      return (
        isSameDay(range.startDate, definedRange.startDate) &&
        isSameDay(range.endDate, definedRange.endDate)
      );
    },
  },
  {
    label: 'Last 365 Days',
    range: () => ({
      startDate: startOfDay(subYears(new Date(), 1)),
      endDate: startOfDay(new Date()),
    }),
    isSelected(range) {
      const definedRange = this.range();
      return (
        isSameDay(range.startDate, definedRange.startDate) &&
        isSameDay(range.endDate, definedRange.endDate)
      );
    },
  },
  {
    label: "This year",
    range: () => ({
      startDate: startOfDay(startOfYear(new Date())),
      endDate: startOfDay(new Date())
    }),
    isSelected(range) {
      const definedRange = this.range();
      return (
        isSameDay(range.startDate, definedRange.startDate) &&
        isSameDay(range.endDate, definedRange.endDate)
      );
    }
  }
];


export default DateRange;