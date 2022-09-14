/**
 * Used to make all API calls to procurement-related services
 */
import axios from 'axios';
import { ProcurementOrder, Supplier } from 'src/models/types';
import apiRoot from './util/apiRoot';

export const getAllProcurementOrders = async (): Promise<
  ProcurementOrder[]
> => {
  return axios.get(`${apiRoot}/procurement/all`).then((res) => res.data);
};

export const getProcurementOrderById = async (
  id: string | number
): Promise<ProcurementOrder> => {
  return axios.get(`${apiRoot}/procurement/${id}`).then((res) => res.data);
};

export const getAllSuppliers = async (): Promise<Supplier[]> => {
  return axios.get(`${apiRoot}/supplier/all`).then((res) => res.data);
};
