export interface CalculateRequest {
  loadRate: number;
  distance: number;
  deadheadMiles: number;
  fuelPricePerGallon: number;
  milesPerGallon: number;
  tollsCost: number;
  maintenancePerMile: number;
  insurancePerMile: number;
  truckPayment: number;
  trailerPayment: number;
  dispatchFeePercent: number;
  factoringFeePercent: number;
  otherExpenses: number;
}

export interface CalculateResponse {
  loadRate: number;
  distance: number;
  deadheadMiles: number;
  totalMiles: number;
  fuelCost: number;
  operatingCosts: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
  ratePerMile: number;
  fuelPricePerGallon: number;
  milesPerGallon: number;
  tollsCost: number;
  maintenancePerMile: number;
  insurancePerMile: number;
  truckPayment: number;
  trailerPayment: number;
  dispatchFeePercent: number;
  factoringFeePercent: number;
  dispatchFeeCost: number;
  factoringFeeCost: number;
  otherExpenses: number;
}

export interface AuthResponse {
  token: string;
  email: string;
  userId: number;
  expiresAt: string;
  subscriptionTier: string;
  isPremium: boolean;
}

export interface User {
  email: string;
  userId: number;
  token: string;
  subscriptionTier: string;
  isPremium: boolean;
}

export interface Load {
  id: number;
  loadRate: number;
  distance: number;
  deadheadMiles: number;
  fuelPricePerGallon: number;
  milesPerGallon: number;
  tollsCost: number;
  maintenancePerMile: number;
  insurancePerMile: number;
  truckPayment: number;
  trailerPayment: number;
  dispatchFeePercent: number;
  factoringFeePercent: number;
  otherExpenses: number;
  calculatedProfit: number;
  profitMargin: number;
  createdAt: string;
}

export interface SaveLoadRequest {
  loadRate: number;
  distance: number;
  deadheadMiles: number;
  fuelPricePerGallon: number;
  milesPerGallon: number;
  tollsCost: number;
  maintenancePerMile: number;
  insurancePerMile: number;
  truckPayment: number;
  trailerPayment: number;
  dispatchFeePercent: number;
  factoringFeePercent: number;
  otherExpenses: number;
  calculatedProfit: number;
  profitMargin: number;
}

export interface SubscriptionStatus {
  tier: string;
  isPremium: boolean;
  expiresAt: string | null;
  canSaveLoads: boolean;
}

export interface PricingInfo {
  monthlyPriceId: string;
  annualPriceId: string;
  monthlyPrice: number;
  annualPrice: number;
  configured: boolean;
}

export interface CheckoutResponse {
  checkoutUrl: string;
}

export interface Report {
  period: string;
  startDate: string;
  endDate: string;
  totalLoads: number;
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  averageProfitPerLoad: number;
  averageProfitMargin: number;
  totalMiles: number;
  averageRatePerMile: number;
  dailyBreakdown: DailyProfit[];
}

export interface DailyProfit {
  date: string;
  loadCount: number;
  revenue: number;
  profit: number;
}
