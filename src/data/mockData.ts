import { Transaction, BankAccount, SavingGoal, BillReminder, SpreadsheetEnvelope } from '../types';

export const initialTransactions: Transaction[] = [];

export const initialBankAccounts: BankAccount[] = [
  {
    id: 'bank-1',
    name: 'Conta Corrente Principal',
    institution: 'Nubank',
    type: 'checking',
    balance: 0,
    lastSync: 'Aguardando sincronização',
    color: '#820ad1',
    status: 'connected',
    accountNumber: 'Conta 0001',
  },
  {
    id: 'bank-2',
    name: 'Cartão de Crédito Nubank',
    institution: 'Nubank',
    type: 'credit_card',
    balance: 0,
    availableLimit: 5000.0,
    lastSync: 'Aguardando sincronização',
    color: '#820ad1',
    status: 'connected',
    accountNumber: 'Final 8421',
  },
];

export const initialSavingGoals: SavingGoal[] = [];

export const initialBillReminders: BillReminder[] = [];

export const emptySpreadsheetEnvelopes: SpreadsheetEnvelope[] = [
  {
    id: 'env-1',
    name: 'Renda Principal do Mês',
    incomeAmount: 0,
    percentageOfIncome: 100,
    color: '#059669', // emerald-600
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    totalAllocated: 0,
    finalBalance: 0,
    items: [],
  },
];

export const initialSpreadsheetEnvelopes: SpreadsheetEnvelope[] = [
  {
    id: 'env-1',
    name: 'Renda Principal do Mês',
    incomeAmount: 0,
    percentageOfIncome: 100,
    color: '#059669', // emerald-600
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    totalAllocated: 0,
    finalBalance: 0,
    items: [],
  },
];

export const spreadsheetTotals = {
  totalIncome: 0,
  totalExpense: 0,
  totalInvestment: 0,
  surplusRemainder: 0,
  incomes: [
    { description: 'Renda Principal', amount: 0, percentage: 100 },
  ],
};

export const monthlyHistoryData = [
  { month: 'Mai', gastos: 0, investimentos: 0, entradas: 0 },
  { month: 'Jun', gastos: 0, investimentos: 0, entradas: 0 },
  { month: 'Jul', gastos: 0, investimentos: 0, entradas: 0 },
  { month: 'Ago', gastos: 0, investimentos: 0, entradas: 0 },
  { month: 'Set', gastos: 0, investimentos: 0, entradas: 0 },
];


