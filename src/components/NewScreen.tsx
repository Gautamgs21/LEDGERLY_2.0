import React, { useState } from 'react';
import {
  PenLine,
  Layers,
  User,
  GitFork,
  Calendar,
  Calculator,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { Member, Transaction, CategoryType, TransactionType } from '../types';

interface NewScreenProps {
  members: Member[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onAddBulkTransactions?: (txs: Omit<Transaction, 'id'>[]) => void;
  onToast: (message: string) => void;
}

type EntryMode = 'bulk' | 'single' | 'split';

interface BulkMemberState {
  memberId: string;
  selected: boolean;
  type: TransactionType;
  amount: number;
  category: string;
}

export const NewScreen: React.FC<NewScreenProps> = ({
  members,
  onAddTransaction,
  onAddBulkTransactions,
  onToast,
}) => {
  const [mode, setMode] = useState<EntryMode>('bulk');

  const [date, setDate] = useState<string>('15-09-2026');
  const [notes, setNotes] = useState<string>('');

  // Bulk Entry State
  const [bulkStates, setBulkStates] = useState<Record<string, BulkMemberState>>(() => {
    const initial: Record<string, BulkMemberState> = {};
    members.forEach((m) => {
      initial[m.id] = {
        memberId: m.id,
        selected: true,
        type: 'Debit',
        amount: 0,
        category: 'Tea',
      };
    });
    return initial;
  });

  // Single Entry State
  const [singleMemberId, setSingleMemberId] = useState<string>(members[0]?.id || '');
  const [singleType, setSingleType] = useState<TransactionType>('Debit');
  const [singleAmount, setSingleAmount] = useState<string>('');
  const [singleCategory, setSingleCategory] = useState<string>('Tea');

  // Split Wise State
  const [splitTotal, setSplitTotal] = useState<number>(300);
  const [splitPayerId, setSplitPayerId] = useState<string>(members[0]?.id || '');
  const [splitCategory, setSplitCategory] = useState<CategoryType>('Food');
  const [splitSelected, setSplitSelected] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    members.forEach((m) => {
      map[m.id] = true;
    });
    return map;
  });

  // Avatar Initials Helper
  const getInitials = (name: string): string => {
    const map: Record<string, string> = {
      ananthan: 'AN',
      deepak: 'DP',
      gautam: 'GT',
      lekshmi: 'LK',
      sarath: 'SR',
      ratheesh: 'RT',
    };
    const key = name.toLowerCase().trim();
    if (map[key]) return map[key];
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Avatar Color Helper
  const getAvatarBadgeClass = (name: string) => {
    const key = name.toLowerCase().trim();
    switch (key) {
      case 'ananthan':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'deepak':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'gautam':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'lekshmi':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'sarath':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'ratheesh':
        return 'bg-teal-100 text-teal-700 border-teal-200';
      default:
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    }
  };

  // Bulk Calculations: Net difference of all Credit and Debit
  const bulkList = Object.values(bulkStates) as BulkMemberState[];
  const bulkSelectedCount = bulkList.filter((s) => s.selected).length;

  const bulkCreditTotal = bulkList.reduce((sum: number, s: BulkMemberState) => {
    return s.selected && s.type === 'Credit' ? sum + (Number(s.amount) || 0) : sum;
  }, 0);

  const bulkDebitTotal = bulkList.reduce((sum: number, s: BulkMemberState) => {
    return s.selected && s.type === 'Debit' ? sum + (Number(s.amount) || 0) : sum;
  }, 0);

  // Net difference of all Credit and Debit (Credit - Debit)
  const bulkNetDifference = bulkCreditTotal - bulkDebitTotal;
  const isNetPositive = bulkNetDifference > 0;
  const isNetNegative = bulkNetDifference < 0;

  const isAllBulkSelected = members.length > 0 && bulkSelectedCount === members.length;

  const handleToggleSelectAll = (checked: boolean) => {
    setBulkStates((prev) => {
      const updated = { ...prev };
      members.forEach((m) => {
        if (!updated[m.id]) {
          updated[m.id] = {
            memberId: m.id,
            selected: checked,
            type: 'Debit',
            amount: 0,
            category: 'Tea',
          };
        } else {
          updated[m.id] = { ...updated[m.id], selected: checked };
        }
      });
      return updated;
    });
  };

  const handleToggleAllType = (targetType: TransactionType) => {
    setBulkStates((prev) => {
      const updated = { ...prev };
      members.forEach((m) => {
        if (updated[m.id]) {
          updated[m.id] = { ...updated[m.id], type: targetType };
        }
      });
      return updated;
    });
  };

  const handleToggleMemberType = (memberId: string) => {
    setBulkStates((prev) => {
      const curr = prev[memberId]?.type || 'Debit';
      const nextType: TransactionType = curr === 'Debit' ? 'Credit' : 'Debit';
      return {
        ...prev,
        [memberId]: {
          ...(prev[memberId] || {
            memberId,
            selected: true,
            amount: 0,
            category: 'Tea',
          }),
          type: nextType,
        },
      };
    });
  };

  const handleApplyPresetToAll = (amountToAdd: number) => {
    setBulkStates((prev) => {
      const updated = { ...prev };
      members.forEach((m) => {
        const curr = updated[m.id]?.amount || 0;
        updated[m.id] = {
          ...(updated[m.id] || {
            memberId: m.id,
            selected: true,
            type: 'Debit',
            category: 'Tea',
          }),
          amount: curr + amountToAdd,
        };
      });
      return updated;
    });
  };

  const handleClearAllAmounts = () => {
    setBulkStates((prev) => {
      const updated = { ...prev };
      members.forEach((m) => {
        if (updated[m.id]) {
          updated[m.id] = { ...updated[m.id], amount: 0 };
        }
      });
      return updated;
    });
  };

  const handleBulkMemberChange = (
    memberId: string,
    updates: Partial<BulkMemberState>
  ) => {
    setBulkStates((prev) => {
      const existing = prev[memberId] || {
        memberId,
        selected: true,
        type: 'Debit',
        amount: 0,
        category: 'Tea',
      };
      return {
        ...prev,
        [memberId]: { ...existing, ...updates },
      };
    });
  };

  // Split Calculations
  const splitActiveCount = Object.values(splitSelected).filter(Boolean).length;
  const splitPerHead = splitActiveCount > 0 ? Math.round(splitTotal / splitActiveCount) : 0;
  const isAllSplitSelected = members.length > 0 && splitActiveCount === members.length;

  const handleToggleSplitSelectAll = (checked: boolean) => {
    setSplitSelected(() => {
      const updated: Record<string, boolean> = {};
      members.forEach((m) => {
        updated[m.id] = checked;
      });
      return updated;
    });
  };

  // Categories list
  const bulkCategories = [
    { key: 'Tea', label: '☕ Tea' },
    { key: 'Snacks', label: '🍿 Snacks' },
    { key: 'Food', label: '🍽️ Food' },
    { key: 'Travel', label: '🚌 Travel' },
    { key: 'Other', label: '📌 Other' },
  ];

  const singleCategories = [
    { key: 'Tea', label: '☕ Tea' },
    { key: 'Snacks', label: '🍿 Snacks' },
    { key: 'Food', label: '🍽️ Food' },
    { key: 'Travel', label: '🚌 Travel' },
    { key: 'Gift', label: '🎁 Gift' },
    { key: 'Other', label: '📌 Other' },
  ];

  // Submit Handler
  const handleSubmit = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (mode === 'bulk') {
      const activeEntries = members
        .filter((m) => bulkStates[m.id]?.selected)
        .map((m) => ({
          member: m,
          state: bulkStates[m.id],
        }))
        .filter((entry) => (entry.state?.amount || 0) > 0);

      if (activeEntries.length === 0) {
        onToast('Please enter an amount > ₹0 for selected members');
        return;
      }

      const txs: Omit<Transaction, 'id'>[] = activeEntries.map((entry) => ({
        memberId: entry.member.id,
        memberName: entry.member.name,
        type: entry.state.type,
        category: (entry.state.category as CategoryType) || 'Tea',
        date,
        time: timeStr,
        amount: Number(entry.state.amount),
        description: notes.trim() || `${entry.state.category} - Bulk Entry`,
      }));

      if (onAddBulkTransactions) {
        onAddBulkTransactions(txs);
      } else {
        txs.forEach((tx) => onAddTransaction(tx));
      }

      onToast(`Successfully added ${txs.length} transactions!`);
      // Reset amounts
      handleClearAllAmounts();
      setNotes('');
    } else if (mode === 'single') {
      const amt = parseFloat(singleAmount);
      if (isNaN(amt) || amt <= 0) {
        onToast('Please enter a valid amount');
        return;
      }

      const targetMember = members.find((m) => m.id === singleMemberId) || members[0];
      const newTx: Omit<Transaction, 'id'> = {
        memberId: targetMember.id,
        memberName: targetMember.name,
        type: singleType,
        category: (singleCategory as CategoryType) || 'Tea',
        date,
        time: timeStr,
        amount: amt,
        description: notes.trim() || `${singleCategory} expense`,
      };

      onAddTransaction(newTx);
      onToast(`Recorded transaction for ${targetMember.name}!`);
      setSingleAmount('');
      setNotes('');
    } else if (mode === 'split') {
      if (splitTotal <= 0) {
        onToast('Please enter a bill amount greater than 0');
        return;
      }
      if (splitActiveCount === 0) {
        onToast('Please select at least one member to split with');
        return;
      }

      const payer = members.find((m) => m.id === splitPayerId) || members[0];
      const participants = members.filter((m) => splitSelected[m.id]);

      // Create transactions:
      // 1. Payer gets Credit for total bill
      // 2. Each participant (including payer if checked) gets Debit for their share
      const splitTxs: Omit<Transaction, 'id'>[] = [
        {
          memberId: payer.id,
          memberName: payer.name,
          type: 'Credit',
          category: splitCategory,
          date,
          time: timeStr,
          amount: splitTotal,
          description: notes.trim() || `${splitCategory} bill paid for group: ₹${splitTotal}`,
        },
      ];

      participants.forEach((p) => {
        splitTxs.push({
          memberId: p.id,
          memberName: p.name,
          type: 'Debit',
          category: splitCategory,
          date,
          time: timeStr,
          amount: splitPerHead,
          description: `Split share for ${splitCategory.toLowerCase()} bill paid by ${payer.name}`,
        });
      });

      if (onAddBulkTransactions) {
        onAddBulkTransactions(splitTxs);
      } else {
        splitTxs.forEach((tx) => onAddTransaction(tx));
      }

      onToast(`Split ₹${splitTotal} among ${splitActiveCount} members!`);
      setNotes('');
    }
  };

  return (
    <main
      id="register-transaction-screen"
      className="flex-1 px-3 py-3 overflow-y-auto space-y-3 pb-24"
    >
      <section
        className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100/90"
        data-purpose="register-transaction-card"
      >
        {/* Card Title & Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-slate-700 font-medium text-xs">
            <PenLine className="w-3.5 h-3.5 text-indigo-600" />
            <span className="tracking-tight text-slate-800 font-semibold">
              Register Transaction
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Quick Fill Mode
          </span>
        </div>

        {/* Mode Toggle Tabs (Bulk / Single / Split Wise) */}
        <div
          className="grid grid-cols-3 gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/70 mb-3"
          data-purpose="entry-mode-switch"
        >
          <button
            id="tab-bulk"
            type="button"
            onClick={() => setMode('bulk')}
            className={`tab-btn flex items-center justify-center space-x-1.5 py-1.5 px-1 font-semibold text-[11px] rounded-lg transition-all cursor-pointer ${
              mode === 'bulk'
                ? 'bg-white text-indigo-600 shadow-xs border border-indigo-100'
                : 'text-slate-500 hover:text-slate-700 font-medium'
            }`}
          >
            <Layers className="w-3 h-3 text-current" />
            <span>Bulk Entry</span>
          </button>
          <button
            id="tab-single"
            type="button"
            onClick={() => setMode('single')}
            className={`tab-btn flex items-center justify-center space-x-1.5 py-1.5 px-1 font-semibold text-[11px] rounded-lg transition-all cursor-pointer ${
              mode === 'single'
                ? 'bg-white text-indigo-600 shadow-xs border border-indigo-100'
                : 'text-slate-500 hover:text-slate-700 font-medium'
            }`}
          >
            <User className="w-3 h-3 text-current" />
            <span>Single Entry</span>
          </button>
          <button
            id="tab-split"
            type="button"
            onClick={() => setMode('split')}
            className={`tab-btn flex items-center justify-center space-x-1.5 py-1.5 px-1 font-semibold text-[11px] rounded-lg transition-all cursor-pointer ${
              mode === 'split'
                ? 'bg-white text-indigo-600 shadow-xs border border-indigo-100'
                : 'text-slate-500 hover:text-slate-700 font-medium'
            }`}
          >
            <GitFork className="w-3 h-3 text-current rotate-180" />
            <span>Split Wise</span>
          </button>
        </div>

        {/* Common Date Selector */}
        <div className="mb-3" data-purpose="date-selector">
          <label
            className="block text-[11px] font-medium text-slate-600 mb-1"
            htmlFor="transaction-date"
          >
            Date
          </label>
          <div className="relative flex items-center">
            <input
              id="transaction-date"
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs font-normal text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 pr-9 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute right-3 pointer-events-none text-slate-400 text-xs">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* ============================================== */}
        {/* VIEW 1: BULK ENTRY (Modern Card Stack View) */}
        {/* ============================================== */}
        {mode === 'bulk' && (
          <div className="space-y-3" id="view-bulk">
            {/* Sticky Net Transaction Value Banner */}
            <div
              id="sticky-net-transaction-banner"
              className={`sticky top-0 z-20 rounded-xl px-4 py-3.5 border shadow-xs flex items-center justify-between transition-all ${
                isNetPositive
                  ? 'bg-emerald-50/95 border-emerald-300 text-slate-800'
                  : isNetNegative
                  ? 'bg-rose-50/95 border-rose-300 text-slate-800'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <span className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                NET TRANSACTION VALUE
              </span>
              <span
                id="bulkNetTotal"
                className={`text-xl font-black tracking-tight ${
                  isNetPositive
                    ? 'text-emerald-600'
                    : isNetNegative
                    ? 'text-rose-600'
                    : 'text-slate-800'
                }`}
              >
                {isNetPositive
                  ? `+₹${bulkNetDifference.toLocaleString()}`
                  : isNetNegative
                  ? `-₹${Math.abs(bulkNetDifference).toLocaleString()}`
                  : `₹0`}
              </span>
            </div>

            {/* Global Quick Actions Bar */}
            <div className="flex items-center justify-between px-1 py-1 text-[11px] text-slate-500">
              <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                <input
                  id="selectAllCards"
                  type="checkbox"
                  checked={isAllBulkSelected}
                  onChange={(e) => handleToggleSelectAll(e.target.checked)}
                  className="accent-[#4f46e5] text-indigo-600 rounded focus:ring-0 w-3.5 h-3.5 border-slate-300 cursor-pointer"
                />
                <span className="font-semibold text-slate-700 text-xs">
                  All ({bulkSelectedCount}/{members.length})
                </span>
              </label>

              {/* Global Quick Toggles & Presets */}
              <div className="flex items-center space-x-1">
                {/* Global Toggle Buttons */}
                <div className="inline-flex p-0.5 bg-slate-200/80 rounded-lg border border-slate-300/60 shadow-2xs mr-1">
                  <button
                    type="button"
                    title="Switch all selected members to Debit"
                    onClick={() => handleToggleAllType('Debit')}
                    className="px-1.5 py-0.5 text-[10px] font-bold rounded text-rose-700 hover:bg-white transition-all cursor-pointer"
                  >
                    All Dr
                  </button>
                  <button
                    type="button"
                    title="Switch all selected members to Credit"
                    onClick={() => handleToggleAllType('Credit')}
                    className="px-1.5 py-0.5 text-[10px] font-bold rounded text-emerald-700 hover:bg-white transition-all cursor-pointer"
                  >
                    All Cr
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyPresetToAll(12)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                >
                  +₹12
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetToAll(24)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                >
                  +₹24
                </button>
                <button
                  type="button"
                  title="Clear all amounts"
                  onClick={handleClearAllAmounts}
                  className="px-1.5 py-0.5 text-slate-400 hover:text-slate-600 rounded text-[10px] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Member Card Stack */}
            <div className="space-y-2.5" id="memberCardsContainer">
              {members.map((member) => {
                const state = bulkStates[member.id] || {
                  memberId: member.id,
                  selected: true,
                  type: 'Debit',
                  amount: 0,
                  category: 'Tea',
                };

                const initials = getInitials(member.name);
                const avatarBadgeClass = getAvatarBadgeClass(member.name);
                const isDebit = state.type === 'Debit';

                return (
                  <div
                    key={member.id}
                    id={`member-card-${member.id}`}
                    data-member={member.name}
                    className={`member-card border rounded-xl p-3 transition-all ${
                      isDebit
                        ? 'bg-slate-50/70 border-slate-200/90 hover:border-rose-300'
                        : 'bg-emerald-50/20 border-emerald-200/70 hover:border-emerald-300'
                    }`}
                  >
                    {/* Top row: Checkbox, Avatar, Name, Toggle Button */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="checkbox"
                          checked={state.selected}
                          onChange={(e) =>
                            handleBulkMemberChange(member.id, {
                              selected: e.target.checked,
                            })
                          }
                          className="member-check accent-[#4f46e5] text-indigo-600 rounded focus:ring-0 w-4 h-4 border-slate-300 cursor-pointer"
                        />
                        <div
                          className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border shadow-2xs ${avatarBadgeClass}`}
                        >
                          {initials}
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-slate-800 leading-tight">
                            {member.name}
                          </h4>
                        </div>
                      </div>

                      {/* Functional Type Toggle Button (Debit / Credit) */}
                      <div
                        id={`type-toggle-${member.id}`}
                        className="inline-flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-lg shadow-2xs"
                      >
                        <button
                          type="button"
                          id={`toggle-debit-${member.id}`}
                          onClick={() =>
                            handleBulkMemberChange(member.id, { type: 'Debit' })
                          }
                          className={`type-pill-debit px-2.5 py-1 text-[10px] rounded-md transition-all cursor-pointer font-bold ${
                            isDebit
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          Debit
                        </button>
                        <button
                          type="button"
                          id={`toggle-credit-${member.id}`}
                          onClick={() =>
                            handleBulkMemberChange(member.id, { type: 'Credit' })
                          }
                          className={`type-pill-credit px-2.5 py-1 text-[10px] rounded-md transition-all cursor-pointer font-bold ${
                            !isDebit
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          Credit
                        </button>
                      </div>
                    </div>

                    {/* Amount Input & Quick Increments */}
                    <div className="grid grid-cols-12 gap-2 items-center mb-2">
                      <div className="col-span-5 relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                          ₹
                        </span>
                        <input
                          type="number"
                          placeholder="0"
                          value={state.amount === 0 ? '' : state.amount}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            handleBulkMemberChange(member.id, { amount: val });
                          }}
                          className="member-amount w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-7 flex items-center space-x-1 overflow-x-auto no-scrollbar">
                        {[12, 24, 50, 100].map((inc) => (
                          <button
                            key={inc}
                            type="button"
                            onClick={() =>
                              handleBulkMemberChange(member.id, {
                                amount: (Number(state.amount) || 0) + inc,
                              })
                            }
                            className="px-2 py-1 bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 rounded-md text-[10px] font-medium whitespace-nowrap cursor-pointer transition-colors"
                          >
                            +{inc}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category Chips */}
                    <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-0.5">
                      {bulkCategories.map((cat) => {
                        const isCatActive = state.category === cat.key;
                        return (
                          <button
                            key={cat.key}
                            type="button"
                            onClick={() =>
                              handleBulkMemberChange(member.id, {
                                category: cat.key,
                              })
                            }
                            className={`chip-item px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                              isCatActive
                                ? 'active bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-2xs'
                                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* VIEW 2: SINGLE ENTRY */}
        {/* ============================================== */}
        {mode === 'single' && (
          <div className="space-y-3" id="view-single">
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Select Member
                </label>
                <select
                  value={singleMemberId}
                  onChange={(e) => setSingleMemberId(e.target.value)}
                  className="w-full text-xs font-normal text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="single-type-debit"
                    onClick={() => setSingleType('Debit')}
                    className={`p-2.5 rounded-xl flex items-center justify-center space-x-2 cursor-pointer shadow-2xs transition-all ${
                      singleType === 'Debit'
                        ? 'border-2 border-rose-400 bg-rose-50 text-rose-700 font-bold'
                        : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold">DEBIT</span>
                  </button>
                  <button
                    type="button"
                    id="single-type-credit"
                    onClick={() => setSingleType('Credit')}
                    className={`p-2.5 rounded-xl flex items-center justify-center space-x-2 cursor-pointer shadow-2xs transition-all ${
                      singleType === 'Credit'
                        ? 'border-2 border-emerald-400 bg-emerald-50 text-emerald-700 font-bold'
                        : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold">CREDIT</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={singleAmount}
                    onChange={(e) => setSingleAmount(e.target.value)}
                    className="w-full text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {singleCategories.map((cat) => {
                    const isActive = singleCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setSingleCategory(cat.key)}
                        className={`py-1.5 px-2 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                          isActive
                            ? 'bg-white border border-indigo-200 text-indigo-700 shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* VIEW 3: SPLIT WISE */}
        {/* ============================================== */}
        {mode === 'split' && (
          <div className="space-y-3" id="view-split">
            <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3.5 space-y-3">
              {/* Total Bill Amount */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Total Bill Amount to Split
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                    ₹
                  </span>
                  <input
                    id="splitTotalInput"
                    type="number"
                    placeholder="0"
                    value={splitTotal === 0 ? '' : splitTotal}
                    onChange={(e) => setSplitTotal(parseFloat(e.target.value) || 0)}
                    className="w-full text-base font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {bulkCategories.map((cat) => {
                    const isActive = splitCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setSplitCategory(cat.key)}
                        className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Paid By Dropdown */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Paid By (Full Bill)
                </label>
                <select
                  value={splitPayerId}
                  onChange={(e) => setSplitPayerId(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.id === splitPayerId ? '— Paid Total Bill' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Member Cards Stack for Split Wise */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAllSplitSelected}
                      onChange={(e) => handleToggleSplitSelectAll(e.target.checked)}
                      className="accent-[#4f46e5] text-indigo-600 rounded focus:ring-0 w-3.5 h-3.5 border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      Split Equally Among ({splitActiveCount}/{members.length})
                    </span>
                  </label>
                  <span
                    id="splitPerHead"
                    className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200"
                  >
                    ₹{splitPerHead.toLocaleString()} / person
                  </span>
                </div>

                <div className="space-y-2" id="split-member-cards">
                  {members.map((m) => {
                    const isChecked = !!splitSelected[m.id];
                    const isPayer = m.id === splitPayerId;
                    const initials = getInitials(m.name);
                    const avatarBadgeClass = getAvatarBadgeClass(m.name);

                    return (
                      <div
                        key={m.id}
                        id={`split-member-card-${m.id}`}
                        className={`border rounded-xl p-3 transition-all ${
                          isPayer
                            ? 'bg-indigo-50/40 border-indigo-200 shadow-2xs'
                            : isChecked
                            ? 'bg-white border-slate-200 hover:border-indigo-200 shadow-2xs'
                            : 'bg-slate-50/70 border-slate-200/70 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                setSplitSelected((prev) => ({
                                  ...prev,
                                  [m.id]: e.target.checked,
                                }))
                              }
                              className="accent-[#4f46e5] text-indigo-600 rounded focus:ring-0 w-4 h-4 border-slate-300 cursor-pointer"
                            />
                            <div
                              className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border shadow-2xs ${avatarBadgeClass}`}
                            >
                              {initials}
                            </div>
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <h4 className="text-sm sm:text-base font-bold text-slate-800 leading-tight">
                                  {m.name}
                                </h4>
                                {isPayer && (
                                  <span className="text-[9px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md border border-indigo-200">
                                    Payer
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {isPayer
                                  ? `Paid ₹${splitTotal.toLocaleString()} for all`
                                  : isChecked
                                  ? `Split share: ₹${splitPerHead.toLocaleString()}`
                                  : 'Excluded from split'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {!isPayer && (
                              <button
                                type="button"
                                onClick={() => setSplitPayerId(m.id)}
                                className="text-[10px] font-semibold text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                              >
                                Set Payer
                              </button>
                            )}
                            <div className="text-right">
                              <span
                                className={`text-sm font-bold ${
                                  !isChecked
                                    ? 'text-slate-300 line-through'
                                    : isPayer
                                    ? 'text-indigo-700'
                                    : 'text-slate-800'
                                }`}
                              >
                                ₹{isChecked ? splitPerHead.toLocaleString() : 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes Field (Universal) */}
        <div className="mt-3.5 mb-3.5" data-purpose="notes-field">
          <label
            className="block text-[11px] text-slate-600 mb-1"
            htmlFor="notes"
          >
            Notes{' '}
            <span className="text-slate-400 font-normal">
              (optional - applies to record)
            </span>
          </label>
          <input
            id="notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Evening refreshments & tea"
            className="w-full text-xs text-slate-700 placeholder-slate-400 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Submit Button */}
        <button
          id="add-transactions-button"
          type="button"
          onClick={handleSubmit}
          className="w-full text-white text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm active:scale-[0.99] transition-all cursor-pointer"
          style={{ backgroundColor: 'var(--color-primary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
          data-purpose="add-transactions-button"
        >
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span id="submitBtnLabel">
            {mode === 'bulk' && 'Add Selected Transactions'}
            {mode === 'single' && 'Record Single Entry'}
            {mode === 'split' && 'Confirm & Split Bill'}
          </span>
        </button>
      </section>
    </main>
  );
};
