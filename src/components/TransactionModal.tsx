import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, PiggyBank, Calendar, Tag, Building2, AlignLeft } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { getTodayDateString } from '../utils/finance';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  defaultType?: TransactionType;
}

const COMMON_EXPENSE_SUGGESTIONS = [
  'Alimentação',
  'Aluguel',
  'Cartão de Crédito',
  'Transporte',
  'Internet',
  'Telefone',
  'Saúde',
  'Lazer',
  'Educação',
  'Outro',
];

const COMMON_INVESTMENT_SUGGESTIONS = [
  'Reserva de Emergência',
  'Tesouro Selic',
  'CDB 100% CDI',
  'Ações / FIIs',
  'Caixinha Nubank',
  'Criptomoeda',
  'Previdência Privada',
  'Outro',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  defaultType = 'expense',
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [bankName, setBankName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setDescription('');
      setAmount('');
      setCategory('');
      setBankName('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [defaultType, isOpen]);

  if (!isOpen) return null;

  const currentSuggestions = 
    type === 'income' 
      ? [] 
      : type === 'investment' 
      ? COMMON_INVESTMENT_SUGGESTIONS 
      : COMMON_EXPENSE_SUGGESTIONS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const defaultCat = 
      type === 'income' 
        ? 'Salário' 
        : type === 'investment' 
        ? 'Investimento' 
        : 'Geral';
    const finalCategory = category.trim() || defaultCat;
    const finalDescription = description.trim() || finalCategory;
    const finalBank = bankName.trim() || 'Conta Principal';

    const today = getTodayDateString();
    const finalDate = date || today;
    const isFutureDate = finalDate > today;

    onAddTransaction({
      description: finalDescription,
      amount: parsedAmount,
      date: finalDate,
      type,
      category: finalCategory,
      source: 'manual',
      bankName: finalBank,
      isPaid: !isFutureDate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="transaction-modal"
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              {type === 'income' 
                ? 'Nova Entrada (Receita)' 
                : type === 'investment'
                ? 'Novo Investimento (Aporte)'
                : 'Novo Gasto (Despesa)'}
            </h3>
            <p className="text-xs text-slate-500">
              {type === 'income' 
                ? 'Adicione seu salário, comissão, freelance ou qualquer ganho' 
                : type === 'investment'
                ? 'Registre aportes para Reserva de Emergência, Ações, Renda Fixa ou Metas'
                : 'Registre seus gastos e escolha ou digite a categoria que quiser'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          
          {/* Type Selector Tabs (Entrada, Despesa, Investimento) */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/70">
            <button
              type="button"
              id="type-tab-income"
              onClick={() => {
                setType('income');
                setCategory('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Entrada</span>
            </button>

            <button
              type="button"
              id="type-tab-expense"
              onClick={() => {
                setType('expense');
                setCategory('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Despesa</span>
            </button>

            <button
              type="button"
              id="type-tab-investment"
              onClick={() => {
                setType('investment');
                setCategory('Investimento');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'investment'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PiggyBank className="w-3.5 h-3.5" />
              <span>Investir</span>
            </button>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-base font-bold p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
              Descrição
            </label>
            <input
              type="text"
              placeholder={
                type === 'income' 
                  ? 'Ex: Salário Empresa, Bônus, Freelance...' 
                  : type === 'investment'
                  ? 'Ex: Reserva de Emergência, Tesouro Direto, Ações...'
                  : 'Ex: Mercado Pão de Açúcar, Aluguel, Luz...'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Custom Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Categoria
              </span>
            </label>
            <input
              type="text"
              placeholder={
                type === 'income' 
                  ? 'Digite a categoria (ex: Salário, Comissão, Freelance...)' 
                  : type === 'investment'
                  ? 'Ex: Reserva, Renda Fixa, Bolsa de Valores...'
                  : 'Ex: Alimentação, Moradia, Transporte...'
              }
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-900 ${
                currentSuggestions.length > 0 ? 'mb-2' : ''
              }`}
            />
            {/* Quick chips suggestions (shown only if available, e.g. for despesas/investimentos) */}
            {currentSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {currentSuggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setCategory(sug)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                      category === sug 
                        ? 'bg-slate-900 text-white border-slate-900 font-bold' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Bank / Account - User types anything */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Conta / Banco
              </span>
            </label>
            <input
              type="text"
              placeholder="Digite o banco ou conta (ex: Nubank, Itaú, Bradesco, Dinheiro...)"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-submit-new-transaction"
              className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : type === 'investment'
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {type === 'income' 
                ? 'Confirmar Entrada' 
                : type === 'investment' 
                ? 'Confirmar Investimento' 
                : 'Confirmar Despesa'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
