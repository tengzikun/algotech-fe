import {
  Button,
  Card,
  Chip,
  Divider,
  Tooltip,
  Typography
} from '@mui/material';
import React from 'react';
import '../../styles/pages/inventory/inventoryDashboard.scss';
import '../../styles/common/common.scss';
import NumberCard from 'src/components/common/NumberCard';
import { Product, StockQuantity } from 'src/models/types';
import asyncFetchCallback from 'src/services/util/asyncFetchCallback';
import { generateExcelSvc, getAllProducts } from 'src/services/productService';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams
} from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import ProductDashboardCellAction from 'src/components/inventory/ProductDashboardCellAction';
import InventoryLevelsChart from 'src/components/inventory/InventoryTurnoverChart';
import {
  createPdfWithHeaderImage,
  downloadFile,
  createImageFromComponent
} from 'src/utils/fileUtils';
import apiRoot from '../../services/util/apiRoot';
import StockPriorityCell from 'src/components/inventory/StockPriorityCell';


const columns: GridColDef[] = [
  { field: 'sku', headerName: 'SKU', flex: 1 },
  { field: 'name', headerName: 'Product Name', flex: 1 },
  {
    field: 'stockQuantity',
    headerName: 'Quantity',
    type: 'number',
    flex: 1,
    valueGetter: (params: GridValueGetterParams) => {
      return (
        params.value?.reduce(
          (prev: number, curr: StockQuantity) => prev + curr.quantity,
          0
        ) ?? 0
      );
    }
  },
  //   { last restock date },
  {
    field: 'qtyThreshold',
    headerName: 'Priority',
    type: 'number',
    flex: 1,
    renderCell: StockPriorityCell
  },
  {
    field: 'action',
    headerName: 'Action',
    headerAlign: 'right',
    flex: 2,
    renderCell: ProductDashboardCellAction
  }
];

const InventoryDashboard = () => {
  const pdfRef = React.createRef<HTMLDivElement>();
  const [productData, setProductData] = React.useState<Product[]>([]);

  const computeProductsWithLowStock = () => {
    let count = 0;
    productData.forEach((product) => {
      const { qtyThreshold, stockQuantity } = product;
      const totalQty = stockQuantity.reduce(
        (prev: number, curr: StockQuantity) => prev + curr.quantity,
        0
      );
      if (qtyThreshold && totalQty < qtyThreshold) {
        count++;
      }
    });
    return count;
  };

  const generateInventoryExcel = () => {
    asyncFetchCallback(generateExcelSvc(), (res) => {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', `${apiRoot}/product/excel`, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function (e) {
        if (this.status == 200) {
          var blob = new Blob([this.response], {
            type: 'application/octet-stream'
          });
          var link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = 'Invoice.xlsx';
          link.click();
        }
      };
      xhr.send();
    });

  }

  const generateChartPdf = React.useCallback(async () => {
    if (pdfRef.current) {
      const fileName = 'inventory-chart-levels.pdf';
      const pdf = createPdfWithHeaderImage(
        'Inventory Levels Chart',
        await createImageFromComponent(pdfRef.current)
      );
      downloadFile(pdf, fileName);
    }
  }, [pdfRef]);

  React.useEffect(() => {
    asyncFetchCallback(getAllProducts(), setProductData);
  }, []);

  console.log(productData);

  return (
    <div className='inventory-dashboard'>
      <h1>Inventory Dashboard</h1>
      <Divider className='full-divider' />
      <h4>At a glance</h4>
      <div className='horizontal-inline-bar'>
        <NumberCard
          number={computeProductsWithLowStock()}
          text='Products with low stock levels'
        />
        {/* <NumberCard number={20} text='Days of supply left on average' /> */}
      </div>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <Link
          to='/inventory/allProducts'
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Tooltip title='View all products' enterDelay={300}>
            <h4>Products</h4>
          </Tooltip>
        </Link>
        <Button onClick={() => generateInventoryExcel()}>Export Inventory Data</Button>
      </div>
      <div style={{ width: '100%' }}>
        <DataGrid
          sx={{ fontSize: '0.8em' }}
          columns={columns}
          rows={productData}
          autoHeight
          pageSize={5}
        />
      </div>
      {/* <h4>Overall Inventory Turnover</h4> */}

      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <h4>Current Inventory Levels by Product</h4>
        <Button onClick={() => generateChartPdf()}>Download</Button>
      </div>
      <InventoryLevelsChart productData={productData} ref={pdfRef} />
    </div>
  );
};

export default InventoryDashboard;

