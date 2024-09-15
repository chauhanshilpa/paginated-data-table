import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";
import { FaChevronDown } from "react-icons/fa6";
import { OverlayPanel } from "primereact/overlaypanel";

const columns = [
  { field: "title", header: "Title" },
  { field: "place_of_origin", header: "Place_of_origin" },
  { field: "artist_display", header: "Artist_display" },
  { field: "inscriptions", header: "Inscriptions" },
  { field: "date_start", header: "Date_start" },
  { field: "date_end", header: "Date_end" },
];

interface Product {
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: null | string;
  date_start: number;
  date_end: number;
}

const Table = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [numberOfPagesToSelect, setNumberOfPagesToSelect] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectAll, setSelectAll] = useState(false);
  const [lazyState, setlazyState] = useState({
    first: 0,
    rows: 10,
    page: 0,
  });
  const [selectedPageRowMapping, setSelectedPageRowMapping] = useState({});

  const overlayPanel = useRef(null);

  useEffect(() => {
    loadLazyData();
    manualSelection();
  }, [lazyState]);

  const loadLazyData = async () => {
    setLoading(true);
    try {
      const productResponse = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${lazyState.page + 1}`
      );
      setTotalRecords(productResponse.data.pagination.total);
      setProducts(productResponse.data.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const onPage = (event) => {
    setlazyState(event);
  };

  const onSelectionChange = (event) => {
    const value = event.value;
    setSelectedProducts(value);
    setSelectAll(value.length === totalRecords);
  };

  const onSelectAllChange = (event) => {
    const selectAll = event.checked;
    if (selectAll) {
      setSelectAll(true);
      setSelectedProducts(products);
    } else {
      setSelectAll(false);
      setSelectedProducts([]);
    }
  };

  function onManualSelectionClick() {
    let intergerValueOfnumberOfPagesToSelect = Number(numberOfPagesToSelect);
    if (
      intergerValueOfnumberOfPagesToSelect <= 0 ||
      isNaN(Number(intergerValueOfnumberOfPagesToSelect))
    ) {
      return;
    }
    let currPage = lazyState.page;
    const tempSelectedRowMapping = { ...selectedPageRowMapping };
    while (intergerValueOfnumberOfPagesToSelect > 0) {
      tempSelectedRowMapping[currPage] = Math.min(
        12,
        intergerValueOfnumberOfPagesToSelect
      );
      intergerValueOfnumberOfPagesToSelect -= tempSelectedRowMapping[currPage];
      currPage++;
    }
    setSelectedPageRowMapping({ ...tempSelectedRowMapping });
    manualSelection();
  }

  function manualSelection() {
    const value = [];
    for (let i = 0; i < selectedPageRowMapping[lazyState.page]; i++) {
      value.push(products[i]);
    }
    console.log(value)
    setSelectedProducts(value);
  }

  return (
    <>
      <DataTable
        value={products}
        tableStyle={{ minWidth: "50rem" }}
        paginator
        rows={12}
        lazy
        // filterDisplay="row"
        dataKey="id"
        first={lazyState.first}
        totalRecords={totalRecords}
        onPage={onPage}
        loading={loading}
        selectAll={selectAll}
        // selectionMode={rowClick ? null : "checkbox"}
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
              onClick={(e) => overlayPanel.current.toggle(e)}
            />
          }
        />
        {columns.map((col) => (
          <Column key={col.field} field={col.field} header={col.header} />
        ))}
      </DataTable>
      <OverlayPanel ref={overlayPanel} style={{ marginTop: "2.8rem" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <input
            type="number"
            value={numberOfPagesToSelect}
            placeholder="Select rows..."
            style={{
              padding: "5px",
              border: "1px solid black",
              borderRadius: "5px",
            }}
            onChange={(event) => setNumberOfPagesToSelect(event.target.value)}
          />
          <button
            style={{
              marginTop: "1rem",
              border: "1px solid black",
              padding: "5px",
              borderRadius: "5px",
            }}
            onClick={onManualSelectionClick}
          >
            Submit
          </button>
        </div>
      </OverlayPanel>
    </>
  );
};

export default Table;
