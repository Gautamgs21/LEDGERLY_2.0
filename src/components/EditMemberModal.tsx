import React, { useState, useEffect } from 'react';
import { X, UserCheck, Trash2, Shield } from 'lucide-react';
import { Member, Role } from '../types';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onUpdateMember: (updated: Member) => void;
  onDeleteMember: (id: string) => void;
  onToast: (msg: string) => void;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  onUpdateMember,
  onDeleteMember,
  onToast,
}) => {
  if (!isOpen || !member) return null;

  const [name, setName] = useState<string>(member.name);
  const [role, setRole] = useState<Role>(member.role);
  const [balanceAmount, setBalanceAmount] = useState<string>(member.balanceAmount.toString());
  const [balanceType, setBalanceType] = useState<'Debt' | 'Credit'>(member.balanceType);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setRole(member.role);
      setBalanceAmount(member.balanceAmount.toString());
      setBalanceType(member.balanceType);
    }
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onToast('Please enter member name');
      return;
    }
    const amt = parseFloat(balanceAmount);
    if (isNaN(amt) || amt < 0) {
      onToast('Please enter a valid balance amount');
      return;
    }

    onUpdateMember({
      ...member,
      name: name.trim(),
      role,
      balanceAmount: amt,
      balanceType,
    });
    onToast(`Updated member details for ${name.trim()}`);
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Remove ${member.name} from members directory?`)) {
      onDeleteMember(member.id);
      onToast(`Removed member ${member.name}`);
      onClose();
    }
  };

  return (
    <div
      id="edit-member-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="w-full max-w-[380px] bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div
              className="w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center"
              style={{ backgroundColor: member.color }}
            >
              {member.avatarLetter}
            </div>
            <h3 className="font-bold text-base text-slate-800">Edit Member</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-4 space-y-3.5">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Member Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#fbfcfe] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#5c54db]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Role Permission
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['User', 'Banker', 'Admin'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                    role === r
                      ? 'border-2 border-[#5c54db] bg-[#f0effd] text-[#5c54db]'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  <span>{r}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Balance Type
              </label>
              <select
                value={balanceType}
                onChange={(e) => setBalanceType(e.target.value as 'Debt' | 'Credit')}
                className="w-full bg-[#fbfcfe] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#5c54db]"
              >
                <option value="Debt">Debt</option>
                <option value="Credit">Credit</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Balance (₹)
              </label>
              <input
                type="number"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                className="w-full bg-[#fbfcfe] border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#5c54db]"
              />
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#5448d8] text-white font-bold text-xs hover:bg-[#4338ca] transition-colors shadow-sm cursor-pointer"
            >
              Save Changes
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="w-full py-2 rounded-xl text-[#e11d48] border border-rose-100 hover:bg-rose-50 font-semibold text-xs flex items-center justify-center space-x-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Member</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
