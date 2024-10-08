import { useState, useEffect, useRef } from "react";
import {
  DataTable,
  DataTableStateEvent,
  DataTableSelectAllChangeEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";
import { FaChevronDown } from "react-icons/fa6";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const columns = [
  { field: "title", header: "Title" },
  { field: "place_of_origin", header: "Place_of_origin" },
  { field: "artist_display", header: "Artist_display" },
  { field: "inscriptions", header: "Inscriptions" },
  { field: "date_start", header: "Date_start" },
  { field: "date_end", header: "Date_end" },
];
const DEFAULT_NUM_ROWS = 12;

interface Product {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: null | string;
  date_start: number;
  date_end: number;
}

const Table = () => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [inputValue, setInputValue] = useState<string | number>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [lazyState, setlazyState] = useState({
    first: 0,
    rows: DEFAULT_NUM_ROWS,
    page: 0,
  });
  const productsRef = useRef<Product[]>([]);
  const pageRowMappingRef = useRef<{ [key: number]: Set<number> }>({});
  const productIdToRowNumMappingRef = useRef<{ [key: string]: number }>({});
  const overlayPanel = useRef<OverlayPanel>(null);

  useEffect(() => {
    (async function () {
      await loadLazyData();
      manualSelection();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lazyState]);

  const loadLazyData = async () => {
    setLoading(true);
    try {
      const productResponse = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${lazyState.page + 1}`
      );
      setTotalRecords(productResponse.data.pagination.total);
      productsRef.current = productResponse.data.data;
      const tempObj: { [key: string]: number } = {};
      for (let i = 0; i < productsRef.current.length; i++) {
        const item = productsRef.current[i];
        tempObj[item.id] = i;
      }
      productIdToRowNumMappingRef.current = { ...tempObj };
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const onPage = (event: DataTableStateEvent) => {
    setlazyState({
      ...event,
      page: event.page ?? 0,
    });
  };

  const onSelectionChange = (event: { value: Product[] }) => {
    const value = event.value;
    const currentPage = lazyState.page;
    const tempSet: Set<number> = new Set();
    for (const row of value) {
      const rowNumber = productIdToRowNumMappingRef.current[row.id];
      tempSet.add(rowNumber);
    }
    pageRowMappingRef.current[currentPage] = tempSet;
    manualSelection();
    setSelectAll(value.length === DEFAULT_NUM_ROWS);
  };

  const onSelectAllChange = (event: DataTableSelectAllChangeEvent) => {
    const selectAll = event.checked;
    const currentPage = lazyState.page;
    if (selectAll) {
      setSelectAll(true);
      pageRowMappingRef.current[currentPage] = new Set(
        Array.from(Array(DEFAULT_NUM_ROWS).keys())
      );
    } else {
      setSelectAll(false);
      pageRowMappingRef.current[currentPage] = new Set();
    }
    manualSelection();
  };

  function onManualSelectionClick() {
    const inputNumber = Number(inputValue);
    if (inputNumber <= 0 || isNaN(inputNumber)) {
      return;
    }
    let rowsToSelect = inputNumber;
    let page = lazyState.page;
    while (rowsToSelect > 0) {
      const productRows: Set<number> = pageRowMappingRef.current[page] || new Set();
      for (let i = 0; i < Math.min(DEFAULT_NUM_ROWS, rowsToSelect); i++) {
        productRows.add(i);
      }
      pageRowMappingRef.current[page] = productRows;
      page++;
      rowsToSelect -= DEFAULT_NUM_ROWS;
    }
    manualSelection();
    setInputValue("");
  }

  function manualSelection() {
    const value = [];
    const currentPage = lazyState.page;
    const rows = pageRowMappingRef.current[currentPage];
    if (rows !== undefined) {
      for (const rowNumber of rows) {
        value.push(productsRef.current[rowNumber]);
      }
      setSelectedProducts([...value]);
    }
    setSelectAll(value.length === DEFAULT_NUM_ROWS);
  }

  return (
    <>
      <DataTable
        value={productsRef.current}
        tableStyle={{ minWidth: "50rem" }}
        paginator
        rows={DEFAULT_NUM_ROWS}
        lazy
        dataKey="id"
        first={lazyState.first}
        totalRecords={totalRecords}
        onPage={onPage}
        loading={loading}
        selectAll={selectAll}
        selectionMode={onclick ? null : "checkbox"}
        onSelectAllChange={onSelectAllChange}
        selection={selectedProducts}
        onSelectionChange={onSelectionChange}
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
        ></Column>
        <Column
          header={
            <FaChevronDown
              style={{ cursor: "pointer" }}
              onClick={(e) => overlayPanel.current?.toggle(e)}
            />
          }
        />
        {columns.map((col) => (
          <Column key={col.field} field={col.field} header={col.header} />
        ))}
      </DataTable>
      <OverlayPanel ref={overlayPanel} style={{ marginTop: "2.8rem" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <InputText
            keyfilter="int"
            placeholder="Select rows..."
            value={inputValue.toString()}
            onChange={(event) => setInputValue(event.target.value)}
          />
          <Button
            label="Submit"
            onClick={onManualSelectionClick}
            style={{
              marginTop: "1rem",
              width: "50%",
              alignSelf: "end",
              backgroundColor: "white",
              border: "1px solid black",
              color: "black",
            }}
          />
        </div>
      </OverlayPanel>
    </>
  );
};

export default Table;
