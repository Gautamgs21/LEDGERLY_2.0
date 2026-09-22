/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Member, Transaction, TabType, Role } from './types';
import { INITIAL_MEMBERS, INITIAL_TRANSACTIONS } from './data/initialData';
import { TopHeader } from './components/TopHeader';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { NewScreen } from './components/NewScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { EditTransactionModal } from './components/EditTransactionModal';
import { Toast } from './components/Toast';
import { LoginScreen } from './components/LoginScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { applyThemeAndFont, COLOR_THEMES } from './data/themeConfig';

export default function App() {
  // App Launch Loading Screen State
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);

  // Appearance & Theme State (Persisted)
  const [selectedFont, setSelectedFont] = useState<string>(() => {
    return localStorage.getItem('ledgerly_font_theme') || 'Open Sans';
  });
  const [selectedTheme, setSelectedTheme] = useState<string>(() => {
    return localStorage.getItem('ledgerly_color_theme') || 'indigo';
  });

  // Apply Theme & Font on mount and when changed
  useEffect(() => {
    applyThemeAndFont(selectedFont, selectedTheme);
    localStorage.setItem('ledgerly_font_theme', selectedFont);
    localStorage.setItem('ledgerly_color_theme', selectedTheme);
  }, [selectedFont, selectedTheme]);

  // Members State
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('ledgerly_members');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_MEMBERS;
  });

  // Active Logged-in User State (Persisted in localStorage)
  const [currentUser, setCurrentUser] = useState<Member | null>(() => {
    const savedUserId = localStorage.getItem('ledgerly_active_user_id');
    if (savedUserId) {
      const savedMembers = localStorage.getItem('ledgerly_members');
      const list: Member[] = savedMembers ? JSON.parse(savedMembers) : INITIAL_MEMBERS;
      const found = list.find((m) => m.id === savedUserId);
      if (found) return found;
    }
    return null;
  });

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ledgerly_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  // Keep currentUser in sync if member profile details change in state
  useEffect(() => {
    if (currentUser) {
      const updated = members.find((m) => m.id === currentUser.id);
      if (
        updated &&
        (updated.name !== currentUser.name ||
          updated.role !== currentUser.role ||
          updated.upi !== currentUser.upi ||
          updated.balanceAmount !== currentUser.balanceAmount ||
          updated.balanceType !== currentUser.balanceType)
      ) {
        setCurrentUser(updated);
      }
    }
  }, [members, currentUser]);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [historyMemberFilter, setHistoryMemberFilter] = useState<string>('all');

  // Modals State
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('ledgerly_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('ledgerly_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Login handler
  const handleLogin = (member: Member) => {
    setCurrentUser(member);
    localStorage.setItem('ledgerly_active_user_id', member.id);
    showToast(`Signed in as ${member.name} (${member.role})`);
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ledgerly_active_user_id');
    showToast('Signed out successfully');
  };

  // Switch tab helper
  const handleSelectTab = (tab: TabType) => {
    setCurrentTab(tab);
  };

  // Add Transaction
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update Member balance
    setMembers((prevMembers) =>
      prevMembers.map((member) => {
        if (member.id === newTx.memberId) {
          if (newTx.type === 'Debit') {
            if (member.balanceType === 'Debt') {
              return { ...member, balanceAmount: member.balanceAmount + newTx.amount };
            } else {
              const diff = member.balanceAmount - newTx.amount;
              if (diff >= 0) {
                return { ...member, balanceAmount: diff };
              } else {
                return {
                  ...member,
                  balanceType: 'Debt' as const,
                  balanceAmount: Math.abs(diff),
                };
              }
            }
          } else {
            // Credit
            if (member.balanceType === 'Credit') {
              return { ...member, balanceAmount: member.balanceAmount + newTx.amount };
            } else {
              const diff = member.balanceAmount - newTx.amount;
              if (diff <= 0) {
                return {
                  ...member,
                  balanceType: 'Credit' as const,
                  balanceAmount: Math.abs(diff),
                };
              } else {
                return { ...member, balanceAmount: diff };
              }
            }
          }
        }
        return member;
      })
    );
  };

  // Add Multiple / Bulk Transactions
  const handleAddBulkTransactions = (newTxsData: Omit<Transaction, 'id'>[]) => {
    const newTxs: Transaction[] = newTxsData.map((txData, index) => ({
      ...txData,
      id: `tx-${Date.now()}-${index}`,
    }));

    setTransactions((prev) => [...newTxs, ...prev]);

    // Update Member balances cumulatively
    setMembers((prevMembers) => {
      let updated = [...prevMembers];
      newTxs.forEach((tx) => {
        updated = updated.map((member) => {
          if (member.id === tx.memberId) {
            if (tx.type === 'Debit') {
              if (member.balanceType === 'Debt') {
                return { ...member, balanceAmount: member.balanceAmount + tx.amount };
              } else {
                const diff = member.balanceAmount - tx.amount;
                if (diff >= 0) {
                  return { ...member, balanceAmount: diff };
                } else {
                  return {
                    ...member,
                    balanceType: 'Debt' as const,
                    balanceAmount: Math.abs(diff),
                  };
                }
              }
            } else {
              // Credit
              if (member.balanceType === 'Credit') {
                return { ...member, balanceAmount: member.balanceAmount + tx.amount };
              } else {
                const diff = member.balanceAmount - tx.amount;
                if (diff <= 0) {
                  return {
                    ...member,
                    balanceType: 'Credit' as const,
                    balanceAmount: Math.abs(diff),
                  };
                } else {
                  return { ...member, balanceAmount: diff };
                }
              }
            }
          }
          return member;
        });
      });
      return updated;
    });
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    showToast('Transaction deleted');
  };

  // Delete Multiple Transactions
  const handleDeleteMultipleTransactions = (ids: string[]) => {
    setTransactions((prev) => prev.filter((tx) => !ids.includes(tx.id)));
  };

  // Update Transaction
  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === updatedTx.id ? updatedTx : tx))
    );
  };

  // Add Member
  const handleAddMember = (name: string, role: Role) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-') || `user-${Date.now()}`;
    const avatarLetter = name.trim().charAt(0).toUpperCase();

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
    const randomColor = colors[members.length % colors.length];

    const newMember: Member = {
      id,
      name,
      avatarLetter,
      color: randomColor,
      role,
      balanceType: 'Debt',
      balanceAmount: 0,
    };

    setMembers((prev) => [...prev, newMember]);
  };

  // Update Member
  const handleUpdateMember = (updated: Member) => {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    if (currentUser?.id === updated.id) {
      setCurrentUser(updated);
    }
  };

  // Delete Member
  const handleDeleteMember = (id: string) => {
    const isSelf = currentUser?.id === id;
    setMembers((prev) => prev.filter((m) => m.id !== id));
    if (isSelf) {
      handleLogout();
      showToast('Account deleted successfully');
    } else {
      showToast('Member removed');
    }
  };

  // Reset all application data to defaults
  const handleResetData = () => {
    if (currentUser?.role !== 'Admin') {
      showToast('Permission denied: Only Admin can reset application data');
      return;
    }
    try {
      localStorage.removeItem('ledgerly_members');
      localStorage.removeItem('ledgerly_transactions');
      localStorage.removeItem('ledgerly_active_user_id');
    } catch (e) {
      console.error('Error clearing localStorage', e);
    }
    setMembers(INITIAL_MEMBERS);
    setTransactions(INITIAL_TRANSACTIONS);
    const defaultAdmin = INITIAL_MEMBERS.find((m) => m.role === 'Admin') || INITIAL_MEMBERS[0];
    setCurrentUser(defaultAdmin);
    showToast('All application data reset to initial state');
  };

  // UPI Quick Pay / Top-Up Action
  const handleTopUpUpi = (
    payerName: string,
    amount: number,
    appName: string = 'UPI',
    utr?: string,
    receiptUrl?: string
  ) => {
    const payerMember = members.find(
      (m) => m.name.toLowerCase() === payerName.toLowerCase()
    ) || members[0];

    // Log transaction
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newTx: Transaction = {
      id: `upi-${Date.now()}`,
      memberId: payerMember.id,
      memberName: payerMember.name,
      type: 'Credit',
      category: 'Top-Up',
      date: dateStr,
      time: timeStr,
      amount,
      description: `UPI Quick Pay & Top-Up via ${appName}`,
      note: utr ? `UTR: ${utr}` : undefined,
      utr,
      receiptUrl,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update payer member credit
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === payerMember.id) {
          if (m.balanceType === 'Credit') {
            return { ...m, balanceAmount: m.balanceAmount + amount };
          } else {
            const diff = m.balanceAmount - amount;
            if (diff < 0) {
              return { ...m, balanceType: 'Credit', balanceAmount: Math.abs(diff) };
            }
            return { ...m, balanceAmount: diff };
          }
        }
        return m;
      })
    );
  };

  // Refresh sync action
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Synced latest group ledger balances');
    }, 600);
  };

  // Click on member card from Home opens History filtered by this member
  const handleSelectMemberFilter = (memberId: string) => {
    setHistoryMemberFilter(memberId);
    setCurrentTab('history');
  };

  // App Launch Loading Screen
  if (isAppLoading) {
    return (
      <div className="bg-[#eef2f7] min-h-screen flex justify-center text-slate-800 antialiased font-sans selection:bg-[#5c54db]/20">
        <main className="w-full max-w-[420px] min-h-screen bg-[#f3f5fa] flex flex-col relative shadow-xl overflow-x-hidden border-x border-slate-200/60">
          <LoadingScreen onFinish={() => setIsAppLoading(false)} />
        </main>
      </div>
    );
  }

  // If no user is logged in, show the Login Screen
  if (!currentUser) {
    return (
      <div className="bg-[#eef2f7] min-h-screen flex justify-center text-slate-800 antialiased font-sans selection:bg-[#5c54db]/20">
        <main className="w-full max-w-[420px] min-h-screen bg-[#f3f5fa] flex flex-col relative shadow-xl overflow-x-hidden border-x border-slate-200/60">
          <LoginScreen
            members={members}
            onLogin={handleLogin}
            onToast={showToast}
          />
          <Toast message={toastMessage} />
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[#eef2f7] min-h-screen flex justify-center text-slate-800 antialiased font-sans selection:bg-[#5c54db]/20">
      {/* Mobile Container */}
      <main className="w-full max-w-[420px] min-h-screen bg-[#f3f5fa] flex flex-col relative shadow-xl overflow-x-hidden border-x border-slate-200/60">
        {/* Top Header */}
        <TopHeader
          currentUser={currentUser}
          onLogout={handleLogout}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Tab Views */}
        {currentTab === 'home' && (
          <HomeScreen
            currentUser={currentUser}
            members={members}
            transactions={transactions}
            onSelectMemberFilter={handleSelectMemberFilter}
            onToast={showToast}
          />
        )}

        {currentTab === 'new' && (
          <NewScreen
            members={members}
            onAddTransaction={handleAddTransaction}
            onAddBulkTransactions={handleAddBulkTransactions}
            onToast={showToast}
          />
        )}

        {currentTab === 'history' && (
          <HistoryScreen
            currentUser={currentUser}
            transactions={transactions}
            members={members}
            onDeleteTransaction={handleDeleteTransaction}
            onDeleteMultipleTransactions={handleDeleteMultipleTransactions}
            onEditTransaction={(tx) => setEditingTransaction(tx)}
            onToast={showToast}
            initialMemberFilter={historyMemberFilter}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsScreen
            currentUser={currentUser}
            onLogout={handleLogout}
            members={members}
            onAddMember={handleAddMember}
            onEditMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            onResetData={handleResetData}
            onTopUpUpi={handleTopUpUpi}
            onToast={showToast}
            selectedFont={selectedFont}
            onSelectFont={(font) => {
              setSelectedFont(font);
              showToast(`Typography set to ${font}`);
            }}
            selectedTheme={selectedTheme}
            onSelectTheme={(theme) => {
              setSelectedTheme(theme);
              const themeObj = COLOR_THEMES.find((t) => t.id === theme);
              showToast(`Color theme set to ${themeObj?.name || theme}`);
            }}
          />
        )}

        {/* Bottom Navigation Bar */}
        <BottomNav currentTab={currentTab} onSelectTab={handleSelectTab} />

        {/* Edit Transaction Modal */}
        <EditTransactionModal
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          transaction={editingTransaction}
          members={members}
          onUpdateTransaction={handleUpdateTransaction}
          onToast={showToast}
        />

        {/* Toast Alert */}
        <Toast message={toastMessage} />
      </main>
    </div>
  );
}
