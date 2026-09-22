import React, { useState } from 'react';
import { X, Plus, Calendar, Clock, Coffee, Utensils, Bus, Tag, Cookie, ShoppingBag, Sparkles } from 'lucide-react';
import { Member, Transaction, CategoryType, TransactionType } from '../types';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onToast: (msg: string) => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  members,
  onAddTransaction,
  onToast,
}) => {
  if (!isOpen) return null;

  const [memberId, setMemberId] = useState<string>(members[0]?.id || 'gautam');
  const [type, setType] = useState<TransactionType>('Debit');
  const [category, setCategory] = useState<CategoryType>('Tea');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('05:00 PM');
  const [description, setDescription] = useState<string>('');

  const categories: { name: CategoryType; icon: React.FC<{ className?: string }> }[] = [
    { name: 'Tea', icon: Coffee },
    { name: 'Food', icon: Utensils },
    { name: 'Travel', icon: Bus },
    { name: 'Snacks', icon: Cookie },
    { name: 'Gift', icon: Tag },
    { name: 'Shopping', icon: ShoppingBag },
    { name: 'Other', icon: Sparkles },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      onToast('Please enter a valid amount');
      return;
    }

    const member = members.find((m) => m.id === memberId);
    const memberName = member ? member.name : 'Unknown';

    onAddTransaction({
      memberId,
      memberName,
      type,
      category,
      date,
      time,
      amount: num,
      description: description.trim() || undefined,
    });

    onToast(`Added ₹${num} ${category} for ${memberName}`);
    onClose();
  };

  return (
    <div
      id="new-transaction-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="w-full max-w-[400px] bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#eef0fc] text-[#5c54db] flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-800">New Transaction</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-4 space-y-4">
          {/* Member & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Member
              </label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full bg-[#fbfcfe] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#5c54db]"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Entry Type
              </label>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setType('Debit')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    type === 'Debit'
                      ? 'bg-[#e11d48] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Debit
                </button>
                <button
                  type="button"
                  onClick={() => setType('Credit')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    type === 'Credit'
                      ? 'bg-[#0fa958] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Credit
                </button>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Amount (₹)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400 font-bold text-lg">₹</span>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="w-full bg-[#fbfcfe] border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-lg font-bold text-slate-900 focus:outline-none focus:border-[#5c54db]"
              />
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {categories.map((cat) => {
                const isSelected = category === cat.name;
                const IconC = cat.icon;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`py-2 px-1 rounded-xl text-center flex flex-col items-center space-y-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#5c54db] bg-[#eef0fc] text-[#5c54db]'
                        : 'border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <IconC className="w-4 h-4" />
                    <span className="text-[10.5px] font-bold leading-none">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Date
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#fbfcfe] border border-slate-200 rounded-xl pl-8 pr-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#5c54db]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Time
              </label>
              <div className="relative flex items-center">
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={time}
                  placeholder="05:00 PM"
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[#fbfcfe] border border-slate-200 rounded-xl pl-8 pr-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#5c54db]"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Note / Description
            </label>
            <input
              type="text"
              placeholder="e.g. Chai for team, lunch split..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#fbfcfe] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#5c54db]"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#5448d8] text-white font-bold text-xs hover:bg-[#4338ca] transition-colors shadow-sm cursor-pointer"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
