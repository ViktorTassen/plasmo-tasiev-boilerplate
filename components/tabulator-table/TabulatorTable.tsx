import React, { useRef, useEffect } from "react";
import { Tabulator } from "tabulator-tables"; // Import Tabulator library
import "tabulator-tables/dist/css/tabulator.min.css"; // Import Tabulator stylesheet

function TabulatorTable(props) {
  
  const tableRef = useRef(null);

  useEffect(() => {
    const tabulator = new Tabulator(tableRef.current, {
      data: props.data, // Link data to table
      reactiveData: true, // Enable data reactivity
      columns: [
        { title: "id", field: "id", width: 150 },
        { title: "make", field: "make", width: 150 },
        { title: "model", field: "model", width: 150 },
      ], // Define table columns
    });

    // Cleanup when the component unmounts
    return () => {
      tabulator.destroy();
    };
  }, [props.data]);

  // Add a table holder element to the DOM
  return (
    <div ref={tableRef} />
  );
}

export default TabulatorTable;


// import "tabulator-tables/dist/css/tabulator.min.css"; // Import Tabulator stylesheet
// import 'react-tabulator/lib/styles.css';
// import { ReactTabulator } from 'react-tabulator'

// function TabulatorTable(props) {
//   const columns = [
//     { title: "id", field: "id", width: 150 },
//     { title: "id", field: "id", width: 150 },
//     { title: "id", field: "id", width: 150 },
//     { title: "id", field: "id", width: 150 },
//     { title: "id", field: "id", width: 150 },
//     { title: "id", field: "id", width: 150 },
//     { title: "id", field: "id", width: 150 },
//     { title: "id", field: "id", width: 150 },
//     { title: "id", field: "id", width: 150 },
//     { title: "id", field: "id", width: 150 },
//     { title: "id", field: "id", width: 150 },
//     { title: "id", field: "id", width: 150 },
//     { title: "id", field: "id", width: 150 },
//   ];
//   return (
//     <ReactTabulator
//       columns={columns}
//       data={props.data}
//       tooltips={true}
//       layout={"fitData"}
//       responsiveLayout={"hide"}
//       pagination={"local"}
//       paginationSize={10}
//       movableColumns={true}
//       resizableRows={true}
//       initialSort={[{ column: "name", dir: "asc" }]}
//     />
//   );
// }

// export default TabulatorTable;


