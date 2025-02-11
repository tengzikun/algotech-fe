import React from 'react';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import BrandCellAction from '../../components/inventory/BrandCellAction';
import '../../styles/pages/inventory/inventory.scss';
import '../../styles/common/common.scss';
import { Button, TextField } from '@mui/material';
import { Search } from '@mui/icons-material';
import { Brand } from '../../models/types';
import asyncFetchCallback from '../../services/util/asyncFetchCallback';
import {
  getAllBrands,
} from 'src/services/brandService';
import { useNavigate } from 'react-router';

const columns: GridColDef[] = [
  {field: 'name', headerName: 'Brand Name', flex: 1 },
  {
    field: 'action',
    headerName: 'Action',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    renderCell: BrandCellAction
  }
];

const AllBrands = () => {

  const navigate = useNavigate();

  const [loading, setLoading] = React.useState<boolean>(false);
  const [searchField, setSearchField] = React.useState<string>('');
  const [brandData, setBrandData] = React.useState<Brand[]>([]);
  const [filteredData, setFilteredData] = React.useState<Brand[]>([]);

  React.useEffect(() => {
    // TODO: implement error callback
    setLoading(true);
    asyncFetchCallback(
      getAllBrands(),
      (res) =>  {
        setLoading(false);
        setBrandData(res);
      },
      () => setLoading(false)
      );
  }, []);

  React.useEffect(() => {
    setFilteredData(
      searchField
        ? brandData.filter((category) =>
            Object.values(category).some((value) =>
              String(value).toLowerCase().match(searchField.toLowerCase())
            )
          )
        : brandData
    );
  }, [searchField, brandData]);

  console.log(filteredData);

  const handleSearchFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchField(e.target.value);
  };

  return (
    <div className='product-inventory'>
      <h1>Manage Brands</h1>
      <div className='grid-toolbar'>
        <div className='search-bar'>
          <Search />
          <TextField
            id='search'
            label='Search'
            margin='normal'
            fullWidth
            onChange={handleSearchFieldChange}
          />
        </div>
        <Button
          variant='contained'
          size='large'
          sx={{ height: 'fit-content' }}
          onClick={() => navigate({ pathname: '/inventory/createBrand' })}
        >
          Create Brand
        </Button>
      </div>
      <DataGrid
        columns={columns}
        rows={filteredData}
        loading={loading}
        autoHeight />
    </div>
  );

};

export default AllBrands;