import React, { useState } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Copy,
  Check,
  Edit2,
  Zap,
  Users,
  PlusCircle,
  Shield,
  User,
  X,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Info,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Lock,
  ShieldCheck,
  LogOut,
  AlertCircle,
  Type,
  Palette,
  Sparkles,
  ExternalLink,
  Smartphone,
  CheckCheck,
  Bell,
  ArrowRight,
  KeyRound,
  Upload,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { Member, Role } from '../types';
import { FONT_OPTIONS, COLOR_THEMES, applyThemeAndFont } from '../data/themeConfig';

interface SettingsScreenProps {
  currentUser?: Member | null;
  onLogout?: () => void;
  members: Member[];
  onAddMember: (name: string, role: Role) => void;
  onEditMember: (member: Member) => void;
  onDeleteMember?: (id: string) => void;
  onResetData?: () => void;
  onTopUpUpi: (
    payerName: string,
    amount: number,
    appName?: string,
    utr?: string,
    receiptUrl?: string
  ) => void;
  onToast: (msg: string) => void;
  selectedFont?: string;
  onSelectFont?: (fontName: string) => void;
  selectedTheme?: string;
  onSelectTheme?: (themeId: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  currentUser,
  onLogout,
  members,
  onAddMember,
  onEditMember,
  onDeleteMember,
  onResetData,
  onTopUpUpi,
  onToast,
  selectedFont = 'Open Sans',
  onSelectFont,
  selectedTheme = 'indigo',
  onSelectTheme,
}) => {
  // UPI Target VPA with localStorage persistence and edit state
  const [targetVpa, setTargetVpa] = useState<string>(() => {
    return localStorage.getItem('ledgerly_target_upi_vpa') || 'ledgerly@okhdfcbank';
  });
  const [isEditingTargetVpa, setIsEditingTargetVpa] = useState<boolean>(false);
  const [targetVpaInput, setTargetVpaInput] = useState<string>(targetVpa);
  const [copiedVpa, setCopiedVpa] = useState(false);

  // Permission: Additional option of Edit is available only for Admin and Banker
  const canEditTargetVpa = currentUser?.role === 'Admin' || currentUser?.role === 'Banker';

  // Quick Amount & Custom Amount
  const [selectedQuickAmt, setSelectedQuickAmt] = useState<number>(200);
  const [customAmount, setCustomAmount] = useState<string>('200');

  // Payer UPI ID State & Inline Edit
  const defaultPayerUpi =
    currentUser?.upi || `${currentUser?.name.toLowerCase() || 'gautam'}@okhdfcbank`;
  const [payerUpi, setPayerUpi] = useState<string>(defaultPayerUpi);
  const [isEditingPayerUpi, setIsEditingPayerUpi] = useState<boolean>(false);
  const [payerUpiInput, setPayerUpiInput] = useState<string>(defaultPayerUpi);

  // Sync payerUpi when currentUser changes
  React.useEffect(() => {
    if (currentUser?.upi) {
      setPayerUpi(currentUser.upi);
      setPayerUpiInput(currentUser.upi);
    }
  }, [currentUser]);

  // Selected Pay App
  const [selectedApp, setSelectedApp] = useState<string>('BHIM');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'routing' | 'success'>('idle');

  // Selected Member to Credit via Top-Up
  const [topUpTargetMember, setTopUpTargetMember] = useState<string>(
    currentUser?.name || 'Gautam'
  );

  // Active UPI Payment Request Modal State
  // Active Direct UPI Deep Link Modal State
  const [upiPaymentModal, setUpiPaymentModal] = useState<{
    isOpen: boolean;
    app: string;
    appFullName: string;
    appBrandColor: string;
    appUri: string;
    universalUri: string;
    amount: number;
    payerUpi: string;
    targetMember: string;
    txnRef: string;
    transactionNote: string;
    utrNumber: string;
    utrInput: string;
    uploadedScreenshot: string | null;
    screenshotFileName: string | null;
    qrCodeUrl: string;
    copiedLink: boolean;
    showQrOption: boolean;
    verifyMode: 'utr' | 'screenshot';
    isVerifying: boolean;
    step: 'trigger' | 'verify' | 'confirmed';
  } | null>(null);

  const [modalTimeLeft, setModalTimeLeft] = useState<number>(300);

  // Countdown timer for active UPI payment request (5 mins)
  React.useEffect(() => {
    if (!upiPaymentModal?.isOpen) return;
    setModalTimeLeft(300);
    const timer = setInterval(() => {
      setModalTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [upiPaymentModal?.isOpen, upiPaymentModal?.txnRef]);

  // Staged Font & Theme before applying system-wide
  const [pendingFont, setPendingFont] = useState<string>(selectedFont);
  const [pendingTheme, setPendingTheme] = useState<string>(selectedTheme);

  React.useEffect(() => {
    setPendingFont(selectedFont);
  }, [selectedFont]);

  React.useEffect(() => {
    setPendingTheme(selectedTheme);
  }, [selectedTheme]);

  const handleApplyThemeAndFont = () => {
    applyThemeAndFont(pendingFont, pendingTheme);
    if (onSelectFont) onSelectFont(pendingFont);
    if (onSelectTheme) onSelectTheme(pendingTheme);
    const themeName = COLOR_THEMES.find((t) => t.id === pendingTheme)?.name || pendingTheme;
    onToast(`Applied ${pendingFont} font & ${themeName} theme system-wide!`);
  };

  // Active highlighted member in list
  const [activeMemberId, setActiveMemberId] = useState<string>('deepak');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Modal State for Add / Edit Member
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isNewMemberMode, setIsNewMemberMode] = useState<boolean>(false);
  const [modalMemberId, setModalMemberId] = useState<string>('');
  const [modalName, setModalName] = useState<string>('');
  const [modalUpi, setModalUpi] = useState<string>('');
  const [modalRole, setModalRole] = useState<Role>('User');
  const [modalDob, setModalDob] = useState<string>('08-03-1995');
  const [modalPin, setModalPin] = useState<string>('123456');

  // Privilege checks based on logged-in role
  const canAddMember = currentUser
    ? currentUser.role === 'Admin' || currentUser.role === 'Banker'
    : true;

  const canEditMember = (member: Member) => {
    if (!currentUser) return true;
    if (currentUser.role === 'Admin' || currentUser.role === 'Banker') return true;
    // Regular User can ONLY edit their own user settings
    return member.id === currentUser.id;
  };

  const getDeletePermission = (
    member: Member
  ): { allowed: boolean; reason?: string } => {
    if (!currentUser) return { allowed: false, reason: 'Please log in' };

    // Admin & Banker can remove any member
    if (currentUser.role === 'Admin' || currentUser.role === 'Banker') {
      return { allowed: true };
    }

    // Regular User: can only delete themselves, and only if accumulated due is above zero
    if (member.id !== currentUser.id) {
      return {
        allowed: false,
        reason: 'Regular users cannot remove other members (Banker or Admin only)',
      };
    }

    // "User can delete themselves only if their accumulated due is above zero."
    const isDueAboveZero =
      member.balanceAmount > 0 && member.balanceType === 'Credit';

    if (!isDueAboveZero) {
      const currentStatus =
        member.balanceType === 'Debt'
          ? `Debt of ₹${member.balanceAmount}`
          : `₹${member.balanceAmount} balance`;
      return {
        allowed: false,
        reason: `Cannot delete your account: accumulated due must be above zero (${currentStatus} currently).`,
      };
    }

    return { allowed: true };
  };

  // Handle execute reset data (Admin only)
  const handleExecuteReset = () => {
    if (currentUser?.role !== 'Admin') {
      onToast('Permission denied: Only Admin can reset application data');
      setShowResetConfirm(false);
      return;
    }
    if (onResetData) {
      onResetData();
    }
    setShowResetConfirm(false);
  };

  // Handle remove member confirmation
  const handleConfirmDelete = (member: Member) => {
    const perm = getDeletePermission(member);
    if (!perm.allowed) {
      onToast(perm.reason || 'Permission denied');
      setDeleteConfirmId(null);
      return;
    }

    if (onDeleteMember) {
      onDeleteMember(member.id);
    }
    setDeleteConfirmId(null);
    onToast(`Removed member ${member.name}`);

    // If user deleted themselves, trigger logout
    if (currentUser && member.id === currentUser.id && onLogout) {
      onLogout();
    }
  };

  // 1. Copy VPA to Clipboard
  const handleCopyVpa = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(targetVpa).catch(() => {});
    }
    setCopiedVpa(true);
    onToast(`Copied VPA "${targetVpa}"`);
    setTimeout(() => {
      setCopiedVpa(false);
    }, 1800);
  };

  // 1b. Save Target UPI VPA (Admin & Banker only)
  const handleSaveTargetVpa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditTargetVpa) {
      onToast('Permission denied: Only Admin and Banker can edit the group UPI VPA/ID');
      setIsEditingTargetVpa(false);
      return;
    }
    const val = targetVpaInput.trim();
    if (!val) {
      onToast('UPI VPA/ID cannot be empty');
      return;
    }
    setTargetVpa(val);
    localStorage.setItem('ledgerly_target_upi_vpa', val);
    setIsEditingTargetVpa(false);
    onToast(`UPI VPA/ID updated to: ${val}`);
  };

  // 2. Select Quick Amount
  const handleSelectQuickAmt = (amt: number) => {
    setSelectedQuickAmt(amt);
    setCustomAmount(amt.toString());
  };

  const handleAmountInputChange = (val: string) => {
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && [50, 100, 200, 500].includes(num)) {
      setSelectedQuickAmt(num);
    } else {
      setSelectedQuickAmt(0);
    }
  };

  // 3. Save Payer UPI
  const handleSavePayerUpi = (e: React.FormEvent) => {
    e.preventDefault();
    const val = payerUpiInput.trim();
    if (val) {
      setPayerUpi(val);
      if (currentUser) {
        onEditMember({
          ...currentUser,
          upi: val,
        });
      }
      onToast(`Payer VPA saved: ${val}`);
    }
    setIsEditingPayerUpi(false);
  };

  const apps = [
    {
      name: 'GPay',
      fullName: 'Google Pay',
      brandColor: '#4285F4',
      hoverBg: '#3367d6',
      schemeName: 'tez://',
      actionLabel: 'Open Google Pay',
    },
    {
      name: 'PhonePe',
      fullName: 'PhonePe',
      brandColor: '#5f259f',
      hoverBg: '#4c1d82',
      schemeName: 'phonepe://',
      actionLabel: 'Open PhonePe',
    },
    {
      name: 'Paytm',
      fullName: 'Paytm UPI',
      brandColor: '#002970',
      hoverBg: '#001e52',
      schemeName: 'paytmmp://',
      actionLabel: 'Open Paytm',
    },
    {
      name: 'BHIM',
      fullName: 'BHIM UPI',
      brandColor: '#005a9c',
      hoverBg: '#004377',
      schemeName: 'upi://',
      actionLabel: 'Open BHIM UPI',
    },
  ];

  // Helper to trigger UPI deep linking into the client's installed apps
  const triggerUpiAppLaunch = (uri: string) => {
    try {
      const link = document.createElement('a');
      link.href = uri;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try {
          document.body.removeChild(link);
        } catch (e) {}
      }, 500);
    } catch (err) {
      console.warn('Anchor launch warning:', err);
    }

    try {
      window.location.href = uri;
    } catch (err) {
      console.warn('Window location warning:', err);
    }
  };

  // 4. Pay & Top-Up via Direct UPI Deep Linking Execution
  const handleExecutePayment = async () => {
    const amt = parseFloat(customAmount);
    if (isNaN(amt) || amt <= 0) {
      onToast('Please enter a valid amount');
      return;
    }

    setPaymentStatus('routing');
    const targetMember = topUpTargetMember || currentUser?.name || members[0]?.name || 'Gautam';
    const txnRef = 'UPI' + Date.now().toString().slice(-6);
    const txNote = `Topup-${targetMember.replace(/\s+/g, '')}-${txnRef}`;

    // Direct UPI Link Structure: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
    // pa (Payee Address): Destination UPI ID (e.g., ledgerly@okhdfcbank)
    // pn (Payee Name): Display name of the person or business (Ledgerly Group)
    // am (Amount): Exact price to charge, pre-populated
    // cu (Currency): Always INR
    // tn (Transaction Note): Brief text description or Order ID
    const params = new URLSearchParams({
      pa: targetVpa,
      pn: 'Ledgerly Group',
      am: amt.toFixed(2),
      cu: 'INR',
      tn: txNote,
      tr: txnRef,
    }).toString();
    const universalUri = `upi://pay?${params}`;

    // App-specific URI schemes or universal trigger
    let appUri = universalUri;
    if (selectedApp === 'GPay') {
      appUri = `tez://upi/pay?${params}`;
    } else if (selectedApp === 'PhonePe') {
      appUri = `phonepe://pay?${params}`;
    } else if (selectedApp === 'Paytm') {
      appUri = `paytmmp://pay?${params}`;
    } else if (selectedApp === 'BHIM') {
      appUri = `upi://pay?${params}`;
    }

    // Generate real scannable QR Code data URL using qrcode library
    let qrCodeUrl = '';
    try {
      qrCodeUrl = await QRCode.toDataURL(universalUri, {
        width: 280,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
    } catch (err) {
      console.warn('QR Code generation error:', err);
      qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(universalUri)}`;
    }

    const appConfig = apps.find((a) => a.name === selectedApp) || apps[0];
    const generatedUtr = Math.floor(100000000000 + Math.random() * 900000000000).toString();

    // Trigger launching the selected app via direct deep-link
    triggerUpiAppLaunch(appUri);

    // Open direct UPI modal with deep link details and no-callback verification
    setUpiPaymentModal({
      isOpen: true,
      app: selectedApp,
      appFullName: appConfig.fullName,
      appBrandColor: appConfig.brandColor,
      appUri,
      universalUri,
      amount: amt,
      payerUpi: payerUpi.trim() || 'gautam@okhdfcbank',
      targetMember,
      txnRef,
      transactionNote: txNote,
      utrNumber: generatedUtr,
      utrInput: '',
      uploadedScreenshot: null,
      screenshotFileName: null,
      qrCodeUrl,
      copiedLink: false,
      showQrOption: false,
      verifyMode: 'utr',
      isVerifying: false,
      step: 'app_switch',
    });

    onToast(`Launched direct UPI payment for ₹${amt.toFixed(0)}`);
    setPaymentStatus('idle');
  };

  // Handle UTR Input change (12 numeric digits)
  const handleUtrInputChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 12);
    setUpiPaymentModal((prev) => (prev ? { ...prev, utrInput: cleaned } : null));
  };

  // Quick autofill UTR for demo / testing convenience
  const handleAutoFillUtr = () => {
    if (!upiPaymentModal) return;
    setUpiPaymentModal((prev) => (prev ? { ...prev, utrInput: prev.utrNumber } : null));
    onToast('Filled 12-digit transaction reference number');
  };

  // Handle Screenshot Upload
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onToast('Please upload an image file (PNG/JPG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUpiPaymentModal((prev) =>
        prev
          ? {
              ...prev,
              uploadedScreenshot: dataUrl,
              screenshotFileName: file.name,
              verifyMode: 'screenshot',
            }
          : null
      );
      onToast('Payment screenshot attached');
    };
    reader.readAsDataURL(file);
  };

  // Verify and Credit Account (Handling the "No Callback" limitation)
  const handleVerifyAndCredit = () => {
    if (!upiPaymentModal || upiPaymentModal.isVerifying) return;

    const utr = upiPaymentModal.utrInput.trim() || upiPaymentModal.utrNumber;
    const screenshot = upiPaymentModal.uploadedScreenshot;

    // Start verification simulation
    setUpiPaymentModal((prev) => (prev ? { ...prev, isVerifying: true } : null));

    setTimeout(() => {
      setUpiPaymentModal((prev) =>
        prev
          ? {
              ...prev,
              isVerifying: false,
              step: 'confirmed',
            }
          : null
      );

      // Credit the ledger
      onTopUpUpi(
        upiPaymentModal.targetMember,
        upiPaymentModal.amount,
        upiPaymentModal.app,
        utr,
        screenshot || undefined
      );

      onToast(
        `✓ Verified UTR ${utr}! ₹${upiPaymentModal.amount.toFixed(0)} credited to ${upiPaymentModal.targetMember}`
      );

      // Auto close after 2.4s
      setTimeout(() => {
        setUpiPaymentModal(null);
      }, 2400);
    }, 1200);
  };

  // Copy Direct UPI Deep Link
  const handleCopyPaymentLink = () => {
    if (!upiPaymentModal) return;
    navigator.clipboard.writeText(upiPaymentModal.universalUri).catch(() => {});
    setUpiPaymentModal((prev) => (prev ? { ...prev, copiedLink: true } : null));
    onToast('Copied direct UPI deep link');
    setTimeout(() => {
      setUpiPaymentModal((prev) => (prev ? { ...prev, copiedLink: false } : null));
    }, 2000);
  };

  // 5. Open Modal for Existing Member
  const handleOpenEditModal = (member: Member) => {
    if (!canEditMember(member)) {
      onToast(`Users can only edit their own user settings (${currentUser?.name})`);
      return;
    }
    setActiveMemberId(member.id);
    setIsNewMemberMode(false);
    setModalMemberId(member.id);
    setModalName(member.fullName || member.name);
    setModalUpi(member.upi || `${member.name.toLowerCase()}@okhdfcbank`);
    setModalRole(member.role);
    setModalDob(member.dob || '08-03-1995');
    setModalPin(member.pin || '123456');
    setIsModalOpen(true);
  };

  // 6. Open Modal for Adding New Member
  const handleOpenAddModal = () => {
    if (!canAddMember) {
      onToast('Only Bankers and Admins have privilege to add new members');
      return;
    }
    setIsNewMemberMode(true);
    setModalMemberId('__NEW__');
    setModalName('');
    setModalUpi('');
    setModalRole('User');
    setModalDob('01-01-2000');
    setModalPin('123456');
    setIsModalOpen(true);
  };

  // 7. Save Member Modal Form
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrimmed = modalName.trim();
    if (!nameTrimmed) return;

    if (isNewMemberMode) {
      onAddMember(nameTrimmed, modalRole);
      onToast(`Member created: ${nameTrimmed}`);
    } else {
      const existing = members.find((m) => m.id === modalMemberId);
      if (existing) {
        onEditMember({
          ...existing,
          name: nameTrimmed.split(' ')[0],
          fullName: nameTrimmed,
          role: modalRole,
          upi: modalUpi.trim(),
          dob: modalDob.trim(),
          pin: modalPin.trim(),
        });
        onToast(`Saved changes for ${nameTrimmed.split(' ')[0]}`);
      }
    }

    setIsModalOpen(false);
  };

  // Member icon color mapping matching template
  const getMemberIconColor = (name: string) => {
    const key = name.toLowerCase().trim();
    switch (key) {
      case 'ananthan':
        return 'text-emerald-500';
      case 'deepak':
        return 'text-blue-600';
      case 'gautam':
        return 'text-amber-500';
      case 'lekshmi':
        return 'text-indigo-500';
      case 'sarath':
        return 'text-emerald-500';
      case 'ratheesh':
        return 'text-pink-500';
      default:
        return 'text-indigo-500';
    }
  };

  return (
    <main
      className="flex-1 px-3.5 py-3.5 max-w-md mx-auto w-full space-y-3.5 pb-24"
      data-purpose="member-management-panel"
    >
      {/* ========================================================= */}
      {/* 0. CURRENT USER PROFILE & PRIVILEGE CARD */}
      {/* ========================================================= */}
      {currentUser && (
        <section
          id="settings-active-user-card"
          className="bg-white rounded-2xl p-3.5 shadow-[0_3px_16px_rgba(0,0,0,0.04)] border border-slate-200/80"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
                style={{ backgroundColor: currentUser.color || '#5046e5' }}
              >
                {currentUser.avatarLetter}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-800">
                    {currentUser.fullName || currentUser.name}
                  </span>
                  <span
                    className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border ${
                      currentUser.role === 'Admin'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : currentUser.role === 'Banker'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>
                <div className="text-[10.5px] text-slate-500 font-mono mt-0.5">
                  UPI: {currentUser.upi || `${currentUser.name.toLowerCase()}@okhdfcbank`}
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                id="btn-settings-logout"
                onClick={onLogout}
                className="inline-flex items-center space-x-1 border border-slate-200 hover:bg-slate-50 text-slate-600 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shadow-xs cursor-pointer active:scale-95"
                title="Switch User / Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span>Switch</span>
              </button>
            )}
          </div>

          {/* Privilege details */}
          <div className="pt-2.5 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5046e5]" />
              <span>Assigned Privileges:</span>
            </div>
            {currentUser.role === 'Admin' && (
              <p className="text-[10.5px] text-indigo-900 leading-snug">
                <strong>Full Privileges:</strong> You have all options available: add transactions, edit/delete any transaction, change group UPI VPA/ID, add/remove members, and reset all application data.
              </p>
            )}
            {currentUser.role === 'Banker' && (
              <p className="text-[10.5px] text-amber-900 leading-snug">
                <strong>Banker Privileges:</strong> Add transactions, edit/delete any transaction, change group UPI VPA/ID, add members, and remove members. (Reset Data reserved for Admin).
              </p>
            )}
            {currentUser.role === 'User' && (
              <p className="text-[10.5px] text-emerald-900 leading-snug">
                <strong>User Privileges:</strong> Add transactions, edit/delete your own transactions, edit your user settings &amp; UPI ID. You can delete your account only if accumulated due is above zero.
              </p>
            )}
          </div>
        </section>
      )}
      {/* ========================================================= */}
      {/* 1. UPI QUICK PAY & TOP-UP CARD */}
      {/* ========================================================= */}
      <section
        className="bg-white rounded-2xl p-3.5 shadow-[0_3px_16px_rgba(0,0,0,0.04)] border border-slate-200/70"
        data-purpose="upi-payment-card"
      >
        {/* Card Section Header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2">
            <span className="text-[#5046e5] text-sm">
              <QrCode className="w-4 h-4" />
            </span>
            <h2 className="text-xs font-semibold text-slate-800 tracking-tight font-headline uppercase tracking-wider">
              UPI Quick Pay &amp; Top-Up
            </h2>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Instant Credit
          </span>
        </div>

        {/* UPI ID & QR Snippet Badge */}
        {!isEditingTargetVpa ? (
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-2.5 mb-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2.5 min-w-0 pr-2">
              <div
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#5046e5] shadow-sm shrink-0"
                style={{ color: 'var(--color-primary)' }}
              >
                <QrCode className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none">
                    UPI VPA / ID
                  </span>
                  {canEditTargetVpa && (
                    <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 leading-tight">
                      Admin/Banker
                    </span>
                  )}
                </div>
                <span
                  id="target-vpa-text"
                  className="text-xs font-bold text-slate-800 tracking-tight font-mono select-all truncate mt-0.5"
                >
                  {targetVpa}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              {/* Additional Edit Option Available ONLY for Admin and Banker */}
              {canEditTargetVpa && (
                <button
                  id="btn-edit-target-vpa"
                  type="button"
                  onClick={() => {
                    setTargetVpaInput(targetVpa);
                    setIsEditingTargetVpa(true);
                  }}
                  className="inline-flex items-center space-x-1 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 bg-white px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Edit Group UPI VPA/ID (Admin and Banker only)"
                >
                  <Edit2 className="w-3 h-3 text-slate-500" />
                  <span>Edit</span>
                </button>
              )}

              <button
                id="copy-vpa-btn"
                type="button"
                onClick={handleCopyVpa}
                className={`inline-flex items-center space-x-1.5 border px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all shadow-xs cursor-pointer active:scale-95 ${
                  copiedVpa
                    ? 'border-emerald-400 text-emerald-700 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 bg-white'
                }`}
              >
                {copiedVpa ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-500" />
                )}
                <span id="copy-vpa-label">{copiedVpa ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50/90 border border-indigo-200 rounded-xl p-2.5 mb-3 shadow-xs animate-in fade-in duration-150">
            <form
              id="target-vpa-edit-form"
              onSubmit={handleSaveTargetVpa}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                  <label
                    htmlFor="target-vpa-input"
                    className="text-[10px] uppercase font-bold tracking-wider text-indigo-950"
                  >
                    Edit Group UPI VPA / ID
                  </label>
                </div>
                <span className="text-[9px] text-indigo-700 font-medium bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                  Admin &amp; Banker
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <input
                  id="target-vpa-input"
                  type="text"
                  value={targetVpaInput}
                  onChange={(e) => setTargetVpaInput(e.target.value)}
                  placeholder="e.g. ledgerly@okhdfcbank"
                  className="flex-1 bg-white border border-indigo-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                  autoFocus
                />
                <button
                  type="submit"
                  id="save-target-vpa-btn"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  className="text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer shrink-0 flex items-center space-x-1"
                >
                  <Check className="w-3 h-3 stroke-[2.5]" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  id="cancel-target-vpa-btn"
                  onClick={() => setIsEditingTargetVpa(false)}
                  className="border border-slate-200 hover:bg-slate-100 text-slate-600 text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Member Selector & Amount Input Form */}
        <div className="space-y-2.5">
          {/* Quick Amount Pills */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-medium text-slate-600">
                Quick Amount
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Tap chip to fill
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-2" id="quick-amt-group">
              {[50, 100, 200, 500].map((amt) => {
                const isSelected = selectedQuickAmt === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectQuickAmt(amt)}
                    className={`quick-amt-btn py-1.5 px-2 rounded-lg text-xs transition-all text-center cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-[#5046e5]/10 border-2 border-[#5046e5] font-bold text-[#5046e5] shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 hover:border-slate-300 border border-slate-200 font-semibold text-slate-700'
                    }`}
                  >
                    ₹{amt}
                  </button>
                );
              })}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-slate-400 font-semibold font-mono">
                ₹
              </span>
              <input
                id="custom-amount-input"
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => handleAmountInputChange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-1.5 text-xs font-semibold placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Credit Top-Up To Member */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="topup-target-member-select" className="block text-[11px] font-medium text-slate-600">
                Credit Top-Up To
              </label>
              <span className="text-[10px] text-slate-400">Account to credit</span>
            </div>
            <div className="relative">
              <select
                id="topup-target-member-select"
                value={topUpTargetMember}
                onChange={(e) => setTopUpTargetMember(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs cursor-pointer"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.role}) — Bal: ₹{m.balanceAmount.toFixed(0)} ({m.balanceType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Direct UPI App Trigger Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-medium text-slate-600">
                Your UPI ID (Payer)
              </label>
              <span className="text-[10px] text-slate-400">Tap pen to edit</span>
            </div>
            <div
              id="payer-upi-wrapper"
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 shadow-xs transition-all"
            >
              {!isEditingPayerUpi ? (
                <div
                  id="payer-upi-display"
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span
                      id="payer-upi-text"
                      className="font-medium tracking-tight text-slate-800 font-mono text-xs select-all"
                    >
                      {payerUpi}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPayerUpiInput(payerUpi);
                      setIsEditingPayerUpi(true);
                    }}
                    title="Edit UPI ID"
                    className="text-slate-400 hover:text-indigo-600 transition-colors p-1 text-xs flex items-center space-x-1 ml-2 cursor-pointer active:scale-95"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <form
                  id="payer-upi-edit-form"
                  onSubmit={handleSavePayerUpi}
                  className="flex items-center space-x-2"
                >
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  <input
                    id="payer-upi-input"
                    type="text"
                    value={payerUpiInput}
                    onChange={(e) => setPayerUpiInput(e.target.value)}
                    className="flex-1 bg-transparent border-b border-indigo-500 text-xs text-slate-800 font-mono font-medium tracking-tight focus:outline-none py-0.5"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-[#5046e5] hover:bg-[#4338ca] text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow-xs transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingPayerUpi(false)}
                    className="text-slate-400 hover:text-slate-600 text-[11px] px-1 py-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Pay via App */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Pay via App
            </label>
            <div className="grid grid-cols-4 gap-1.5 mb-2.5" id="upi-app-group">
              {apps.map((app) => {
                const isSelected = selectedApp === app.name;
                return (
                  <button
                    key={app.name}
                    type="button"
                    id={`btn-pay-app-${app.name.toLowerCase()}`}
                    onClick={() => setSelectedApp(app.name)}
                    style={{
                      backgroundColor: app.brandColor,
                      color: '#ffffff',
                    }}
                    className={`pay-app-btn flex flex-col items-center justify-center p-2 rounded-lg text-center shadow-xs relative cursor-pointer transition-all active:scale-95 text-white ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-slate-800 shadow-sm scale-[1.02]'
                        : 'opacity-90 hover:opacity-100 hover:shadow-xs'
                    }`}
                  >
                    {isSelected && (
                      <span className="app-active-check absolute top-1 right-1 text-white bg-white/30 backdrop-blur-xs rounded-full p-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-white stroke-[2.5]" />
                      </span>
                    )}
                    <span
                      className="text-[11px] font-bold text-white tracking-wide select-none"
                      style={{ color: '#ffffff' }}
                    >
                      {app.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Action CTA */}
          <button
            id="primary-pay-btn"
            type="button"
            disabled={paymentStatus !== 'idle'}
            onClick={handleExecutePayment}
            style={{ backgroundColor: 'var(--color-primary, #5046e5)' }}
            className="w-full hover:opacity-95 active:scale-[0.99] text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-80"
          >
            {paymentStatus === 'routing' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : paymentStatus === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Zap className="w-3.5 h-3.5 fill-white" />
            )}
            <span id="pay-btn-label">
              {paymentStatus === 'routing'
                ? `Opening ${selectedApp}...`
                : `Pay ₹${customAmount || '0'} via ${selectedApp}`}
            </span>
          </button>
        </div>
      </section>

      {/* Visual Divider */}
      <div className="flex items-center space-x-3 px-2">
        <div className="h-px bg-slate-200/90 flex-1"></div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-headline">
          Member Directory
        </span>
        <div className="h-px bg-slate-200/90 flex-1"></div>
      </div>

      {/* ========================================================= */}
      {/* 2. MANAGE MEMBERS SECTION */}
      {/* ========================================================= */}
      <section
        className="bg-white rounded-2xl p-3.5 shadow-[0_3px_16px_rgba(0,0,0,0.04)] border border-slate-200/70"
        data-purpose="card-container"
      >
        {/* Card Section Title */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-[#5046e5] text-sm">
              <Users className="w-4 h-4" />
            </span>
            <h2 className="text-xs font-semibold text-slate-800 tracking-tight font-headline uppercase tracking-wider">
              Manage Members
            </h2>
            <span
              id="member-count-badge"
              className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md"
            >
              {members.length}
            </span>
          </div>
          {canAddMember ? (
            <button
              type="button"
              id="add-member-header-btn"
              onClick={handleOpenAddModal}
              className="inline-flex items-center space-x-1.5 bg-[#5046e5] hover:bg-[#4338ca] active:scale-95 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          ) : (
            <div
              className="inline-flex items-center space-x-1 text-slate-400 bg-slate-100 px-2 py-1 rounded-lg text-[10.5px] font-medium"
              title="Only Bankers and Admins have privilege to add new members"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Banker / Admin Only</span>
            </div>
          )}
        </div>

        {/* Member List Container (Live Rendered) */}
        <ul className="space-y-2" data-purpose="members-list" id="members-list-ul">
          {members.map((member) => {
            const isSelected = member.id === activeMemberId;
            const iconColor = getMemberIconColor(member.name);

            return (
              <li
                key={member.id}
                className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                  isSelected
                    ? 'border border-blue-300 bg-blue-50/30 hover:border-blue-400 shadow-xs'
                    : 'border border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center pl-1 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 w-28 shrink-0">
                    <User className={`w-3.5 h-3.5 ${iconColor} shrink-0`} />
                    <span className="font-bold text-xs text-slate-800 tracking-wide font-headline truncate">
                      {member.name}
                    </span>
                  </div>

                  {/* Role Badge Column - aligned in the exact same vertical line across all rows */}
                  <div className="flex items-center pl-1 shrink-0">
                    {member.role === 'Admin' && (
                      <span
                        className="w-16 justify-center inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-700 shadow-xs"
                        style={{
                          background: 'linear-gradient(135deg, #f1f5f9, #cbd5e1)',
                          border: '1px solid #94a3b8',
                        }}
                      >
                        <Shield className="w-2.5 h-2.5 text-slate-600 shrink-0" />
                        <span>Admin</span>
                      </span>
                    )}
                    {member.role === 'Banker' && (
                      <span
                        className="w-16 justify-center inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-amber-800 shadow-xs"
                        style={{
                          background: 'linear-gradient(135deg, #fef08a, #fde047)',
                          border: '1px solid #eab308',
                        }}
                      >
                        <Shield className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                        <span>Banker</span>
                      </span>
                    )}
                    {member.role === 'User' && (
                      <span
                        className="w-16 justify-center inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-orange-900 shadow-xs"
                        style={{
                          background: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
                          border: '1px solid #fb923c',
                        }}
                      >
                        <Shield className="w-2.5 h-2.5 text-orange-600 shrink-0" />
                        <span>User</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                  {canEditMember(member) ? (
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(member)}
                      className={
                        isSelected
                          ? 'inline-flex items-center space-x-1 bg-white border border-blue-300 hover:bg-blue-50 text-blue-600 px-2 py-1 rounded text-[11px] font-semibold transition-colors shadow-xs cursor-pointer active:scale-95'
                          : 'inline-flex items-center space-x-1 border border-slate-200 hover:bg-slate-50 text-slate-600 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer active:scale-95'
                      }
                      title={`Edit ${member.name}`}
                    >
                      <Edit2
                        className={`w-2.5 h-2.5 ${
                          isSelected ? 'text-blue-600' : 'text-slate-500'
                        }`}
                      />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div
                      className="inline-flex items-center space-x-1 border border-slate-100 bg-slate-50 text-slate-400 px-2 py-1 rounded text-[11px]"
                      title="Only the member themselves or Banker/Admin can edit this profile"
                    >
                      <Lock className="w-2.5 h-2.5 text-slate-400" />
                      <span>Locked</span>
                    </div>
                  )}

                  {/* Remove or Delete Self button according to privileges */}
                  {currentUser?.role === 'Admin' || currentUser?.role === 'Banker' ? (
                    deleteConfirmId === member.id ? (
                      <div className="flex items-center space-x-1 animate-in fade-in duration-150">
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(member)}
                          className="inline-flex items-center space-x-1 bg-[#e11d48] text-white hover:bg-[#be123c] px-2 py-1 rounded text-[11px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          <span>Confirm?</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="inline-flex items-center border border-slate-200 hover:bg-slate-100 text-slate-500 p-1 rounded text-[11px] transition-colors cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(member.id)}
                        className="inline-flex items-center space-x-1 border border-rose-200 hover:bg-rose-50 hover:border-rose-300 text-[#e11d48] px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer active:scale-95"
                        title={`Remove ${member.name}`}
                      >
                        <Trash2 className="w-2.5 h-2.5 text-[#e11d48]" />
                        <span>Remove</span>
                      </button>
                    )
                  ) : member.id === currentUser?.id ? (
                    deleteConfirmId === member.id ? (
                      <div className="flex items-center space-x-1 animate-in fade-in duration-150">
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(member)}
                          className="inline-flex items-center space-x-1 bg-[#e11d48] text-white hover:bg-[#be123c] px-2 py-1 rounded text-[11px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          <span>Delete Me?</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="inline-flex items-center border border-slate-200 hover:bg-slate-100 text-slate-500 p-1 rounded text-[11px] transition-colors cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const perm = getDeletePermission(member);
                          if (!perm.allowed) {
                            onToast(perm.reason || 'Cannot delete account');
                          } else {
                            setDeleteConfirmId(member.id);
                          }
                        }}
                        className="inline-flex items-center space-x-1 border border-rose-200 hover:bg-rose-50 hover:border-rose-300 text-[#e11d48] px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer active:scale-95"
                        title="Delete your own account (Allowed if accumulated due > 0)"
                      >
                        <Trash2 className="w-2.5 h-2.5 text-[#e11d48]" />
                        <span>Delete Self</span>
                      </button>
                    )
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ========================================================= */}
      {/* APPEARANCE & THEME SECTION (Admin Privilege Only)         */}
      {/* ========================================================= */}
      {currentUser?.role === 'Admin' && (
        <>
          {/* Visual Divider */}
          <div className="flex items-center space-x-3 px-2">
            <div className="h-px bg-slate-200/90 flex-1"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-headline">
              Appearance & Theme
            </span>
            <div className="h-px bg-slate-200/90 flex-1"></div>
          </div>

          {/* 1. TYPOGRAPHY & FONT SELECTION (LIST VIEW) */}
          <section
            className="bg-white rounded-2xl p-3.5 shadow-[0_3px_16px_rgba(0,0,0,0.04)] border border-slate-200/70"
            data-purpose="admin-font-settings"
          >
            {/* Header with Title and Quick Apply Button */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <Type className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-slate-800 tracking-tight font-headline uppercase tracking-wider">
                    Application Font
                  </h2>
                </div>
              </div>

              <button
                type="button"
                id="btn-quick-apply-font"
                onClick={handleApplyThemeAndFont}
                style={{ backgroundColor: 'var(--color-primary)' }}
                className="px-3 py-1.5 text-xs font-bold text-white rounded-lg shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center space-x-1"
                title="Apply selected font and theme system-wide"
              >
                <Check className="w-3 h-3 stroke-[2.5]" />
                <span>Apply</span>
              </button>
            </div>

            {/* Active font specimen pill */}
            <div
              className="p-2 rounded-xl border mb-2.5 flex items-center justify-between"
              style={{
                backgroundColor: 'var(--color-primary-light)',
                borderColor: 'var(--color-primary-border)',
              }}
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Selected:
                </span>
                <span
                  className="text-xs font-bold truncate"
                  style={{ color: 'var(--color-primary-text)' }}
                >
                  {pendingFont}
                </span>
              </div>
              <span className="text-[10.5px] font-mono text-slate-600 shrink-0 font-medium">
                ₹1,450.00 • Sample
              </span>
            </div>

            {/* Font Options List (Replaced Cards with List) */}
            <div
              className="border border-slate-200/80 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white"
              id="font-options-list"
            >
              {FONT_OPTIONS.map((font) => {
                const isSelected =
                  (pendingFont || 'Open Sans').toLowerCase() === font.name.toLowerCase() ||
                  (pendingFont || '').toLowerCase() === font.id.toLowerCase();

                return (
                  <button
                    key={font.id}
                    type="button"
                    id={`font-opt-${font.id}`}
                    onClick={() => setPendingFont(font.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors cursor-pointer group ${
                      isSelected ? 'bg-slate-50/90' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                          isSelected
                            ? 'text-white border-transparent'
                            : 'border-slate-300 bg-white group-hover:border-slate-400'
                        }`}
                        style={isSelected ? { backgroundColor: 'var(--color-primary)' } : undefined}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span
                            className="text-xs font-bold text-slate-900 font-preview-specimen"
                            data-font-preview="true"
                            style={
                              {
                                fontFamily: font.fontFamily,
                                '--preview-font': font.fontFamily,
                              } as React.CSSProperties
                            }
                          >
                            {font.name}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                              font.category === 'Serif'
                                ? 'bg-amber-100 text-amber-800'
                                : font.category === 'Display'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {font.category}
                          </span>
                        </div>
                        <p
                          className="text-[11px] text-slate-500 truncate mt-0.5 font-preview-specimen"
                          data-font-preview="true"
                          style={
                            {
                              fontFamily: font.fontFamily,
                              '--preview-font': font.fontFamily,
                            } as React.CSSProperties
                          }
                        >
                          ₹1,450.00 • The quick brown fox jumps
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold shrink-0 ${
                        isSelected ? 'text-indigo-600 font-bold' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                      style={isSelected ? { color: 'var(--color-primary)' } : undefined}
                    >
                      {isSelected ? 'Active' : 'Select'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. COLOR THEME SELECTION */}
          <section
            className="bg-white rounded-2xl p-3.5 shadow-[0_3px_16px_rgba(0,0,0,0.04)] border border-slate-200/70"
            data-purpose="admin-color-theme-settings"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-slate-800 tracking-tight font-headline uppercase tracking-wider">
                    Color Theme
                  </h2>
                </div>
              </div>

              <button
                type="button"
                id="btn-quick-apply-theme"
                onClick={handleApplyThemeAndFont}
                style={{ backgroundColor: 'var(--color-primary)' }}
                className="px-3 py-1.5 text-xs font-bold text-white rounded-lg shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center space-x-1"
                title="Apply selected font and theme system-wide"
              >
                <Check className="w-3 h-3 stroke-[2.5]" />
                <span>Apply</span>
              </button>
            </div>

            {/* Active Theme Preview Banner */}
            {(() => {
              const currentThemeObj =
                COLOR_THEMES.find((t) => t.id === pendingTheme) || COLOR_THEMES[0];
              return (
                <div
                  className="p-2.5 rounded-xl border mb-3 flex flex-wrap items-center justify-between gap-2"
                  style={{
                    backgroundColor: currentThemeObj.light,
                    borderColor: currentThemeObj.border,
                  }}
                >
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="w-5 h-5 rounded-full shadow-xs ring-2 ring-white"
                      style={{ backgroundColor: currentThemeObj.primary }}
                    ></div>
                    <div>
                      <div
                        className="text-xs font-bold leading-none"
                        style={{ color: currentThemeObj.text }}
                      >
                        {currentThemeObj.name}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {currentThemeObj.primary}
                      </span>
                    </div>
                  </div>

                  {/* Micro live UI badge */}
                  <div className="flex items-center space-x-1.5">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs text-white"
                      style={{ backgroundColor: currentThemeObj.primary }}
                    >
                      Button
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor: currentThemeObj.badgeBg,
                        borderColor: currentThemeObj.border,
                        color: currentThemeObj.text,
                      }}
                    >
                      ₹250 Cr
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* 20 Color Themes Grid */}
            <div
              className="grid grid-cols-4 sm:grid-cols-5 gap-2"
              id="color-themes-grid"
            >
              {COLOR_THEMES.map((theme) => {
                const isSelected = (pendingTheme || 'indigo') === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    id={`theme-opt-${theme.id}`}
                    onClick={() => setPendingTheme(theme.id)}
                    title={`${theme.name} (${theme.primary})`}
                    className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer relative active:scale-95 group ${
                      isSelected
                        ? 'border-slate-800 bg-slate-50 shadow-xs ring-2 ring-slate-800/10'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Swatch circle */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 relative"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow-xs" />
                      )}
                    </div>

                    {/* Short title */}
                    <span
                      className={`text-[9.5px] mt-1.5 leading-tight text-center truncate max-w-full font-sans ${
                        isSelected
                          ? 'font-bold text-slate-900'
                          : 'font-medium text-slate-600 group-hover:text-slate-800'
                      }`}
                    >
                      {theme.name.replace(' Classic', '').replace(' Electric', '').replace(' Deep', '')}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. DEDICATED APPLY BUTTON SYSTEM-WIDE CARD */}
          <section
            className="bg-white rounded-2xl p-3.5 shadow-[0_3px_16px_rgba(0,0,0,0.04)] border border-slate-200/70 flex items-center justify-between gap-3"
            data-purpose="apply-system-wide-card"
          >
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-800 font-headline uppercase tracking-wider">
                Apply System-Wide
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                Selected: <strong className="text-slate-800 font-semibold">{pendingFont}</strong> &bull; <strong className="text-slate-800 font-semibold">{COLOR_THEMES.find((t) => t.id === pendingTheme)?.name || pendingTheme}</strong>
              </p>
            </div>

            <button
              type="button"
              id="apply-theme-font-btn"
              onClick={handleApplyThemeAndFont}
              style={{ backgroundColor: 'var(--color-primary)' }}
              className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5 shrink-0"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Apply</span>
            </button>
          </section>
        </>
      )}

      {/* Visual Divider */}
      <div className="flex items-center space-x-3 px-2">
        <div className="h-px bg-slate-200/90 flex-1"></div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-headline">
          Data & System
        </span>
        <div className="h-px bg-slate-200/90 flex-1"></div>
      </div>

      {/* 3. RESET DATA SECTION (Admin Privilege Only) */}
      {currentUser?.role === 'Admin' ? (
        <section
          className="bg-white rounded-2xl p-3.5 shadow-[0_3px_16px_rgba(0,0,0,0.04)] border border-slate-200/70"
          data-purpose="reset-data-section"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#e11d48] shrink-0 mt-0.5">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-semibold text-slate-800 tracking-tight font-headline uppercase tracking-wider">
                  Reset Application Data
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Restore initial members, transaction histories, and default balances.
                </p>
              </div>
            </div>
          </div>

          {/* Action / Confirmation Area */}
          {showResetConfirm ? (
            <div className="mt-3 p-3 bg-rose-50/70 rounded-xl border border-rose-200 animate-in fade-in duration-150">
              <div className="flex items-start space-x-2 text-rose-800 text-[11px] mb-2.5">
                <AlertTriangle className="w-4 h-4 text-[#e11d48] shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-semibold block">Are you absolutely sure?</span>
                  <span className="text-rose-700 text-[10.5px]">
                    This will wipe all recorded transactions, custom members, and balance edits, resetting everything back to factory initial data.
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-1 border-t border-rose-200/60">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-reset-data-btn"
                  onClick={handleExecuteReset}
                  className="px-3 py-1 text-xs font-bold text-white bg-[#e11d48] hover:bg-[#be123c] rounded-lg shadow-xs cursor-pointer active:scale-95 transition-all flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Yes, Reset Everything</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Local Storage Active</span>
              </div>
              <button
                type="button"
                id="reset-data-btn"
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center space-x-1.5 border border-rose-200 bg-rose-50/60 hover:bg-rose-100/80 hover:border-rose-300 text-[#e11d48] active:scale-95 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            </div>
          )}
        </section>
      ) : (
        <section
          className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/70"
          data-purpose="reset-data-locked"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-200/70 flex items-center justify-center text-slate-500 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-semibold text-slate-700 tracking-tight font-headline uppercase tracking-wider">
                  Reset Application Data
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Locked: Only users with <strong>Admin</strong> privilege have permission to reset system data.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 border border-slate-300">
              Admin Only
            </span>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 3. EDIT / ADD MEMBER MODAL (Matching User Design) */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div
          id="edit-member-modal"
          data-purpose="edit-member-modal"
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs transition-all"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 w-full max-w-md mx-auto relative animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header with user avatar, title & status badge */}
            <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                {/* Dynamic Avatar */}
                <div
                  id="modal-avatar-badge"
                  className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-sm shadow-sm ring-2 ${
                    isNewMemberMode
                      ? 'bg-[#5046e5] text-white ring-indigo-100'
                      : 'bg-blue-600 text-white ring-blue-100'
                  }`}
                >
                  {isNewMemberMode ? '+' : modalName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3
                    id="modal-title-heading"
                    className="text-sm font-bold text-slate-800 tracking-tight leading-tight"
                  >
                    {isNewMemberMode ? 'Add New Member' : `Edit ${modalName.split(' ')[0]}`}
                  </h3>
                  <div className="inline-flex items-center space-x-1.5 mt-0.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1"></span>
                      Status: Active
                    </span>
                    <span
                      id="modal-role-pill"
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        modalRole === 'Admin'
                          ? 'bg-slate-100 text-slate-800 border-slate-300'
                          : modalRole === 'Banker'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-orange-50 text-orange-800 border-orange-300'
                      }`}
                    >
                      {modalRole}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close Modal"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Edit Member Form */}
            <form id="edit-member-form" onSubmit={handleSaveModal} className="space-y-3">
              {/* 1. Full Name Field */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 text-xs">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <input
                    id="edit-member-name-input"
                    type="text"
                    required
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    placeholder="Full legal name or display name"
                    className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* 2. UPI ID / VPA Field with Verify badge */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  UPI ID / VPA
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 text-xs">
                    <QrCode className="w-3.5 h-3.5" />
                  </span>
                  <input
                    id="edit-member-upi-input"
                    type="text"
                    value={modalUpi}
                    onChange={(e) => setModalUpi(e.target.value)}
                    placeholder="e.g. member@okhdfcbank"
                    className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-20 py-1.5 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-xs"
                  />
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                    <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md px-1.5 py-0.5 text-[10px] font-bold">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. User Privilege Dropdown */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  User Privilege {currentUser?.role === 'User' && <span className="text-[10px] text-slate-400 font-normal">(Admin Only)</span>}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-amber-500 text-xs">
                    <Shield className="w-3.5 h-3.5" />
                  </span>
                  {currentUser?.role === 'User' ? (
                    <input
                      type="text"
                      disabled
                      value="🛡️ User (Standard Member - Bronze)"
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-500 font-medium cursor-not-allowed shadow-xs"
                    />
                  ) : (
                    <select
                      id="edit-member-privilege-select"
                      value={modalRole}
                      onChange={(e) => setModalRole(e.target.value as Role)}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-8 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-xs appearance-none cursor-pointer"
                    >
                      <option value="User">🛡️ User (Standard Member - Bronze)</option>
                      <option value="Banker">🛡️ Banker (Treasury Manager - Gold)</option>
                      <option value="Admin">🛡️ Admin (Full Access - Platinum)</option>
                    </select>
                  )}
                  {currentUser?.role !== 'User' && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                  )}
                </div>
                {currentUser?.role === 'User' && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Role assignment can only be changed by an Administrator.
                  </p>
                )}
              </div>

              {/* 4 & 5. Date of Birth & Security PIN Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <input
                      id="edit-member-dob-input"
                      type="text"
                      required
                      value={modalDob}
                      onChange={(e) => setModalDob(e.target.value)}
                      placeholder="DD-MM-YYYY"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Security PIN
                  </label>
                  <div className="relative">
                    <input
                      id="edit-member-pin-input"
                      type="password"
                      required
                      maxLength={6}
                      value={modalPin}
                      onChange={(e) => setModalPin(e.target.value)}
                      placeholder="••••••"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 tracking-widest focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 -mt-0.5 flex items-center space-x-1">
                <Info className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Enter current PIN to confirm updates</span>
              </p>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-2">
                {!isNewMemberMode ? (
                  (() => {
                    const existing = members.find((m) => m.id === modalMemberId);
                    if (!existing) return <div></div>;
                    if (currentUser?.role === 'User' && existing.id !== currentUser.id) {
                      return <div></div>;
                    }
                    const perm = getDeletePermission(existing);
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          if (!perm.allowed) {
                            onToast(perm.reason || 'Cannot delete member');
                            return;
                          }
                          handleConfirmDelete(existing);
                          setIsModalOpen(false);
                        }}
                        className="inline-flex items-center space-x-1 text-[#e11d48] hover:text-[#be123c] hover:bg-rose-50 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        title={
                          currentUser?.role === 'User'
                            ? `Delete account (Accumulated due must be above zero)`
                            : `Delete ${existing.name}`
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{currentUser?.role === 'User' ? 'Delete My Account' : 'Delete Member'}</span>
                      </button>
                    );
                  })()
                ) : (
                  <div></div>
                )}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors shadow-xs bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-[#5046e5] hover:bg-[#4338ca] active:scale-95 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. ACTIVE UPI PAYMENT REQUEST SHEET / MODAL */}
      {/* ========================================================= */}
      {upiPaymentModal && (
        <div
          id="upi-payment-modal"
          data-purpose="upi-payment-modal"
          onClick={() => setUpiPaymentModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4 backdrop-blur-xs transition-all animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-100 w-full max-w-sm mx-auto relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden space-y-3"
          >
            {/* Top decorative bar reflecting app color */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: upiPaymentModal.appBrandColor }}
            />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs"
                  style={{ backgroundColor: upiPaymentModal.appBrandColor }}
                >
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 leading-tight">
                    {upiPaymentModal.step === 'app_switch' && 'Direct UPI Deep Link'}
                    {upiPaymentModal.step === 'verify' && 'Verify & Credit Account'}
                    {upiPaymentModal.step === 'confirmed' && 'Payment Verified & Credited'}
                  </h3>
                  <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-medium">
                    <span>
                      {upiPaymentModal.step === 'app_switch' && 'System App Switch via upi://pay'}
                      {upiPaymentModal.step === 'verify' && 'Manual UTR / Screenshot verification'}
                      {upiPaymentModal.step === 'confirmed' && 'Ledger account balance updated'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                id="close-upi-modal-btn"
                onClick={() => setUpiPaymentModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ========================================================= */}
            {/* STEP 1: DIRECT UPI LINK STRUCTURE & APP SWITCH            */}
            {/* ========================================================= */}
            {upiPaymentModal.step === 'app_switch' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                {/* 1. Formatted URL Card (upi://pay?...) */}
                <div className="bg-slate-900 text-slate-200 rounded-xl p-3 text-xs space-y-1.5 shadow-xs border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Direct UPI Link Format</span>
                    </span>
                    <button
                      type="button"
                      id="copy-direct-upi-link-btn"
                      onClick={handleCopyPaymentLink}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer font-mono normal-case active:scale-95"
                    >
                      {upiPaymentModal.copiedLink ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div
                    id="direct-upi-formatted-url"
                    className="font-mono text-[10.5px] bg-slate-950 p-2 rounded-lg text-emerald-400 break-all select-all leading-relaxed max-h-16 overflow-y-auto border border-slate-800/80"
                  >
                    {upiPaymentModal.universalUri}
                  </div>
                </div>

                {/* 2. Decoded UPI Parameters Breakdown (pa, pn, am, cu, tn) */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 space-y-1 text-xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 flex items-center justify-between">
                    <span>Pre-Populated Attributes:</span>
                    <span className="text-indigo-600 font-mono">5 Parameters</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200/70">
                      <span className="text-slate-400 font-mono font-bold">pa: </span>
                      <span className="font-mono font-bold text-slate-800 text-[10px]">
                        {targetVpa}
                      </span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200/70">
                      <span className="text-slate-400 font-mono font-bold">pn: </span>
                      <span className="font-semibold text-slate-800 text-[10.5px]">Ledgerly Group</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200/70">
                      <span className="text-slate-400 font-mono font-bold">am: </span>
                      <span className="font-mono font-bold text-emerald-700 text-xs">
                        ₹{upiPaymentModal.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200/70">
                      <span className="text-slate-400 font-mono font-bold">cu: </span>
                      <span className="font-mono font-bold text-slate-800">INR</span>
                    </div>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200/70 text-[10.5px] truncate">
                    <span className="text-slate-400 font-mono font-bold">tn: </span>
                    <span className="font-mono text-slate-700">{upiPaymentModal.transactionNote}</span>
                  </div>
                </div>

                {/* 3. The Trigger: App Switch System Prompt Button */}
                <div className="space-y-2 pt-1">
                  <a
                    href={upiPaymentModal.appUri}
                    id="trigger-upi-deep-link-btn"
                    onClick={() => {
                      triggerUpiAppLaunch(upiPaymentModal.appUri);
                      setUpiPaymentModal((prev) => (prev ? { ...prev, step: 'verify' } : null));
                    }}
                    style={{ backgroundColor: upiPaymentModal.appBrandColor }}
                    className="w-full text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-xs hover:opacity-95 active:scale-[0.99] flex items-center justify-center space-x-2 transition-all cursor-pointer text-center"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>
                      {upiPaymentModal.app === 'BHIM'
                        ? 'Open BHIM UPI / App Switch'
                        : `Open ${upiPaymentModal.appFullName} / App Switch`}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80 ml-0.5" />
                  </a>

                  <button
                    type="button"
                    id="goto-verify-step-btn"
                    onClick={() =>
                      setUpiPaymentModal((prev) => (prev ? { ...prev, step: 'verify' } : null))
                    }
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <span>Paid in UPI App? Verify &amp; Credit</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>

                {/* 4. Alternative Option: Pay via QR Code (Collapsible) */}
                <div className="border-t border-slate-100 pt-1.5">
                  <button
                    type="button"
                    id="toggle-qr-option-btn"
                    onClick={() =>
                      setUpiPaymentModal((prev) =>
                        prev ? { ...prev, showQrOption: !prev.showQrOption } : null
                      )
                    }
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-1.5">
                      <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        {upiPaymentModal.showQrOption
                          ? 'Hide QR Code'
                          : 'Alternative Option: Pay via QR Code'}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        upiPaymentModal.showQrOption ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {upiPaymentModal.showQrOption && (
                    <div className="text-center my-2 p-2.5 bg-slate-50/70 rounded-xl border border-slate-200 animate-in fade-in duration-150">
                      <div className="inline-block p-2 bg-white rounded-xl border border-slate-200 shadow-xs">
                        {upiPaymentModal.qrCodeUrl ? (
                          <img
                            id="upi-payment-qr"
                            src={upiPaymentModal.qrCodeUrl}
                            alt="UPI Payment QR Code"
                            className="w-32 h-32 mx-auto rounded-lg"
                          />
                        ) : (
                          <div className="w-32 h-32 flex items-center justify-center text-slate-400">
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                          </div>
                        )}
                      </div>
                      <p className="text-[10.5px] text-slate-500 mt-1 font-medium">
                        Scan with any UPI app to open link with ₹{upiPaymentModal.amount.toFixed(0)} pre-filled
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 2: RESOLVING THE "NO CALLBACK" LIMITATION           */}
            {/* ========================================================= */}
            {upiPaymentModal.step === 'verify' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                {/* Explanatory Banner: The "No Callback" Problem */}
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-amber-900 leading-snug">
                  <div className="font-bold flex items-center space-x-1 text-amber-950 mb-0.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Direct Deep Link Verification</span>
                  </div>
                  <p className="text-[10.5px] text-amber-800">
                    Direct UPI links do not receive automated gateway webhooks. Confirm your payment using your 12-digit UTR or upload a screenshot to credit your account:
                  </p>
                </div>

                {/* Verification Method Switch (UTR vs Screenshot) */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    id="verify-tab-utr-btn"
                    onClick={() =>
                      setUpiPaymentModal((prev) =>
                        prev ? { ...prev, verifyMode: 'utr' } : null
                      )
                    }
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                      upiPaymentModal.verifyMode === 'utr'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>12-Digit UTR</span>
                  </button>
                  <button
                    type="button"
                    id="verify-tab-screenshot-btn"
                    onClick={() =>
                      setUpiPaymentModal((prev) =>
                        prev ? { ...prev, verifyMode: 'screenshot' } : null
                      )
                    }
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                      upiPaymentModal.verifyMode === 'screenshot'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>Screenshot</span>
                  </button>
                </div>

                {/* Tab 1: 12-Digit Bank UTR Input */}
                {upiPaymentModal.verifyMode === 'utr' && (
                  <div className="space-y-2 bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="upi-utr-input"
                        className="font-semibold text-slate-700 text-[11px]"
                      >
                        Bank Reference (UTR) Number
                      </label>
                      <button
                        type="button"
                        id="autofill-demo-utr-btn"
                        onClick={handleAutoFillUtr}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                      >
                        Fill Demo UTR
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        id="upi-utr-input"
                        type="text"
                        maxLength={12}
                        value={upiPaymentModal.utrInput}
                        onChange={(e) => handleUtrInputChange(e.target.value)}
                        placeholder="e.g. 429104829103 (12 digits)"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Located in {upiPaymentModal.appFullName} payment receipt under "UPI Transaction ID" or "Bank Ref No."
                    </p>
                  </div>
                )}

                {/* Tab 2: Screenshot Upload */}
                {upiPaymentModal.verifyMode === 'screenshot' && (
                  <div className="space-y-2 bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs">
                    <div className="font-semibold text-slate-700 text-[11px] mb-1">
                      Upload Payment Success Screenshot
                    </div>

                    {upiPaymentModal.uploadedScreenshot ? (
                      <div className="bg-white border border-emerald-300 rounded-xl p-2.5 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center space-x-2 truncate">
                          <img
                            src={upiPaymentModal.uploadedScreenshot}
                            alt="Receipt Preview"
                            className="w-8 h-8 rounded object-cover border border-slate-200"
                          />
                          <div className="truncate">
                            <span className="font-semibold text-slate-800 text-xs block truncate">
                              {upiPaymentModal.screenshotFileName || 'receipt.png'}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                              <Check className="w-2.5 h-2.5" />
                              <span>Receipt Ready for Verification</span>
                            </span>
                          </div>
                        </div>
                        <label
                          htmlFor="replace-screenshot-file-input"
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer shrink-0 ml-2"
                        >
                          Change
                          <input
                            id="replace-screenshot-file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleScreenshotUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <label
                        htmlFor="upi-screenshot-file-input"
                        className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-slate-50/80"
                      >
                        <Upload className="w-5 h-5 text-indigo-500 mb-1" />
                        <span className="text-xs font-bold text-slate-700">
                          Tap to Upload Receipt
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          PNG, JPG or Screenshot of Success Screen
                        </span>
                        <input
                          id="upi-screenshot-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}

                {/* Verify and Credit Action Button */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    id="verify-and-credit-btn"
                    disabled={upiPaymentModal.isVerifying}
                    onClick={handleVerifyAndCredit}
                    style={{ backgroundColor: 'var(--color-primary, #5046e5)' }}
                    className="w-full text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-xs hover:opacity-95 active:scale-[0.99] flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-80"
                  >
                    {upiPaymentModal.isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Verifying with Bank Ledger...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>
                          Verify &amp; Credit ₹{upiPaymentModal.amount.toFixed(0)} to {upiPaymentModal.targetMember}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    id="back-to-deep-link-btn"
                    onClick={() =>
                      setUpiPaymentModal((prev) =>
                        prev ? { ...prev, step: 'app_switch' } : null
                      )
                    }
                    className="w-full text-slate-500 hover:text-slate-800 text-[11px] font-semibold py-1 transition-colors cursor-pointer text-center"
                  >
                    ← Back to Deep Link &amp; App Switch
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 3: CONFIRMED & CREDITED TO ACCOUNT                   */}
            {/* ========================================================= */}
            {upiPaymentModal.step === 'confirmed' && (
              <div className="space-y-3 py-3 text-center animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                  <CheckCheck className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Payment Verified &amp; Credited!
                  </h4>
                  <p className="text-xs font-semibold text-emerald-600 mt-1">
                    ₹{upiPaymentModal.amount.toFixed(2)} Credited to {upiPaymentModal.targetMember}'s Account
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    UTR: {upiPaymentModal.utrInput || upiPaymentModal.utrNumber}
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-800 font-medium">
                  ✓ Ledger updated • Direct UPI Transaction registered
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};
