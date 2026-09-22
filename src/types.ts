export type Role = 'Admin' | 'Banker' | 'User';

export type TransactionType = 'Debit' | 'Credit';

export type CategoryType = 'Tea' | 'Food' | 'Travel' | 'Gift' | 'Snacks' | 'Shopping' | 'Entertainment' | 'Other' | 'Top-Up';

export interface Member {
  id: string;
  name: string;
  avatarLetter: string;
  color: string;
  role: Role;
  balanceType: 'Debt' | 'Credit';
  balanceAmount: number;
  isTopCredit?: boolean;
  fullName?: string;
  upi?: string;
  dob?: string;
  pin?: string;
}

export interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  type: TransactionType;
  category: CategoryType;
  date: string; // YYYY-MM-DD or DD-MM-YYYY
  time: string; // e.g. "05:45 PM"
  amount: number;
  description?: string;
  note?: string;
  utr?: string;
  receiptUrl?: string;
}

export type TabType = 'home' | 'new' | 'history' | 'settings';

export type ChartType = 'line' | 'bar' | 'pie';

export interface CategorySpending {
  category: CategoryType;
  amount: number;
  color: string;
  percentage: number;
  iconName: string;
}
