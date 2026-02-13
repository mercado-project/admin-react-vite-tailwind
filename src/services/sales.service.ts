import axios from 'axios';
import type { AxiosInstance } from 'axios';

export interface Sale {
  id: number;
  order?: {
    id: number;
  };
  customer: {
    id: number;
    name: string;
    email: string;
  };
  product: {
    id: number;
    name: string;
  };
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'canceled';
  paymentMethod: 'card' | 'pix' | 'boleto';
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleDto {
  customerId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  paymentMethod: 'card' | 'pix' | 'boleto';
  orderId?: number;
}

export interface UpdateSaleDto extends Partial<CreateSaleDto> {}

class SalesService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:3002',
    });
  }

  async getAllSales(): Promise<Sale[]> {
    const response = await this.api.get<Sale[]>('/sales');
    const data = Array.isArray(response.data) ? response.data : [];
    return data;
  }

  async getSaleById(id: number): Promise<Sale> {
    const response = await this.api.get<Sale>(`/sales/${id}`);
    return response.data;
  }

  async getSalesByCustomer(customerId: number): Promise<Sale[]> {
    const response = await this.api.get<Sale[]>(`/sales/customer/${customerId}`);
    const data = Array.isArray(response.data) ? response.data : [];
    return data;
  }

  async getSalesByProduct(productId: number): Promise<Sale[]> {
    const response = await this.api.get<Sale[]>(`/sales/product/${productId}`);
    const data = Array.isArray(response.data) ? response.data : [];
    return data;
  }

  async getSalesByStatus(status: string): Promise<Sale[]> {
    const response = await this.api.get<Sale[]>('/sales', { params: { status } });
    const data = Array.isArray(response.data) ? response.data : [];
    return data;
  }

  async createSale(data: CreateSaleDto): Promise<Sale> {
    const response = await this.api.post<Sale>('/sales', data);
    return response.data;
  }

  async updateSale(id: number, data: UpdateSaleDto): Promise<Sale> {
    const response = await this.api.patch<Sale>(`/sales/${id}`, data);
    return response.data;
  }

  async deleteSale(id: number): Promise<void> {
    await this.api.delete(`/sales/${id}`);
  }
}

export default new SalesService();
