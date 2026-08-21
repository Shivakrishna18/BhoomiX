import React, { useState, useId } from 'react';
import {
  Calculator,
  IndianRupee,
  Calendar,
  Percent,
  TrendingDown,
  ShieldCheck,
  Building2,
  PieChart as PieIcon,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Property } from '../types';

interface EMICalculatorCardProps {
  property: Property;
}

export const EMICalculatorCard: React.FC<EMICalculatorCardProps> = ({ property }) => {
  const propertyPrice = property.askingPrice || 5000000;

  // Form states
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(8.85); // Standard SBI/HDFC land loan rate
  const [tenureYears, setTenureYears] = useState<number>(15);
  const [includeStampDuty, setIncludeStampDuty] = useState<boolean>(true);
  const [showAmortization, setShowAmortization] = useState<boolean>(false);

  // Generate unique IDs for all interactive inputs
  const downPaymentSliderId = useId();
  const downPaymentInputId = useId();
  const interestRateSliderId = useId();
  const interestRateInputId = useId();
  const tenureSliderId = useId();
  const stampDutyCheckboxId = useId();

  // Calculations
  const downPaymentAmount = Math.round((propertyPrice * downPaymentPercent) / 100);
  const loanPrincipal = Math.max(0, propertyPrice - downPaymentAmount);

  // Telangana Registration & Stamp Duty (approx 7.5% stamp duty + transfer + registration)
  const stampDutyAndRegistration = Math.round(propertyPrice * 0.075);
  const totalInitialUpfront = downPaymentAmount + (includeStampDuty ? stampDutyAndRegistration : 0);

  // Monthly EMI Formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const monthlyRate = interestRate / (12 * 100);
  const totalMonths = tenureYears * 12;

  let monthlyEMI = 0;
  if (loanPrincipal > 0 && monthlyRate > 0 && totalMonths > 0) {
    const pow = Math.pow(1 + monthlyRate, totalMonths);
    monthlyEMI = Math.round((loanPrincipal * monthlyRate * pow) / (pow - 1));
  }

  const totalPayment = monthlyEMI * totalMonths;
  const totalInterest = Math.max(0, totalPayment - loanPrincipal);

  const principalRatio = totalPayment > 0 ? (loanPrincipal / totalPayment) * 100 : 50;
  const interestRatio = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 50;

  // Recommended monthly salary (assuming 40% FOIR - Fixed Obligation to Income Ratio)
  const recommendedIncome = Math.round((monthlyEMI / 40) * 100);

  const formatINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const bankPresets = [
    { name: 'SBI Land/Realty', rate: 8.75 },
    { name: 'HDFC Plot Loan', rate: 8.95 },
    { name: 'ICICI Land Loan', rate: 9.15 },
    { name: 'Canara / Union', rate: 8.65 },
  ];

  const tenurePresets = [5, 10, 15, 20, 25];

  // Generate Sample Amortization Schedule (Yearly)
  const getAmortizationSchedule = () => {
    const schedule = [];
    let balance = loanPrincipal;
    const r = monthlyRate;

    for (let yr = 1; yr <= Math.min(tenureYears, 10); yr++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;

      for (let m = 1; m <= 12; m++) {
        if (balance <= 0) break;
        const interestForMonth = balance * r;
        const principalForMonth = Math.min(balance, monthlyEMI - interestForMonth);
        yearlyInterest += interestForMonth;
        yearlyPrincipal += principalForMonth;
        balance -= principalForMonth;
      }

      schedule.push({
        year: yr,
        principalPaid: Math.round(yearlyPrincipal),
        interestPaid: Math.round(yearlyInterest),
        remainingBalance: Math.max(0, Math.round(balance)),
      });
    }
    return schedule;
  };

  return (
    <div
      id="emi-calculator-card"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
    >
      {/* Card Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 sm:p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold shrink-0 shadow-inner">
            <Calculator className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Interactive Land Loan & EMI Calculator
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Estimates
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Estimate monthly payments, interest breakups, and initial upfront cash for this parcel
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 space-y-1">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
              Estimated Monthly EMI
            </span>
            <div className="text-2xl sm:text-3xl font-black text-indigo-950 font-mono tracking-tight">
              {formatINR(monthlyEMI)}
              <span className="text-xs font-semibold text-indigo-700 ml-1">/ month</span>
            </div>
            <p className="text-[11px] text-indigo-800/80">
              For {tenureYears} years tenure @ {interestRate}% p.a.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Loan Amount Required
            </span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
              {formatINR(loanPrincipal)}
            </div>
            <p className="text-[11px] text-slate-500">
              {100 - downPaymentPercent}% of property asking price
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-1">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
              Total Upfront Cash Needed
            </span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-950 font-mono">
              {formatINR(totalInitialUpfront)}
            </div>
            <p className="text-[11px] text-emerald-800">
              Down payment {includeStampDuty ? '+ 7.5% Telangana Stamp Duty' : ''}
            </p>
          </div>
        </div>

        {/* Interactive Sliders Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Controls Column */}
          <div className="space-y-5">
            {/* 1. Down Payment Control */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label
                  htmlFor={downPaymentSliderId}
                  className="font-bold text-slate-800 flex items-center space-x-1.5"
                >
                  <span>Down Payment</span>
                  <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100">
                    {downPaymentPercent}% ({formatINR(downPaymentAmount)})
                  </span>
                </label>
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-slate-500">Custom:</span>
                  <input
                    id={downPaymentInputId}
                    type="number"
                    min="10"
                    max="90"
                    step="1"
                    value={downPaymentPercent}
                    onChange={(e) => {
                      const val = Math.min(90, Math.max(10, Number(e.target.value) || 10));
                      setDownPaymentPercent(val);
                    }}
                    className="w-14 p-1 text-xs text-right font-mono font-bold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  />
                  <span className="text-xs text-slate-500 font-bold">%</span>
                </div>
              </div>

              <input
                id={downPaymentSliderId}
                type="range"
                min="10"
                max="80"
                step="5"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>10% (Min)</span>
                <span>20% (Standard)</span>
                <span>50%</span>
                <span>80% (High)</span>
              </div>
            </div>

            {/* 2. Interest Rate Control */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label
                  htmlFor={interestRateSliderId}
                  className="font-bold text-slate-800 flex items-center space-x-1.5"
                >
                  <Percent className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Interest Rate (% per annum)</span>
                </label>
                <div className="flex items-center space-x-1">
                  <input
                    id={interestRateInputId}
                    type="number"
                    min="6.5"
                    max="16.0"
                    step="0.05"
                    value={interestRate}
                    onChange={(e) => {
                      const val = Math.min(16, Math.max(6.5, Number(e.target.value) || 8.5));
                      setInterestRate(val);
                    }}
                    className="w-16 p-1 text-xs text-right font-mono font-bold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  />
                  <span className="text-xs text-slate-500 font-bold">%</span>
                </div>
              </div>

              <input
                id={interestRateSliderId}
                type="range"
                min="6.5"
                max="15.0"
                step="0.05"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />

              {/* Quick Bank Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {bankPresets.map((b) => (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => setInterestRate(b.rate)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                      interestRate === b.rate
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {b.name} ({b.rate}%)
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Loan Tenure Control */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label
                  htmlFor={tenureSliderId}
                  className="font-bold text-slate-800 flex items-center space-x-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Loan Tenure ({tenureYears} Years / {totalMonths} Months)</span>
                </label>
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  {tenureYears} Yrs
                </span>
              </div>

              <input
                id={tenureSliderId}
                type="range"
                min="1"
                max="30"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />

              <div className="flex gap-1.5 pt-1">
                {tenurePresets.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setTenureYears(yr)}
                    className={`flex-1 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer text-center ${
                      tenureYears === yr
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {yr} Yrs
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Telangana Stamp Duty Toggle */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <label
                  htmlFor={stampDutyCheckboxId}
                  className="text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  Add Telangana Stamp Duty & Reg (7.5%) to Upfront Estimate
                </label>
              </div>
              <input
                id={stampDutyCheckboxId}
                type="checkbox"
                checked={includeStampDuty}
                onChange={(e) => setIncludeStampDuty(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Visual Breakdown & Payment Details */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <PieIcon className="w-4 h-4 text-indigo-600" />
                  <span>Repayment Distribution</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Total Payable: <strong className="text-slate-900 font-mono">{formatINR(totalPayment)}</strong>
                </span>
              </div>

              {/* Progress Distribution Bar */}
              <div className="space-y-1.5">
                <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${principalRatio}%` }}
                    className="bg-indigo-600 h-full transition-all duration-300"
                    title={`Principal: ${principalRatio.toFixed(1)}%`}
                  />
                  <div
                    style={{ width: `${interestRatio}%` }}
                    className="bg-amber-500 h-full transition-all duration-300"
                    title={`Interest: ${interestRatio.toFixed(1)}%`}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-medium pt-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                    <span className="text-slate-700">Principal:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {formatINR(loanPrincipal)} ({principalRatio.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-slate-700">Interest:</span>
                    <span className="font-bold text-amber-900 font-mono">
                      {formatINR(totalInterest)} ({interestRatio.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Income Eligibility Card */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Recommended Minimum Monthly Income</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {formatINR(recommendedIncome)} / mo
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Based on banking standard 40% FOIR (Fixed Obligation to Income Ratio) for easy loan approval.
                </p>
              </div>

              {/* Stamp duty breakup details if checked */}
              {includeStampDuty && (
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-950 space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Govt Stamp Duty & Registration (7.5%):</span>
                    <span className="font-mono font-bold">{formatINR(stampDutyAndRegistration)}</span>
                  </div>
                  <p className="text-[10px] text-emerald-800">
                    Calculated for Telangana Registration & Stamps Dept (Dharani/Sub-Registrar).
                  </p>
                </div>
              )}
            </div>

            {/* Toggle Amortization Schedule Button */}
            <button
              id="toggle-amortization-schedule-btn"
              type="button"
              onClick={() => setShowAmortization(!showAmortization)}
              className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <span>{showAmortization ? 'Hide Amortization Schedule' : 'View Yearly Amortization Schedule'}</span>
              {showAmortization ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Amortization Table (Collapsible) */}
        {showAmortization && (
          <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">
                Yearly Repayment Schedule (First {Math.min(tenureYears, 10)} Years)
              </h4>
              <span className="text-[10px] text-slate-500">Currency in INR</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Year</th>
                    <th className="py-2.5 px-3">Principal Paid</th>
                    <th className="py-2.5 px-3">Interest Paid</th>
                    <th className="py-2.5 px-3">Total Annual Outflow</th>
                    <th className="py-2.5 px-3">Remaining Loan Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-mono text-[11px]">
                  {getAmortizationSchedule().map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 font-bold text-indigo-700">Year {row.year}</td>
                      <td className="py-2 px-3 text-slate-900">{formatINR(row.principalPaid)}</td>
                      <td className="py-2 px-3 text-amber-700">{formatINR(row.interestPaid)}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {formatINR(row.principalPaid + row.interestPaid)}
                      </td>
                      <td className="py-2 px-3 text-slate-600">{formatINR(row.remainingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
