import React from 'react';
import { useNavigate } from 'react-router';
import {
  Tooltip,
  IconButton,
  Paper,
  Button,
  Backdrop,
  CircularProgress,
  TextField,
  MenuItem
} from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';
import DisplayedField from 'src/components/common/DisplayedField';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSearchParams } from 'react-router-dom';
import asyncFetchCallback from 'src/services/util/asyncFetchCallback';
import {
  editProcurementOrder,
  getProcurementOrderById
} from 'src/services/procurementService';
import { ProcurementOrder, ProcurementOrderItem } from 'src/models/types';
import { FulfilmentStatus } from 'src/models/types';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import apiRoot from 'src/services/util/apiRoot';
import { toast } from 'react-toastify';

const order = {
  order_id: '123456',
  order_date: '03/03/12 22:43',
  supplier: 'Popcorn Planet',
  payment_status: 'Paid',
  order_total: '10000',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam luctus lorem turpis, vitae cursus augue maximus ut. Lorem ipsum dolor sit amet, consectetur adipiscing elit. '
};

const columns: GridColDef[] = [
  { field: 'product_sku', headerName: 'SKU', flex: 1 },
  { field: 'product_name', headerName: 'Product Name', flex: 1 },
  { field: 'rate', headerName: 'Rate per Unit', flex: 1 },
  { field: 'quantity', headerName: 'Quantity', flex: 1 }
];

const paymentStatusOptions = [
  { id: 1, value: 'PAID' },
  { id: 2, value: 'PENDING' }
];

const ProcurementOrderDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [originalOrder, setOriginalOrder] = React.useState<ProcurementOrder>();
  const [originalOrderItems, setOriginalOrderItems] = React.useState<
    ProcurementOrderItem[]
  >([]);
  const [originalOrderDate, setOriginalOrderDate] = React.useState('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [edit, setEdit] = React.useState<boolean>(false);

  React.useEffect(() => {
    setLoading(true);
    if (id) {
      asyncFetchCallback(
        getProcurementOrderById(id),
        (res) => {
          let currentDate = new Date(res.order_date);
          let stringOrderDate = currentDate.toDateString();
          setOriginalOrderDate(stringOrderDate);
          setOriginalOrderItems(res.proc_order_items);
          setOriginalOrder(res);
          setLoading(false);
        },
        () => setLoading(false)
      );
    }
  }, [id]);

  const handleDownloadInvoice = async () => {
    if (id) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', `${apiRoot}/procurement/pdf/${id}`, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function (e) {
        if (this.status == 200) {
          var blob = new Blob([this.response], {
            type: 'application/pdf'
          });
          var link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = 'PurchaseOrder.pdf';
          link.click();
        }
      };
      xhr.send();
    }
  };

  const handleEditProcurementOrder = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    await setOriginalOrder((prev) => {
      if (prev) {
        return { ...prev, [e.target.name]: e.target.value };
      } else {
        return prev;
      }
    });
  };

  const handleOrderStatusUpdate = async () => {
    setLoading(true);

    let reqBody = {
      id: originalOrder?.id,
      description: originalOrder?.description,
      payment_status: originalOrder?.payment_status,
      fulfilment_status:
        originalOrder?.fulfilment_status === 'CREATED' ? 'ARRIVED' : 'COMPLETED'
    };

    await asyncFetchCallback(
      editProcurementOrder(reqBody),
      (res) => {
        setOriginalOrder((originalOrder) => {
          if (originalOrder) {
            return {
              ...originalOrder,
              fulfilment_status:
                originalOrder?.fulfilment_status === FulfilmentStatus.CREATED
                  ? FulfilmentStatus.ARRIVED
                  : FulfilmentStatus.COMPLETED
            };
          } else {
            return originalOrder;
          }
        });
        toast.success('Fulfilment Status Updated Succesfully.', {
          position: 'top-right',
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        });
        setLoading(false);
      },
      (err) => {}
    );
  };

  const handleOrderUpdate = async () => {
    setLoading(true);

    let reqBody = {
      id: originalOrder?.id,
      description: originalOrder?.description,
      payment_status: originalOrder?.payment_status,
      fulfilment_status: originalOrder?.fulfilment_status
    };

    await asyncFetchCallback(
      editProcurementOrder(reqBody),
      (res) => {
        setOriginalOrder((originalOrder) => {
          if (originalOrder) {
            return originalOrder;
          }
        });
        toast.success('Procurement Order Updated Successfully.', {
          position: 'top-right',
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        });
        setLoading(false);
      },
      (err) => {}
    );
  };

  return (
    <div className='view-order-details'>
      <div className='view-order-details-heading'>
        <div className='section-header'>
          <Tooltip title='Return to Previous Page' enterDelay={300}>
            <IconButton size='large' onClick={() => navigate(-1)}>
              <ChevronLeft />
            </IconButton>
          </Tooltip>
          <h1>View Procurement Order ID: #{originalOrder?.id}</h1>
        </div>
        <div className='button-container'>
          <Button
            variant='contained'
            // size='medium'
            // sx={{ width: '10px' }}
            onClick={() => {
              if (!edit) {
                setEdit(true);
              } else {
                handleOrderUpdate();
                setEdit(false);
              }
            }}
          >
            {edit ? 'Save Changes' : 'Edit'}
          </Button>
          {edit && (
            <Button
              variant='contained'
              size='medium'
              sx={{ width: 'fit-content' }}
              onClick={() => {
                setEdit(false);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
        open={loading}
      >
        <CircularProgress color='inherit' />
      </Backdrop>
      <div className='order-details-section'>
        <Paper elevation={2} className='order-details-paper'>
          <div className='horizontal-text-fields'>
            <DisplayedField label='Order ID' value={originalOrder?.id} />
            <DisplayedField label='Date' value={originalOrderDate} />
            <DisplayedField
              label='Supplier'
              value={originalOrder?.supplier_id}
            />
          </div>
          <div className='horizontal-text-fields-two'>
            {edit ? (
              <div
                style={{
                  width: '50%',
                  padding: '2rem',
                  paddingBottom: '0'
                }}
              >
                <TextField
                  id='payment-status-select-label'
                  label='Payment Status'
                  name='payment_status'
                  value={originalOrder?.payment_status}
                  // defaultValue={originalOrder?.payment_status}
                  onChange={handleEditProcurementOrder}
                  select
                  fullWidth
                >
                  {paymentStatusOptions.map((option) => (
                    <MenuItem key={option.id} value={option.value}>
                      {option.value}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
            ) : (
              <DisplayedField
                label='Payment Status'
                value={originalOrder?.payment_status}
              />
            )}
            <DisplayedField
              label='Order Total'
              value={originalOrder?.total_amount}
            />
          </div>
          <div className='horizontal-text-fields'>
            {edit ? (
              <div
                style={{
                  flexDirection: 'column',
                  padding: '2rem',
                  paddingBottom: '0'
                }}
              >
                <TextField
                  id='outlined-required'
                  label='Description'
                  name='description'
                  value={originalOrder?.description}
                  onChange={handleEditProcurementOrder}
                  placeholder='Enter updated description here.'
                  fullWidth
                  multiline
                  maxRows={4}
                />
              </div>
            ) : (
              <DisplayedField
                label='Comments'
                value={originalOrder?.description}
              />
            )}
          </div>
          <div className='horizontal-text-fields'>
            <DisplayedField label='Purchase Order Invoice' value='' />
          </div>
          <div
            style={{
              paddingLeft: '3rem',
              paddingBottom: '0'
            }}
          >
            <Button
              variant='outlined'
              startIcon={<PictureAsPdfIcon />}
              onClick={handleDownloadInvoice}
            >
              PurchaseOrder.pdf
            </Button>
          </div>
          {/* <div
            style={{
              flexDirection: 'row',
              paddingLeft: '2rem',
              paddingBottom: '0'
            }}
          >
            <PictureAsPdfIcon />
            <small>Invoice.pdf</small>
          </div> */}
        </Paper>
        <Paper elevation={2} className='order-details-paper'>
          <h3>View Order Status</h3>
          <React.Fragment>
            <Timeline>
              <TimelineItem>
                <TimelineOppositeContent color='text.primary'>
                  Order Created
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color='primary' />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent color='text.secondary'>
                  Order Sent
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineOppositeContent color='text.primary'>
                  Order Arrived
                </TimelineOppositeContent>
                <TimelineSeparator>
                  {(originalOrder?.fulfilment_status === 'ARRIVED' ||
                    originalOrder?.fulfilment_status === 'COMPLETED') && (
                    <TimelineDot color='primary' />
                  )}
                  {originalOrder?.fulfilment_status === 'CREATED' && (
                    <TimelineDot variant='outlined' />
                  )}
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent color='text.secondary'>
                  Shipment Delivered
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineOppositeContent color='text.primary'>
                  Order Completed
                </TimelineOppositeContent>
                <TimelineSeparator>
                  {originalOrder?.fulfilment_status === 'COMPLETED' && (
                    <TimelineDot color='primary' />
                  )}
                  {originalOrder?.fulfilment_status !== 'COMPLETED' && (
                    <TimelineDot variant='outlined' />
                  )}
                </TimelineSeparator>
                <TimelineContent color='text.secondary'>
                  Shipment Verified
                </TimelineContent>
              </TimelineItem>
            </Timeline>
          </React.Fragment>
          <div className='status-button-container'>
            {originalOrder?.fulfilment_status !== 'COMPLETED' && (
              <Button
                variant='contained'
                size='medium'
                sx={{ width: 'fit-content' }}
                onClick={handleOrderStatusUpdate}
              >
                {originalOrder?.fulfilment_status === 'CREATED'
                  ? 'Order Arrived'
                  : 'Order Completed'}
              </Button>
            )}
          </div>
        </Paper>
      </div>
      <div className='data-table-section'>
        <h2>Order Items</h2>
        <DataGrid columns={columns} rows={originalOrderItems} autoHeight />
      </div>
    </div>
  );
};

export default ProcurementOrderDetails;
