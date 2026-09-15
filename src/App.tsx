import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { TransactionsList } from './components/TransactionsList';
import { BankSyncModal } from './components/BankSyncModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { GeminiChatDrawer } from './components/GeminiChatDrawer';
import { TransactionModal } from './components/TransactionModal';
import { NotificationsDrawer, SmartNotification } from './components/NotificationsDrawer';
import { SpreadsheetPlanner } from './components/SpreadsheetPlanner';
import { IntuitiveBalanceHeader } from './components/IntuitiveBalanceHeader';
import { CardInvoiceConnectionModal } from './components/CardInvoiceConnectionModal';
import { 
  Transaction, 
  BankAccount, 
  SavingGoal, 
  BillReminder, 
  TransactionType 
} from './types';
import { 
  initialTransactions, 
  initialBankAccounts, 
  initialSavingGoals, 
  initialBillReminders,
  emptySpreadsheetEnvelopes
} from './data/mockData';
import { 
  calculateSummary, 
  formatCurrency,
  isTransactionPending
} from './utils/finance';
import { 
  Bot, 
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar
} from 'lucide-react';

const CLEAN_SLATE_VERSION = 'v11_zerado_total_limpo';

const emptyBankAccounts: BankAccount[] = [
  {
    id: 'card-1',
    name: 'Cartão de Crédito Nubank',
    institution: 'Nubank',
    type: 'credit_card',
    balance: 0,
    availableLimit: 5000,
    lastSync: 'Aguardando sincronização',
    color: '#820ad1',
    status: 'connected',
    accountNumber: 'Final 8421',
  },
  {
    id: 'bank-1',
    name: 'Conta Corrente Principal',
    institution: 'Nubank',
    type: 'checking',
    balance: 0,
    lastSync: 'Sincronizado',
    color: '#820ad1',
    status: 'connected',
    accountNumber: 'Conta 0001',
  },
];

export type AppSection = 
  | 'inicio' 
  | 'receitas' 
  | 'gastos' 
  | 'fatura' 
  | 'planejamento' 
  | 'extrato' 
  | 'relatorios';

