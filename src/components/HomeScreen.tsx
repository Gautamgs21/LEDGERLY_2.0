import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowDown,
  ArrowUp,
  Users,
  Copy,
  BarChart2,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ChevronDown,
  Coffee,
  Utensils,
  Bus,
  Tag,
  Crown,
  Check,
} from 'lucide-react';
import { Member, Transaction, ChartType } from '../types';

interface HomeScreenProps {
  currentUser?: Member | null;
  members: Member[];
  transactions: Transaction[];
  onSelectMemberFilter?: (memberId: string) => void;
  onToast: (msg: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentUser,
  members,
  transactions,
  onSelectMemberFilter,
  onToast,
}) => {
  const [chartView, setChartView] = useState<ChartType>('line');
  const [analyticsMember, setAnalyticsMember] = useState<string>('all');
  const [categoryMonth, setCategoryMonth] = useState<string>('sep');
  const [copied, setCopied] = useState<boolean>(false);

  // Calculate Net balance, total debt, and total credit
  const totalDebt = members
    .filter((m) => m.balanceType === 'Debt')
    .reduce((acc, m) => acc + m.balanceAmount, 0);

  const totalCredit = members
    .filter((m) => m.balanceType === 'Credit')
    .reduce((acc, m) => acc + m.balanceAmount, 0);

  const netBalance = totalCredit - totalDebt;

  // Handle copying balances
  const handleCopyBalances = () => {
    const lines = [
      '📊 Ledgerly Group Balances:',
      ...members.map(
        (m) =>
          `• ${m.name}: ${m.balanceType === 'Credit' ? '+₹' : '₹'}${m.balanceAmount} (${m.balanceType})${
            m.isTopCredit ? ' 👑' : ''
          }`
      ),
      `\nTotal Credit: ₹${totalCredit}`,
      `Total Debt: ₹${totalDebt}`,
      `Net Pool: ${netBalance >= 0 ? '+' : ''}₹${netBalance}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    onToast('Balances copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Spending analytics data for the active member filter
  // Baseline values from prompt image
  const isAll = analyticsMember === 'all';
  const augSpending = isAll ? 3245 : analyticsMember === 'lekshmi' ? 2392 : analyticsMember === 'deepak' ? 475 : 378;
  const sepSpending = isAll ? 1368 : analyticsMember === 'gautam' ? 180 : analyticsMember === 'ananthan' ? 180 : 508;

  // Spending by category calculations
  const categories = [
    {
      id: 'tea',
      name: 'Tea',
      icon: Coffee,
      color: '#6366f1',
      amount: 2572,
      percent: 65,
    },
    {
      id: 'food',
      name: 'Food',
      icon: Utensils,
      color: '#f43f5e',
      amount: 926,
      percent: 25,
    },
    {
      id: 'travel',
      name: 'Travel',
      icon: Bus,
      color: '#3b82f6',
      amount: 615,
      percent: 16,
    },
    {
      id: 'gift',
      name: 'Gift',
      icon: Tag,
      color: '#64748b',
      amount: 500,
      percent: 12,
    },
  ];

  return (
    <div className="px-3.5 pt-3.5 pb-20 space-y-3 flex-1">
      {/* 1. Executive Metric Summary (Unified Heroic Balance Card) */}
      <section
        id="section-metrics-summary"
        className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] border border-slate-100/80"
      >
        {/* Prominent Net Balance Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
              NET BALANCE
            </span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-[26px] font-extrabold text-[#0fa958] leading-tight tracking-tight">
                ₹{netBalance}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#e6f7ef] text-[#0fa958] text-[11px] font-semibold">
            <TrendingUp className="w-3 h-3 stroke-[2.5]" />
            <span>+{netBalance >= 0 ? `₹${netBalance}` : `-₹${Math.abs(netBalance)}`} Net</span>
          </div>
        </div>

        {/* Flanked Side-by-Side Condensed Pill Cards for Total Debt & Credit */}
        <div className="grid grid-cols-2 gap-2.5 pt-3">
          {/* Total Debt Pill Card */}
          <div className="bg-[#fdf8f8] border border-rose-100/70 rounded-xl p-2.5 flex items-center justify-between">
            <div>
              <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">
                TOTAL DEBT
              </span>
              <span className="text-[15px] font-bold text-[#ea4335] leading-snug">
                ₹{totalDebt}
              </span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-[#fdeeed] text-[#ea4335] flex items-center justify-center text-xs">
              <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          {/* Total Credit Pill Card */}
          <div className="bg-[#f6fbf8] border border-emerald-100/70 rounded-xl p-2.5 flex items-center justify-between">
            <div>
              <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">
                TOTAL CREDIT
              </span>
              <span className="text-[15px] font-bold text-[#0fa958] leading-snug">
                ₹{totalCredit}
              </span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-[#e6f7ef] text-[#0fa958] flex items-center justify-center text-xs">
              <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Balances Section (2-Column Compact Grid Layout) */}
      <section
        id="section-balances-list"
        className="bg-white rounded-2xl p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] border border-slate-100/80"
      >
        {/* Balances Header */}
        <div className="flex items-center justify-between mb-3 px-0.5">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-[#5c54db]" />
            <h2 className="font-bold text-[13.5px] text-slate-800">Balances</h2>
          </div>
          <button
            id="btn-copy-balances"
            type="button"
            onClick={handleCopyBalances}
            className="flex items-center space-x-1.5 border border-slate-200/90 rounded-md px-2.5 py-1 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer active:scale-95"
          >
            {copied ? (
              <Check className="w-3 h-3 text-[#10b981]" />
            ) : (
              <Copy className="w-3 h-3 text-[#5c54db]" />
            )}
            <span className="text-[11.5px] font-medium leading-none">
              {copied ? 'Copied' : 'Copy'}
            </span>
          </button>
        </div>

        {/* 2-Column Condensed Grid for Members */}
        <div className="grid grid-cols-2 gap-2">
          {members.map((member) => {
            const isDebt = member.balanceType === 'Debt';
            const isRatheesh = member.id === 'ratheesh';

            return (
              <div
                key={member.id}
                id={`member-balance-card-${member.id}`}
                onClick={() => onSelectMemberFilter && onSelectMemberFilter(member.id)}
                className="p-2 rounded-xl border border-slate-100 bg-[#fdfdfd] flex flex-col justify-between space-y-2 hover:border-slate-200 transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-7 h-7 rounded-full text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.avatarLetter}
                  </div>
                  <div className="flex items-center space-x-1 min-w-0 flex-1">
                    <span className="text-[12px] font-semibold text-slate-800 truncate">
                      {member.name}
                    </span>
                    {member.isTopCredit && (
                      <Crown
                        className="w-2.5 h-2.5 text-[#f59e0b] fill-[#f59e0b] shrink-0"
                        title="Top Credit"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                  <span
                    className={`text-[17px] font-bold tracking-tight ${
                      isDebt
                        ? 'text-[#eb4d4b]'
                        : isRatheesh
                        ? 'text-[#f97316]'
                        : 'text-[#10b981]'
                    }`}
                  >
                    {isDebt ? `₹${member.balanceAmount}` : `₹ +${member.balanceAmount}`}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[9.5px] font-medium shrink-0 ml-1 ${
                      isDebt
                        ? 'bg-[#fdeeee] text-[#eb4d4b]'
                        : isRatheesh
                        ? 'bg-[#fdeeee] text-[#f97316] border border-[#f97316]/30'
                        : 'bg-[#eafaf1] text-[#10b981]'
                    }`}
                  >
                    {member.balanceType}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Spending Analytics Section */}
      <section
        id="section-spending-analytics"
        className="bg-white rounded-2xl p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] border border-slate-100/80"
      >
        {/* Analytics Header */}
        <div className="flex items-center justify-between mb-3 px-0.5">
          <div className="flex items-center space-x-1.5">
            <BarChart2 className="w-4 h-4 text-[#5c54db]" />
            <h2 className="font-bold text-[13.5px] text-slate-800">Spending Analytics</h2>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Segmented Chart View Toggle */}
            <div
              id="chart-tabs"
              className="flex items-center bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/60"
            >
              <button
                id="tab-btn-bar"
                type="button"
                aria-label="Bar Chart"
                onClick={() => setChartView('bar')}
                className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] transition-all cursor-pointer ${
                  chartView === 'bar'
                    ? 'bg-white text-[#5c54db] shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Bar Chart"
              >
                <BarChart2 className="w-3.5 h-3.5" />
              </button>
              <button
                id="tab-btn-line"
                type="button"
                aria-label="Line Chart"
                onClick={() => setChartView('line')}
                className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] transition-all cursor-pointer ${
                  chartView === 'line'
                    ? 'bg-white text-[#5c54db] shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Line Chart"
              >
                <LineChartIcon className="w-3.5 h-3.5" />
              </button>
              <button
                id="tab-btn-pie"
                type="button"
                aria-label="Pie Chart"
                onClick={() => setChartView('pie')}
                className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] transition-all cursor-pointer ${
                  chartView === 'pie'
                    ? 'bg-white text-[#5c54db] shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Pie Chart"
              >
                <PieChartIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Member Filter Dropdown */}
            <div className="relative flex items-center">
              <select
                id="select-analytics-member"
                aria-label="Filter by member"
                value={analyticsMember}
                onChange={(e) => setAnalyticsMember(e.target.value)}
                className="appearance-none bg-white border border-slate-200/90 rounded-full pl-2 pr-5 py-0.5 text-[9.5px] font-semibold tracking-wider text-slate-600 shadow-2xs focus:outline-none cursor-pointer"
              >
                <option value="all">ALL</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-2.5 h-2.5 text-slate-400 absolute right-1.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 1. Bar Chart View */}
        {chartView === 'bar' && (
          <div id="chart-view-bar" className="pt-2 pb-1">
            <div className="grid grid-cols-6 gap-2 h-28 items-end text-center">
              {['Apr', 'May', 'Jun', 'Jul'].map((month) => (
                <div key={month} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[8.5px] text-slate-700 font-semibold mb-1">₹0</span>
                  <div className="w-full max-w-[28px] h-3 bg-[#ecf2f7] rounded-md transition-all"></div>
                  <span className="text-[9.5px] font-medium text-slate-400 mt-2">{month}</span>
                </div>
              ))}
              <div className="flex flex-col items-center h-full justify-end group">
                <span className="text-[8px] font-bold text-slate-800 mb-1">₹{augSpending}</span>
                <div
                  className="w-full max-w-[28px] bg-[#5448d8] rounded-md shadow-xs transition-all duration-500"
                  style={{ height: '70px' }}
                ></div>
                <span className="text-[9.5px] font-medium text-slate-500 mt-2">Aug</span>
              </div>
              <div className="flex flex-col items-center h-full justify-end group">
                <span className="text-[8px] font-bold text-slate-800 mb-1">₹{sepSpending}</span>
                <div className="w-full max-w-[28px] h-14 bg-[#ecf2f7] rounded-md overflow-hidden flex flex-col justify-end">
                  <div
                    className="w-full bg-[#5448d8] rounded-b-md transition-all duration-500"
                    style={{ height: '34px' }}
                  ></div>
                </div>
                <span className="text-[9.5px] font-medium text-slate-500 mt-2">Sep</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Line Chart View (Default active view) */}
        {chartView === 'line' && (
          <div id="chart-view-line" className="pt-1 pb-1">
            <div className="relative h-28 w-full flex flex-col justify-between">
              <svg className="w-full h-20 overflow-visible" viewBox="0 0 320 95">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#5448d8" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#5448d8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line stroke="#f1f5f9" strokeWidth="1" x1="16" x2="304" y1="75" y2="75" />
                <line stroke="#f8fafc" strokeDasharray="3 3" strokeWidth="1" x1="16" x2="304" y1="45" y2="45" />
                <line stroke="#f8fafc" strokeDasharray="3 3" strokeWidth="1" x1="16" x2="304" y1="15" y2="15" />
                <polygon
                  fill="url(#lineGradient)"
                  points="24,75 78,75 132,75 186,75 240,15 294,48 294,75 24,75"
                />
                <polyline
                  fill="none"
                  points="24,75 78,75 132,75 186,75 240,15 294,48"
                  stroke="#5448d8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
                <circle cx="24" cy="75" fill="#ecf2f7" r="3" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="78" cy="75" fill="#ecf2f7" r="3" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="132" cy="75" fill="#ecf2f7" r="3" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="186" cy="75" fill="#ecf2f7" r="3" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="240" cy="15" fill="#ffffff" r="4" stroke="#5448d8" strokeWidth="2.5" />
                <circle cx="294" cy="48" fill="#ffffff" r="3.5" stroke="#5448d8" strokeWidth="2" />
                <text fill="#5448d8" fontSize="8.5" fontWeight="700" textAnchor="middle" x="240" y="8">
                  ₹{augSpending}
                </text>
                <text fill="#64748b" fontSize="8" fontWeight="600" textAnchor="middle" x="294" y="41">
                  ₹{sepSpending}
                </text>
              </svg>
              <div className="grid grid-cols-6 gap-2 text-center text-[9.5px] font-medium text-slate-400 mt-1">
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span className="text-slate-600 font-semibold">Aug</span>
                <span className="text-slate-600 font-semibold">Sep</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Pie Chart View */}
        {chartView === 'pie' && (
          <div id="chart-view-pie" className="pt-1 pb-1">
            <div className="flex items-center justify-around h-28 px-1">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 42 42">
                  <circle
                    cx="21"
                    cy="21"
                    fill="transparent"
                    r="15.91549430918954"
                    stroke="#ecf2f7"
                    strokeWidth="5"
                  />
                  {/* Tea 56% */}
                  <circle
                    cx="21"
                    cy="21"
                    fill="transparent"
                    r="15.91549430918954"
                    stroke="#6366f1"
                    strokeDasharray="56 44"
                    strokeDashoffset="0"
                    strokeWidth="5"
                  />
                  {/* Food 20% */}
                  <circle
                    cx="21"
                    cy="21"
                    fill="transparent"
                    r="15.91549430918954"
                    stroke="#f43f5e"
                    strokeDasharray="20 80"
                    strokeDashoffset="-56"
                    strokeWidth="5"
                  />
                  {/* Travel 13% */}
                  <circle
                    cx="21"
                    cy="21"
                    fill="transparent"
                    r="15.91549430918954"
                    stroke="#3b82f6"
                    strokeDasharray="13 87"
                    strokeDashoffset="-76"
                    strokeWidth="5"
                  />
                  {/* Gift 11% */}
                  <circle
                    cx="21"
                    cy="21"
                    fill="transparent"
                    r="15.91549430918954"
                    stroke="#64748b"
                    strokeDasharray="11 89"
                    strokeDashoffset="-89"
                    strokeWidth="5"
                  />
                </svg>
                <div className="absolute text-center leading-none pointer-events-none">
                  <span className="text-[10.5px] font-extrabold text-slate-800 block">
                    ₹4,613
                  </span>
                  <span className="text-[7.5px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">
                    Total
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-1.5 pl-2 text-[10.5px]">
                <div className="flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
                    <span className="text-slate-600 font-medium">Tea</span>
                  </div>
                  <span className="font-bold text-slate-800 text-[10px]">56%</span>
                </div>
                <div className="flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#f43f5e]" />
                    <span className="text-slate-600 font-medium">Food</span>
                  </div>
                  <span className="font-bold text-slate-800 text-[10px]">20%</span>
                </div>
                <div className="flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                    <span className="text-slate-600 font-medium">Travel</span>
                  </div>
                  <span className="font-bold text-slate-800 text-[10px]">13%</span>
                </div>
                <div className="flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#64748b]" />
                    <span className="text-slate-600 font-medium">Gift</span>
                  </div>
                  <span className="font-bold text-slate-800 text-[10px]">11%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. Spending by Category Section */}
      <section
        id="section-spending-category"
        className="bg-white rounded-2xl p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] border border-slate-100/80"
      >
        {/* Category Header */}
        <div className="flex items-center justify-between mb-4 px-0.5">
          <div className="flex items-center space-x-2">
            <PieChartIcon className="w-4 h-4 text-[#5c54db]" />
            <h2 className="font-bold text-[13.5px] text-slate-800">Spending by Category</h2>
          </div>
          <div className="relative flex items-center">
            <select
              id="select-category-month"
              aria-label="Filter spending by month"
              value={categoryMonth}
              onChange={(e) => setCategoryMonth(e.target.value)}
              className="appearance-none bg-white border border-slate-200/90 rounded-full pl-2 pr-5 py-0.5 text-[9.5px] font-semibold tracking-wider text-slate-600 shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Months</option>
              <option value="jan">January</option>
              <option value="feb">February</option>
              <option value="mar">March</option>
              <option value="apr">April</option>
              <option value="may">May</option>
              <option value="jun">June</option>
              <option value="jul">July</option>
              <option value="aug">August</option>
              <option value="sep">September</option>
              <option value="oct">October</option>
              <option value="nov">November</option>
              <option value="dec">December</option>
            </select>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400 absolute right-1.5 pointer-events-none" />
          </div>
        </div>

        {/* Category Items List */}
        <div className="space-y-3.5">
          {categories.map((cat) => {
            const IconComp = cat.icon;
            return (
              <div key={cat.id} id={`category-item-${cat.id}`} className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 w-24 shrink-0">
                  <div
                    className="w-7 h-7 rounded-lg text-white flex items-center justify-center text-xs shadow-2xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    <IconComp className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                  <span className="text-[12.5px] font-semibold text-slate-700">{cat.name}</span>
                </div>
                <span className="text-[12px] font-bold text-slate-800 w-16 text-right pr-3">
                  ₹{cat.amount}
                </span>
                <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
