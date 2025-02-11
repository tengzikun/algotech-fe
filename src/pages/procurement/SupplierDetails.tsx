import React from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Box,
  FormGroup,
  TextField,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import '../../styles/pages/inventory/inventory.scss';
import { ChevronLeft } from '@mui/icons-material';
import asyncFetchCallback from '../../services/util/asyncFetchCallback';
import { Supplier } from '../../models/types';
import {
  deleteSupplier,
  getSupplierById,
  updateSupplier
} from '../../services/supplierService';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { toast } from 'react-toastify';
import { getAllSuppliers } from 'src/services/procurementService';

const SupplierDetails = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
  
    const current = useLocation();
    const supplier = current.state as Supplier;
  
    const [loading, setLoading] = React.useState<boolean>(true);
    const [modalOpen, setModalOpen] = React.useState<boolean>(false);
    const [originalSupplier, setOriginalSupplier] = React.useState<Supplier>();
    const [editSupplier, setEditSupplier] = React.useState<Supplier>(supplier);
    const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
    const [edit, setEdit] = React.useState<boolean>(false);
  
    const handleDeleteButtonClick = () => {
      setLoading(true);
      if (originalSupplier) {
        setLoading(false);
        asyncFetchCallback(
          deleteSupplier(originalSupplier.id),
          () => {
            toast.success('Supplier successfully deleted.', {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined
            });
            navigate('/orders/allSuppliers');
          },
          () => {
            toast.error('Error deleting supplier! Try again later.', {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined
            });
            navigate('/orders/allSuppliers');
          }
        );
      }
    };
  
    React.useEffect(() => {
      if (id) {
        asyncFetchCallback(getSupplierById(id), (res) => {
          setOriginalSupplier(res);
          setEditSupplier(res);
          setLoading(false);
        });
      }
    }, [id]);
  
    React.useEffect(() => {
      asyncFetchCallback(getAllSuppliers(), setSuppliers);
    }, []);
  
    const handleFieldOnChange = (
      event: React.ChangeEvent<HTMLInputElement>,
      key: string
    ) => {
      setEditSupplier((supplier: Supplier) => {
        return {
          ...supplier,
          [key]: event.target.value
        };
      });
    };
  
    const handleSave = async () => {
      setLoading(true);
      if (editSupplier) {
        setLoading(false);
        asyncFetchCallback(
          updateSupplier(editSupplier),
          () => {
            toast.success('Supplier successfully edited.', {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined
            });
          },
          () => {
            toast.error('Error editing supplier! Try again later.', {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined
            });
          }
        );
      }
    };
  
    const title = `${edit ? 'Edit' : ''} Supplier Details`;
  
    return (
      <div>
        <Tooltip title='Return to Previous Page' enterDelay={300}>
          <IconButton size='large' onClick={() => navigate(-1)}>
            <ChevronLeft />
          </IconButton>
        </Tooltip>
        <div className='create-product'>
          <Box className='create-product-box'>
            <div className='header-content'>
              <h1>{title}</h1>
              <div className='button-group'>
                {loading && <CircularProgress color='secondary' />}
                <Button
                  variant='contained'
                  className='create-btn'
                  color='primary'
                  onClick={() => {
                    if (!edit) {
                      setEdit(true);
                    } else {
                      handleSave();
                      setEdit(false);
                    }
                  }}
                >
                  {edit ? 'Save Changes' : 'Edit'}
                </Button>
                {edit && (
                  <Button
                    variant='contained'
                    className='create-btn'
                    color='primary'
                    onClick={() => {
                      setEdit(false);
                    }}
                  >
                    Discard Changes
                  </Button>
                )}
                <Button
                  variant='contained'
                  className='create-btn'
                  color='primary'
                  onClick={() => setModalOpen(true)}
                >
                  Delete
                </Button>
                <ConfirmationModal
                  open={modalOpen}
                  onClose={() => setModalOpen(false)}
                  onConfirm={handleDeleteButtonClick}
                  title='Delete Supplier'
                  body='Are you sure you want to delete this supplier?'
                />
              </div>
            </div>
            <Paper elevation={2}>
              <form>
                <FormGroup className='create-product-form'>
                  <div className='top-content'>
                    <div className='product-text-fields'>
                      {edit ? (
                        <TextField
                          required
                          fullWidth
                          id='outlined-required'
                          label='Supplier Name'
                          name='name'
                          value={editSupplier?.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleFieldOnChange(e, 'name')
                          }
                          placeholder='eg.: Packaging Supplier 1'
                        />
                      ) : (
                        <Typography
                          sx={{ padding: '15px' }}
                        >
                          {`Supplier Name: ${editSupplier?.name}`}
                        </Typography>
                      )}

                      {edit ? (
                        <TextField
                          required
                          fullWidth
                          id='outlined-required'
                          label='Supplier Email'
                          name='email'
                          value={editSupplier?.email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleFieldOnChange(e, 'email')
                          }
                          placeholder='eg.: john@gmail.com'
                        />
                      ) : (
                        <Typography
                          sx={{ padding: '15px' }}
                        >
                          {`Supplier Email: ${editSupplier?.email}`}
                        </Typography>
                      )}

                      {edit ? (
                        <TextField
                          required
                          fullWidth
                          id='outlined-required'
                          label='Supplier Address'
                          name='address'
                          value={editSupplier?.address}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleFieldOnChange(e, 'address')
                          }
                          placeholder='eg.: 123 Clementi Road, #01-01, Singapore 12345'
                        />
                      ) : (
                        <Typography
                          sx={{ padding: '15px' }}
                        >
                          {`Supplier Address: ${editSupplier?.address}`}
                        </Typography>
                      )}

                    </div>
                  </div>
                </FormGroup>
              </form>
            </Paper>
          </Box>
        </div>
      </div>
    );
  };
  
  export default SupplierDetails;
  