export default function App() {
  // Navigation section state
  const [currentSection, setCurrentSection] = useState<AppSection>('inicio');

  // Month navigation: starts on 'Setembro 2026' (current month of user's spreadsheet)
  const [currentMonthIndex, setCurrentMonthIndex] = useState(1);
  const months = ['Agosto 2026', 'Setembro 2026', 'Outubro 2026'];
  const currentMonth = months[currentMonthIndex];

  // Transactions local persistence - initialized zeroed out as requested
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const isSynced = localStorage.getItem('finansmart_clean_v11_synced');
      if (isSynced !== CLEAN_SLATE_VERSION) {
        localStorage.setItem('finansmart_clean_v11_synced', CLEAN_SLATE_VERSION);
        localStorage.setItem('finansmart_transactions', JSON.stringify([]));
        localStorage.setItem('finansmart_bank_accounts', JSON.stringify(emptyBankAccounts));
        localStorage.setItem('finansmart_saving_goals', JSON.stringify([]));
        localStorage.setItem('finansmart_bill_reminders', JSON.stringify([]));
        localStorage.setItem('finansmart_sheet_envelopes_v11', JSON.stringify(emptySpreadsheetEnvelopes));
        localStorage.removeItem('finansmart_clean_v9_synced');
        localStorage.removeItem('finansmart_clean_v7_synced');
        localStorage.removeItem('finansmart_clean_v8_synced');
        localStorage.removeItem('finansmart_sheet_envelopes_v9');
        localStorage.removeItem('finansmart_sheet_envelopes_v8');
        return [];
      }
      const saved = localStorage.getItem('finansmart_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    try {
      const isSynced = localStorage.getItem('finansmart_clean_v11_synced');
      if (isSynced !== CLEAN_SLATE_VERSION) return emptyBankAccounts;
      const saved = localStorage.getItem('finansmart_bank_accounts');
      return saved ? JSON.parse(saved) : emptyBankAccounts;
    } catch {
      return emptyBankAccounts;
    }
  });

  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>(() => {
    try {
      const isSynced = localStorage.getItem('finansmart_clean_v11_synced');
      if (isSynced !== CLEAN_SLATE_VERSION) return [];
      const saved = localStorage.getItem('finansmart_saving_goals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [billReminders, setBillReminders] = useState<BillReminder[]>(() => {
    try {
      const isSynced = localStorage.getItem('finansmart_clean_v11_synced');
      if (isSynced !== CLEAN_SLATE_VERSION) return [];
      const saved = localStorage.getItem('finansmart_bill_reminders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('finansmart_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finansmart_bank_accounts', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem('finansmart_saving_goals', JSON.stringify(savingGoals));
  }, [savingGoals]);

  useEffect(() => {
    localStorage.setItem('finansmart_bill_reminders', JSON.stringify(billReminders));
  }, [billReminders]);

  // Notifications State - initialized clean
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);

  // Modal dialog states
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionModalDefaultType, setTransactionModalDefaultType] = useState<TransactionType>('expense');
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
  const [isBankSyncOpen, setIsBankSyncOpen] = useState(false);
  const [isCardConnectionOpen, setIsCardConnectionOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [customAIChatPrompt, setCustomAIChatPrompt] = useState<string | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);

  // Transactions filter on extrato view
  const [activeFilter, setActiveFilter] = useState<'all' | TransactionType>('all');

  // Compute live summary metrics
  const summary = useMemo(() => {
    return calculateSummary(transactions);
  }, [transactions]);

  // Compute main credit card invoice amount
  const mainCreditCard = bankAccounts.find((acc) => acc.type === 'credit_card');
  const cardExpenseTxs = transactions.filter(
    (t) => t.type === 'expense' && (
      t.bankName?.toLowerCase().includes('cartão') ||
      t.bankName?.toLowerCase().includes('nubank') ||
      t.category === 'Cartão de Crédito'
    )
  );
  const mainCardInvoiceAmount = (mainCreditCard && mainCreditCard.balance > 0)
    ? mainCreditCard.balance
    : cardExpenseTxs.reduce((acc, t) => acc + t.amount, 0);

  // Clear all data to start completely fresh and test
  const handleClearAllData = () => {
    setTransactions([]);
    setBankAccounts(emptyBankAccounts);
    setSavingGoals([]);
    setBillReminders([]);
    localStorage.setItem('finansmart_clean_v11_synced', CLEAN_SLATE_VERSION);
    localStorage.setItem('finansmart_transactions', JSON.stringify([]));
    localStorage.setItem('finansmart_bank_accounts', JSON.stringify(emptyBankAccounts));
    localStorage.setItem('finansmart_saving_goals', JSON.stringify([]));
    localStorage.setItem('finansmart_bill_reminders', JSON.stringify([]));
    localStorage.setItem('finansmart_sheet_envelopes_v11', JSON.stringify(emptySpreadsheetEnvelopes));
    localStorage.removeItem('finansmart_clean_v9_synced');
    localStorage.removeItem('finansmart_clean_v7_synced');
    localStorage.removeItem('finansmart_clean_v8_synced');
    localStorage.removeItem('finansmart_sheet_envelopes_v9');
    localStorage.removeItem('finansmart_sheet_envelopes_v8');

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'alert',
        title: 'Tudo Zerado',
        message: 'Todas as entradas, saídas, movimentações e planejamento foram 100% zerados!',
        time: 'Agora',
        unread: true,
      },
      ...prev,
    ]);
  };

  const handlePayInvoice = (cardId: string, amount: number) => {
    if (amount <= 0) return;
    setBankAccounts((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, balance: 0, availableLimit: (c.availableLimit || 0) + amount } : c))
    );
    handleAddTransaction({
      description: 'Pagamento Fatura do Cartão',
      amount,
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      category: 'Cartão de Crédito',
      source: 'manual',
      isPaid: true,
    });
  };

  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'sync',
        title: 'Movimentação Registrada',
        message: `${newTx.description} (${formatCurrency(newTx.amount)}) adicionada com sucesso.`,
        time: 'Agora',
        unread: true,
      },
      ...prev,
    ]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleTransactionPaid = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const currentlyPending = isTransactionPending(t);
          return {
            ...t,
            isPaid: currentlyPending ? true : false,
          };
        }
        return t;
      })
    );
  };

  const handlePayBill = (billId: string) => {
    const bill = billReminders.find((b) => b.id === billId);
    if (!bill) return;

    if (!bill.isPaid) {
      setBillReminders((prev) =>
        prev.map((b) => (b.id === billId ? { ...b, isPaid: true } : b))
      );

      handleAddTransaction({
        description: `Pagamento: ${bill.title}`,
        amount: bill.amount,
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category: bill.category || 'Contas Fixas',
        source: 'manual',
        isPaid: true,
      });
    } else {
      setBillReminders((prev) =>
        prev.map((b) => (b.id === billId ? { ...b, isPaid: false } : b))
      );
    }
  };

  const handleAddDepositToGoal = (goalId: string, amount: number) => {
    setSavingGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
      )
    );

    const goal = savingGoals.find((g) => g.id === goalId);
    handleAddTransaction({
      description: `Aporte Meta: ${goal?.title || 'Poupança'}`,
      amount,
      date: new Date().toISOString().split('T')[0],
      type: 'investment',
      category: 'Reserva de Emergência',
      source: 'manual',
      isPaid: true,
    });
  };

  const handleAddNewBill = (newBill: BillReminder) => {
    setBillReminders((prev) => [newBill, ...prev]);
  };

  const handleAddNewGoal = (newGoal: SavingGoal) => {
    setSavingGoals((prev) => [newGoal, ...prev]);
  };

  const handleOpenAIChatWithPrompt = (prompt?: string) => {
    setCustomAIChatPrompt(prompt);
    setIsAIChatOpen(true);
  };

  const handleChangeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : months.length - 1));
    } else {
      setCurrentMonthIndex((prev) => (prev < months.length - 1 ? prev + 1 : 0));
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Header */}
      <Header
        onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        onNavigateHome={() => setCurrentSection('inicio')}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        
        {/* Top Reference Month Bar (Centered) */}
        <div className="flex items-center justify-center pb-2 border-b border-slate-200">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <button
              onClick={() => handleChangeMonth('prev')}
              className="p-1 text-slate-500 hover:text-slate-900 rounded-lg transition-colors"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-3.5 text-xs sm:text-sm font-bold text-slate-800">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{currentMonth}</span>
            </div>
            <button
              onClick={() => handleChangeMonth('next')}
              className="p-1 text-slate-500 hover:text-slate-900 rounded-lg transition-colors"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TELA PRINCIPAL MINIMALISTA: SALDO + PLANEJAMENTO PARA INVESTIR + EXTRATO */}
        {/* ========================================================================= */}
        <div className="space-y-6 animate-fadeIn">
          
          {/* 1. LÁ EM CIMA: Minimalist Total Disponível com Receita e Saída */}
          <IntuitiveBalanceHeader
            summary={summary}
            onNavigateToSection={() => {}}
            onOpenNewTransaction={(type) => {
              if (type) setTransactionModalDefaultType(type);
              setIsTransactionModalOpen(true);
            }}
          />

          {/* 2. PLANEJAMENTO PARA INVESTIR & ALOCAÇÃO DE ENVELOPES */}
          <SpreadsheetPlanner
            transactions={transactions}
            onAskAiTips={(prompt) => handleOpenAIChatWithPrompt(prompt)}
            onOpenNewTransaction={(type) => {
              if (type) setTransactionModalDefaultType(type);
              setIsTransactionModalOpen(true);
            }}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onToggleTransactionPaid={handleToggleTransactionPaid}
            onResetAllData={handleClearAllData}
          />

          {/* 3. EXTRATO DE MOVIMENTAÇÕES (se houver transações) */}
          {transactions.length > 0 && (
            <TransactionsList
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
              onToggleTransactionPaid={handleToggleTransactionPaid}
              activeFilter={activeFilter}
              onChangeFilter={setActiveFilter}
            />
          )}

        </div>

      </main>

      {/* Floating Action Button for Gemini AI Assistant */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          id="fab-ai-assistant"
          onClick={() => handleOpenAIChatWithPrompt()}
          className="flex items-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/30 hover:scale-102 active:scale-98 transition-all text-xs sm:text-sm"
          title="Falar com Assistente Financeiro IA"
        >
          <Bot className="w-5 h-5" />
          <span>Assistente IA</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* MODALS AND DRAWERS */}
      
      {/* 1. Transaction Modal (Add Income, Expense or Investment) */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        defaultType={transactionModalDefaultType}
      />

      {/* 2. Card Invoice Connection Modal */}
      <CardInvoiceConnectionModal
        isOpen={isCardConnectionOpen}
        onClose={() => setIsCardConnectionOpen(false)}
        cards={bankAccounts}
        onAddCardInvoice={(newCard) => {
          setBankAccounts((prev) => [newCard, ...prev]);
        }}
        onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
      />

      {/* 3. Receipt Scanner Modal */}
      <ReceiptScannerModal
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      {/* 3. Bank & Credit Card Sync Modal */}
      <BankSyncModal
        isOpen={isBankSyncOpen}
        onClose={() => setIsBankSyncOpen(false)}
        accounts={bankAccounts}
        onSyncAll={async () => {
          setIsSyncing(true);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          setIsSyncing(false);
        }}
        onAddAccount={(newAcc) => setBankAccounts((prev) => [...prev, newAcc])}
      />

      {/* 4. Gemini AI Chat Drawer */}
      <GeminiChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => {
          setIsAIChatOpen(false);
          setCustomAIChatPrompt(undefined);
        }}
        summary={summary}
        initialCustomPrompt={customAIChatPrompt}
      />

      {/* 5. Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
        }}
        onOpenAIChat={handleOpenAIChatWithPrompt}
      />

    </div>
  );
}
