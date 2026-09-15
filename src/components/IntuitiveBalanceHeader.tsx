import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  TrendingDown,
  Plus
} from 'lucide-react';
import { MonthlySummary } from '../types';
import { formatCurrency } from '../utils/finance';

interface IntuitiveBalanceHeaderProps {
  summary: MonthlySummary;
  onNavigateToSection?: (section: 'receitas' | 'gastos' | 'extrato') => void;
  onOpenNewTransaction: (type?: 'income' | 'expense') => void;
}

export const IntuitiveBalanceHeader: React.FC<IntuitiveBalanceHeaderProps> = ({
  summary,
  onOpenNewTransaction,
}) => {
  const [showValues, setShowValues] = useState(true);
  const { totalIncome, totalExpense, balance, isRed } = summary;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5">
      
      {/* Top row: Total Disponível centralizado */}
      <div className="flex flex-col items-center justify-center text-center pb-4 border-b border-slate-100 space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-slate-500">
          <span className="text-xs sm:text-sm font-medium">
            Total disponível
          </span>
          <button
            onClick={() => setShowValues(!showValues)}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title={showValues ? 'Ocultar valores' : 'Mostrar valores'}
          >
            {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {showValues ? formatCurrency(balance) : '••••••'}
        </h1>
      </div>

      {/* Side-by-Side: Receita do lado esquerdo e Saída do outro lado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* LADO ESQUERDO: RECEITA */}
        <div 
          id="card-receitas-topo"
          className="relative bg-emerald-50/60 rounded-2xl p-4 sm:p-5 border border-emerald-200/90 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shadow-emerald-200">
                <TrendingUp className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                  Receita
                </span>
                <p className="text-[11px] text-emerald-700 font-medium">Entradas do mês</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenNewTransaction('income')}
              className="p-1.5 bg-white hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 shadow-2xs transition-colors"
              title="Adicionar Receita"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
              {showValues ? formatCurrency(totalIncome) : '••••••'}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-200/60 text-xs">
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Ganhos confirmados
              </span>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: SAÍDA */}
        <div 
          id="card-saidas-topo"
          className="relative bg-rose-50/60 rounded-2xl p-4 sm:p-5 border border-rose-200/90 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shadow-rose-200">
                <TrendingDown className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-900">
                  Saída
                </span>
                <p className="text-[11px] text-rose-700 font-medium">Despesas do mês</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenNewTransaction('expense')}
              className="p-1.5 bg-white hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 shadow-2xs transition-colors"
              title="Adicionar Despesa"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-rose-950 tracking-tight">
              {showValues ? formatCurrency(totalExpense) : '••••••'}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-rose-200/60 text-xs">
              <span className="text-rose-700 font-semibold flex items-center gap-1">
                <ArrowDownRight className="w-3.5 h-3.5" />
                Total comprometido
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
