import React, { useState, useEffect } from 'react';
import { X, Edit2, Calendar, Clock } from 'lucide-react';
import { Transaction, Member, CategoryType, TransactionType } from '../types';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  members: Member[];
  onUpdateTransaction: (updated: Transaction) => void;
  onToast: (msg: string) => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  members,
  onUpdateTransaction,
  onToast,
}) => {
  if (!isOpen || !transaction) return null;

  const [memberId, setMemberId] = useState<string>(transaction.memberId);
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [category, setCategory] = useState<CategoryType>(transaction.category);
  const [amount, setAmount] = useState<string>(transaction.amount.toString());
  const [date, setDate] = useState<string>(transaction.date);
  const [time, setTime] = useState<string>(transaction.time);
  const [description, setDescription] = useState<string>(transaction.description || '');

  useEffect(() => {
    if (transaction) {
      setMemberId(transaction.memberId);
      setType(transaction.type);
      setCategory(transaction.category);
      setAmount(transaction.amount.toString());
      setDate(transaction.date);
      setTime(transaction.time);
      setDescription(transaction.description || '');
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      onToast('Please enter a valid amount');
      return;
    }

    const member = members.find((m) => m.id === memberId);
    const memberName = member ? member.name : transaction.memberName;

    onUpdateTransaction({
      ...transaction,
      memberId,
      memberName,
      type,
      category,
      amount: num,
      date,
      time,
      description: description.trim() || undefined,
    });

    onToast('Transaction updated successfully');
    onClose();
  };

  return (
    <div
      id="edit-transaction-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="w-full max-w-[400px] bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#eef0fc] text-[#5c54db] flex items-center justify-center">
              <Edit2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-800">Edit Transaction</h3>
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

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Amount (₹)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400 font-bold text-lg">₹</span>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-[#fbfcfe] border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-lg font-bold text-slate-900 focus:outline-none focus:border-[#5c54db]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full bg-[#fbfcfe] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#5c54db]"
              >
                <option value="Tea">Tea</option>
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Snacks">Snacks</option>
                <option value="Gift">Gift</option>
                <option value="Shopping">Shopping</option>
                <option value="Other">Other</option>
              </select>
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
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[#fbfcfe] border border-slate-200 rounded-xl pl-8 pr-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#5c54db]"
                />
              </div>
            </div>
          </div>

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
              Note
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#fbfcfe] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#5c54db]"
            />
          </div>

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
              style={{ backgroundColor: 'var(--color-primary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
              className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
