import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  MenuItem,
  Grid,
  TextField,
  ListItemText,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import Box from '@mui/material/Box';
import React from 'react';
import { Product } from 'src/models/types';
import { getAllProducts } from 'src/services/productService';
import asyncFetchCallback from 'src/services/util/asyncFetchCallback';
import '../../styles/pages/procurement.scss';
import TimeoutAlert, { AlertType } from '../common/TimeoutAlert';

type AddProductModalPops = {
  open: boolean;
  onClose: () => void;
  onConfirm: (sku: string, rate: string, quantity: string) => void;
  title: string;
  focusPassthrough?: boolean;
};

const AddProductModal = ({
  open,
  onClose,
  onConfirm,
  title,
  focusPassthrough = false
}: AddProductModalPops) => {
  const [sku, setSku] = React.useState<string>('');
  const [rate, setRate] = React.useState<string>('');
  const [quantity, setQuantity] = React.useState<string>('');
  const [products, setProducts] = React.useState<Product[]>([]);
  const [alert, setAlert] = React.useState<AlertType | null>(null);

  const submitHandler = (sku: string, rate: string, quantity: string) => {
    if (sku === '' || undefined) {
      setAlert({
        severity: 'warning',
        message: 'Please Enter a SKU!'
      });
      return;
    }

    if (rate === '' || undefined) {
      setAlert({
        severity: 'warning',
        message: 'Please Enter a Rate!'
      });
      return;
    }

    if (parseInt(rate) <= 0) {
      console.log(parseInt(rate));
      setAlert({
        severity: 'warning',
        message: 'Please Enter a valid Rate!'
      });
      return;
    }

    if (parseInt(quantity) <= 0) {
      setAlert({
        severity: 'warning',
        message: 'Please Enter a valid Quantity!'
      });
      return;
    }

    if (quantity === '' || undefined) {
      setAlert({
        severity: 'warning',
        message: 'Please Enter a Quantity!'
      });
      return;
    }

    onConfirm(sku, rate, quantity);
  };

  React.useEffect(() => {
    setSku('');
    setRate('');
    setQuantity('');
    setAlert(null);
    asyncFetchCallback(getAllProducts(), setProducts);
  }, [open, onClose]);

  return (
    <div>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth='sm'
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{title}</DialogTitle>
        <div className='modal-alert'>
          {alert && (
            <TimeoutAlert
              alert={alert}
              timeout={6000}
              clearAlert={() => setAlert(null)}
            />
          )}
        </div>
        <Box component='form'>
          <div className='modal-text-fields'>
            <Grid container direction={'column'} spacing={3}>
              <Grid item>
                <TextField
                  id='outlined-required'
                  label='SKU'
                  name='sku'
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  select
                  required
                  fullWidth
                >
                  {products.map((option) => (
                    <MenuItem key={option.id} value={option.sku}>
                      <ListItemText inset>SKU: {option.sku}</ListItemText>
                      <Typography variant='subtitle1' color='text.secondary'>
                        Product Name: {option.name}
                      </Typography>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item>
                <TextField
                  id='outlined-required'
                  label='Rate per Unit'
                  name='rate'
                  type='number'
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder='Eg. $5'
                  required
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  id='outlined-required'
                  label='Purchase Quantity'
                  name='quantity'
                  type='number'
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder='Eg. 1000 units'
                  required
                  fullWidth
                />
              </Grid>
            </Grid>
          </div>
          <DialogActions>
            <Button onClick={onClose} autoFocus={!focusPassthrough}>
              Cancel
            </Button>
            <Button
              // type='submit'
              // onClick={() => onConfirm(sku, rate, quantity)}
              onClick={() => submitHandler(sku, rate, quantity)}
              autoFocus={focusPassthrough}
            >
              Confirm
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </div>
  );
};

export default AddProductModal;
