
export interface Product {
  name: string;
  code: string;
}

export interface Funnel {
  id: string;
  name: string;
  products: Product[];
  targetRevenue: number;
  conversionGoal: number;
  status: 'active' | 'archived';
}

export interface ClientData {
  name: string;
  companyName: string;
  logo: string;
}

export type SaleStatus = 'approved' | 'refunded' | 'canceled';

export interface Sale {
  id: string;
  transactionId?: string;
  funnelId?: string;
  offerCode: string;
  amount: number;
  timestamp: string;
  productName: string;
  source: 'hotmart' | 'manual';
  status: SaleStatus;
  customerName?: string;
  customerPhone?: string;
}

export interface CommercialActivity {
  id: string;
  funnelId: string;
  salesperson: string;
  leadsContacted: number;
  salesClosed: number;
  leadsLost: number;
  leadQuality: number;
  date: string;
}

export type LeadStatus = 'new' | 'scheduled' | 'conducted' | 'won' | 'lost';

export interface Lead {
  id: string;
  funnelId?: string;
  source: 'clint' | 'manual';
  timestamp: string;
  name: string;
  phone?: string;
  tags?: string;
  status: LeadStatus;
  dealUser?: string;
  observations?: string;
}

export interface TrafficInvestment {
  id: string;
  date: string;
  amount: number;
  source: string;
}

export type TabType = 'dashboard' | 'commercial' | 'traffic' | 'admin' | 'integrations';
