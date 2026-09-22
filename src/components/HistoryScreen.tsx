import React, { useState, useMemo } from 'react';
import {
  History,
  Trash2,
  RotateCcw,
  Calendar,
  CheckSquare,
  Square,
  MinusSquare,
  Edit2,
  Coffee,
  Utensils,
  Bus,
  Tag,
  Cookie,
  ShoppingBag,
  Sparkles,
  ChevronDown,
  Lock,
  Shield,
} from 'lucide-react';
import { Transaction, Member } from '../types';

interface HistoryScreenProps {
  currentUser?: Member | null;
  transactions: Transaction[];
  members: Member[];
  onDeleteTransaction: (id: string) => void;
  onDeleteMultipleTransactions: (ids: string[]) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onToast: (msg: string) => void;
  initialMemberFilter?: string;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  currentUser,
  transactions,
  members,
  onDeleteTransaction,
  onDeleteMultipleTransactions,
  onEditTransaction,
  onToast,
  initialMemberFilter = 'all',
}) => {
  const [selectedPerson, setSelectedPerson] = useState<string>(initialMemberFilter);
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-14');
  // Default stature: no items selected initially
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Get current date in ISO format YYYY-MM-DD
  const getCurrentDateIso = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Normalize date helper (handles DD-MM-YYYY and YYYY-MM-DD)
  const normalizeDateToIso = (dateStr: string) => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Format date helper
  const formatDateDisplay = (isoDate: string) => {
    // converts YYYY-MM-DD to DD-MM-YYYY
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return isoDate;
    }
    return isoDate;
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchPerson =
        selectedPerson === 'all' ||
        tx.memberId.toLowerCase() === selectedPerson.toLowerCase() ||
        tx.memberName.toLowerCase() === selectedPerson.toLowerCase();

      const txDateNorm = normalizeDateToIso(tx.date);
      const selDateNorm = normalizeDateToIso(selectedDate);
      const matchDate = !selectedDate || txDateNorm === selDateNorm || tx.date === selectedDate;

      return matchPerson && matchDate;
    });
  }, [transactions, selectedPerson, selectedDate]);

  // Role Privilege Check:
  // Banker & Admin: can edit & delete ANY transaction.
  // User: can ONLY edit & delete transactions they made.
  const canModifyTransaction = (tx: Transaction) => {
    if (!currentUser) return true;
    if (currentUser.role === 'Admin' || currentUser.role === 'Banker') return true;
    return (
      tx.memberId === currentUser.id ||
      tx.memberName.toLowerCase() === currentUser.name.toLowerCase()
    );
  };

  // Category Icon & styling mapper
  const getCategoryMeta = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'tea':
        return {
          icon: Coffee,
          bg: 'bg-[#fef3c7]',
          text: 'text-[#b45309]',
          label: 'Tea',
        };
      case 'snacks':
        return {
          icon: Cookie,
          bg: 'bg-[#ffedd5]',
          text: 'text-[#ea580c]',
          label: 'Snacks',
        };
      case 'food':
        return {
          icon: Utensils,
          bg: 'bg-[#dcfce7]',
          text: 'text-[#16a34a]',
          label: 'Food',
        };
      case 'travel':
        return {
          icon: Bus,
          bg: 'bg-[#e0e7ff]',
          text: 'text-[#4338ca]',
          label: 'Travel',
        };
      case 'gift':
        return {
          icon: Tag,
          bg: 'bg-[#f1f5f9]',
          text: 'text-[#475569]',
          label: 'Gift',
        };
      case 'shopping':
        return {
          icon: ShoppingBag,
          bg: 'bg-[#fae8ff]',
          text: 'text-[#a21caf]',
          label: 'Shopping',
        };
      default:
        return {
          icon: Sparkles,
          bg: 'bg-[#f1f5f9]',
          text: 'text-[#64748b]',
          label: cat,
        };
    }
  };

  // Selection toggle
  const toggleSelect = (id: string) => {
    const targetTx = transactions.find((t) => t.id === id);
    if (targetTx && !canModifyTransaction(targetTx)) {
      onToast('Users can only delete transactions they made');
      return;
    }
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const selectableFiltered = filteredTransactions.filter((t) => canModifyTransaction(t));
    const selectableFilteredIds = selectableFiltered.map((t) => t.id);

    if (selectableFilteredIds.length === 0) {
      onToast('No transactions you made are available to select in this view');
      return;
    }

    const areAllSelected = selectableFilteredIds.every((id) => selectedIds.includes(id));

    if (areAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !selectableFilteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...selectableFilteredIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    onDeleteMultipleTransactions(selectedIds);
    setSelectedIds([]);
    onToast(`Deleted ${count} transaction${count > 1 ? 's' : ''}`);
  };

  const handleToggleBulkMode = () => {
    if (filteredTransactions.length === 0) {
      onToast('No transactions to select');
      return;
    }
    const selectableFiltered = filteredTransactions.filter((t) => canModifyTransaction(t));
    const allFilteredIds = selectableFiltered.map((t) => t.id);
    if (allFilteredIds.length === 0) {
      onToast('You can only bulk-delete transactions created by you');
      return;
    }
    setSelectedIds(allFilteredIds);
    onToast(`Selected ${allFilteredIds.length} transaction${allFilteredIds.length > 1 ? 's' : ''}`);
  };

  const handleResetFilters = () => {
    const today = getCurrentDateIso();
    setSelectedPerson('all');
    setSelectedDate(today);
    onToast('Reset filters: date set to today');
  };

  const isAllFilteredSelected =
    filteredTransactions.length > 0 &&
    filteredTransactions.every((tx) => selectedIds.includes(tx.id));

  const isSomeFilteredSelected =
    filteredTransactions.some((tx) => selectedIds.includes(tx.id)) && !isAllFilteredSelected;

  return (
    <div className="px-3.5 pt-3.5 pb-24 space-y-3 flex-1">
      {/* Top Card: Title & Bulk Delete Trigger */}
      <section className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] border border-slate-100/80 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-[#5c54db]" />
            <h2 className="font-bold text-[13.5px] text-slate-800">
              Transaction History
            </h2>
          </div>

          <button
            id="btn-delete-bulk-header"
            type="button"
            onClick={selectedIds.length > 0 ? handleDeleteSelected : handleToggleBulkMode}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-xs transition-all cursor-pointer active:scale-95 ${
              selectedIds.length > 0
                ? 'bg-[#e11d48] text-white hover:bg-[#be123c]'
                : 'bg-rose-50 text-[#e11d48] border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <Trash2 className="w-3 h-3" />
            <span>
              {selectedIds.length > 0
                ? `Delete Selected (${selectedIds.length})`
                : 'Delete Bulk'}
            </span>
          </button>
        </div>

        {/* Filter Bar: Person, Date, Reset */}
        <div className="grid grid-cols-12 gap-2 pt-1">
          {/* Person Filter */}
          <div className="col-span-5 flex flex-col space-y-1">
            <label
              htmlFor="filter-person-select"
              className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider"
            >
              Person
            </label>
            <div className="relative flex items-center">
              <select
                id="filter-person-select"
                aria-label="Filter by person"
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200/90 rounded-lg pl-2.5 pr-6 py-1.5 text-[11.5px] font-medium text-slate-700 shadow-2xs focus:outline-none focus:border-[#5c54db] cursor-pointer truncate"
              >
                <option value="all">All</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
            </div>
          </div>

          {/* Date Picker */}
          <div className="col-span-4 flex flex-col space-y-1">
            <label
              htmlFor="filter-date-input"
              className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider"
            >
              Date
            </label>
            <div className="relative flex items-center">
              <input
                id="filter-date-input"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white border border-slate-200/90 rounded-lg pl-2 pr-1.5 py-1 text-[11px] font-medium text-slate-700 shadow-2xs focus:outline-none focus:border-[#5c54db] cursor-pointer"
              />
            </div>
          </div>

          {/* Reset Button */}
          <div className="col-span-3 flex flex-col justify-end">
            <button
              id="btn-reset-filters"
              type="button"
              onClick={handleResetFilters}
              className="flex items-center justify-center space-x-1 border border-slate-200/90 bg-white rounded-lg py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Regular User Privilege notice */}
        {currentUser?.role === 'User' && (
          <div className="p-2 bg-emerald-50/70 border border-emerald-200/70 rounded-xl flex items-center space-x-2 text-[11px] text-emerald-900">
            <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="leading-tight">
              <strong>User Privilege:</strong> You can edit and delete only transactions you made ({currentUser.name}).
            </span>
          </div>
        )}

        {/* Multi-Selection Control Bar */}
        {selectedIds.length > 0 && (
          <div
            id="batch-action-bar"
            className="bg-[#fff1f2] border border-rose-200/70 rounded-xl p-2.5 flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[#e11d48] cursor-pointer"
                title={isAllFilteredSelected ? 'Deselect all' : 'Select all'}
              >
                {isAllFilteredSelected ? (
                  <CheckSquare className="w-4 h-4 fill-[#e11d48] text-white" />
                ) : isSomeFilteredSelected ? (
                  <MinusSquare className="w-4 h-4 text-[#e11d48]" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
              </button>
              <span className="text-[11.5px] font-bold text-slate-800">Select All</span>
              <span className="bg-rose-100 text-[#e11d48] text-[10px] font-bold px-2 py-0.5 rounded-full">
                {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                id="btn-bulk-delete"
                type="button"
                onClick={handleDeleteSelected}
                className="flex items-center space-x-1 bg-[#e11d48] text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-2xs hover:bg-[#be123c] transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete ({selectedIds.length})</span>
              </button>
              <button
                id="btn-cancel-selection"
                type="button"
                onClick={handleClearSelection}
                className="bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg text-[11px] font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="space-y-2.5 pt-1">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <History className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-xs font-medium">No transactions found for the selected filter.</p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-[#5c54db] underline cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isSelected = selectedIds.includes(tx.id);
              const meta = getCategoryMeta(tx.category);
              const IconComponent = meta.icon;
              const isDebit = tx.type === 'Debit';
              const canModify = canModifyTransaction(tx);

              return (
                <div
                  key={tx.id}
                  id={`transaction-item-${tx.id}`}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-rose-300 bg-[#fffbfc] shadow-xs'
                      : 'border-slate-100 bg-[#fdfdfd] hover:border-slate-200'
                  }`}
                >
                  {/* Left section: Checkbox + Icon + Details */}
                  <div className="flex items-center space-x-2.5 min-w-0">
                    {/* Checkbox */}
                    <button
                      type="button"
                      disabled={!canModify}
                      onClick={() => toggleSelect(tx.id)}
                      className={`p-0.5 ${
                        canModify
                          ? 'cursor-pointer'
                          : 'cursor-not-allowed opacity-35'
                      }`}
                      title={
                        canModify
                          ? isSelected
                            ? 'Deselect'
                            : 'Select'
                          : `Created by ${tx.memberName} — only creator, Banker or Admin can delete`
                      }
                    >
                      {isSelected ? (
                        <div className="w-4 h-4 rounded bg-[#e11d48] text-white flex items-center justify-center text-[10px]">
                          ✓
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded border border-slate-300 bg-white" />
                      )}
                    </button>

                    {/* Category Icon Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl ${meta.bg} ${meta.text} flex items-center justify-center shrink-0 shadow-2xs`}
                    >
                      <IconComponent className="w-4 h-4 stroke-[2]" />
                    </div>

                    {/* Member & Category Details */}
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-[13px] text-slate-800 truncate">
                          {tx.memberName}
                        </span>
                        <span
                          className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md ${
                            isDebit
                              ? 'bg-[#ffe4e6] text-[#e11d48]'
                              : 'bg-[#dcfce7] text-[#15803d]'
                          }`}
                        >
                          {tx.type}
                        </span>
                        <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                          <span>•</span>
                          <span>{tx.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mt-0.5">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>{formatDateDisplay(tx.date)}</span>
                        <span>•</span>
                        <span>{tx.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right section: Amount & Actions */}
                  <div className="flex items-center space-x-2 shrink-0 pl-2">
                    <span
                      className={`font-mono text-[13.5px] font-bold ${
                        isDebit ? 'text-[#e11d48]' : 'text-[#0fa958]'
                      }`}
                    >
                      {isDebit ? `-₹${tx.amount}` : `+₹${tx.amount}`}
                    </span>

                    {canModify ? (
                      <>
                        {/* Edit Button */}
                        <button
                          type="button"
                          aria-label="Edit transaction"
                          onClick={() => onEditTransaction(tx)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          aria-label="Delete transaction"
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#e11d48] flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div
                        className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-100/90 text-slate-400 text-[10px] select-none"
                        title={`Created by ${tx.memberName} — Read only for current user`}
                      >
                        <Lock className="w-2.5 h-2.5 text-slate-400" />
                        <span className="text-[9px] font-semibold text-slate-400">Locked</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
