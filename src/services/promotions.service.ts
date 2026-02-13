import axios from 'axios';
import type { AxiosInstance } from 'axios';


export interface Promotion {
  id: number;
  product: {
    id: number;
    name: string;
  };
  promotionalPrice: number;
  startAt: string;
  endAt: string;
  active: boolean;
}

export interface CreatePromotionDto {
  productId: number;
  promotionalPrice: number;
  startAt: string;
  endAt: string;
  active: boolean;
}

export interface UpdatePromotionDto extends Partial<CreatePromotionDto> {}

class PromotionsService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:3002',
    });
  }

  async getAllPromotions(): Promise<Promotion[]> {
    const response = await this.api.get<Promotion[]>('/promotions');
    return response.data;
  }

  async getPromotionById(id: number): Promise<Promotion> {
    const response = await this.api.get<Promotion>(`/promotions/${id}`);
    return response.data;
  }

  async createPromotion(data: CreatePromotionDto): Promise<Promotion> {
    const response = await this.api.post<Promotion>('/promotions', data);
    return response.data;
  }

  async updatePromotion(
    id: number,
    data: UpdatePromotionDto
  ): Promise<Promotion> {
    const response = await this.api.patch<Promotion>(`/promotions/${id}`, data);
    return response.data;
  }

  async deletePromotion(id: number): Promise<void> {
    await this.api.delete(`/promotions/${id}`);
  }
}

export default new PromotionsService();
