import React, { useState } from 'react';
import { Calculator, HelpCircle, Info, Check, Percent, BadgeAlert } from 'lucide-react';
import { AMHARIC_TRANSLATIONS, ENGLISH_TRANSLATIONS } from './data';

interface CommissionCalculatorProps {
  isAmharic: boolean;
}

type CalculatorMode = 'house_rent' | 'house_sale' | 'car_rent' | 'car_sale' | 'servant_hiring';

export default function CommissionCalculator({ isAmharic }: CommissionCalculatorProps) {
  const t = isAmharic ? AMHARIC_TRANSLATIONS : ENGLISH_TRANSLATIONS;

  const [value, setValue] = useState<string>('50000');
  const [dealType, setDealType] = useState<CalculatorMode>('house_rent');
  const [result, setResult] = useState<number>(5000); // 10% default

  const calculateCommission = (valStr: string, mode: CalculatorMode) => {
    const num = parseFloat(valStr.replace(/,/g, '')) || 0;
    let computed = 0;

    switch (mode) {
      case 'house_rent':
        // Customary is usually 10% of first month (or sometimes full first month, let's estimate average 10%)
        computed = num * 0.10;
        break;
      case 'house_sale':
        // Customary is 2%
        computed = num * 0.02;
        break;
      case 'car_rent':
        // Customary is 10%
        computed = num * 0.10;
        break;
      case 'car_sale':
        // Customary is 2%
        computed = num * 0.02;
        break;
      case 'servant_hiring':
        // Customary is 15% of monthly salary
        computed = num * 0.15;
        break;
      default:
        computed = num * 0.02;
    }
    setResult(computed);
  };

  const handleValueChange = (val: string) => {
    // only keep numbers
    const cleaned = val.replace(/[^0-9]/g, '');
    setValue(cleaned);
    calculateCommission(cleaned, dealType);
  };

  const handleModeChange = (mode: CalculatorMode) => {
    setDealType(mode);
    calculateCommission(value, mode);
  };

  const formattedResult = new Intl.NumberFormat('en-US').format(result);

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-xl p-6 sm:p-8 pointer-events-auto" id="commission-calculator">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-natural-accent/10 text-natural-dark flex items-center justify-center">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-stone-800 font-sans">
            {t.commissionCalculatorTitle}
          </h3>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            {isAmharic ? 'የደላላ ኮሚሽን ተመኖችን አስቀድመው ያረጋግጡ' : 'Calculate customary broker fee standards'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 font-sans">
        {/* Left Input panel */}
        <div className="md:col-span-7 space-y-5">
          {/* Select Mode */}
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2.5 uppercase tracking-wide">
              {isAmharic ? 'የግብይት አይነት' : 'Transaction Category'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                id="calc-mode-house-rent"
                type="button"
                onClick={() => handleModeChange('house_rent')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  dealType === 'house_rent'
                    ? 'bg-natural-accent border-natural-accent text-white shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                }`}
              >
                {isAmharic ? 'የቤት ኪራይ (10%)' : 'House Rent (10%)'}
              </button>

              <button
                id="calc-mode-house-sale"
                type="button"
                onClick={() => handleModeChange('house_sale')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  dealType === 'house_sale'
                    ? 'bg-natural-accent border-natural-accent text-white shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                }`}
              >
                {isAmharic ? 'የቤት ሽያጭ (2%)' : 'House Sale (2%)'}
              </button>

              <button
                id="calc-mode-car-rent"
                type="button"
                onClick={() => handleModeChange('car_rent')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  dealType === 'car_rent'
                    ? 'bg-natural-accent border-natural-accent text-white shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                }`}
              >
                {isAmharic ? 'የመኪና ኪራይ (10%)' : 'Car Rent (10%)'}
              </button>

              <button
                id="calc-mode-car-sale"
                type="button"
                onClick={() => handleModeChange('car_sale')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  dealType === 'car_sale'
                    ? 'bg-natural-accent border-natural-accent text-white shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                }`}
              >
                {isAmharic ? 'የመኪና ሽያጭ (2%)' : 'Car Sale (2%)'}
              </button>

              <button
                id="calc-mode-servant"
                type="button"
                onClick={() => handleModeChange('servant_hiring')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all col-span-2 sm:col-span-1 cursor-pointer ${
                  dealType === 'servant_hiring'
                    ? 'bg-natural-accent border-natural-accent text-white shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                }`}
              >
                {isAmharic ? 'የሰራተኛ ቅጥር (15%)' : 'Staff Hire (15%)'}
              </button>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2.5 uppercase tracking-wide">
              {t.inputPriceToCalc}
            </label>
            <div className="relative rounded-2xl shadow-3xs">
              <input
                id="calc-price-input"
                type="text"
                value={value}
                onChange={(e) => handleValueChange(e.target.value)}
                placeholder={isAmharic ? 'ዋጋ በብር ያስገቡ' : 'Enter amount in ETB'}
                className="w-full pl-6 pr-20 py-4 rounded-2xl border border-stone-200 focus:border-natural-accent focus:ring-2 focus:ring-natural-accent/20 outline-hidden tracking-wide text-lg font-extrabold text-natural-dark font-sans transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
                <span className="text-stone-400 font-bold text-xs select-none">ETB / ብር</span>
              </div>
            </div>
          </div>

          {/* Custom calculation result */}
          <div className="bg-natural-light rounded-2xl border border-natural-accent/30 p-5 mt-4">
            <p className="text-xs font-bold text-natural-dark uppercase tracking-widest leading-none">
              {t.agentFee}
            </p>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl font-black text-natural-dark tracking-tight font-sans">
                {formattedResult}
              </span>
              <span className="text-sm font-bold text-natural-dark">ETB / ብር</span>
            </div>
            <p className="text-[10px] text-stone-500 mt-2 font-medium leading-normal">
              {t.disclaimer}
            </p>
          </div>
        </div>

        {/* Right facts panel */}
        <div className="md:col-span-5 bg-stone-50 rounded-2.5xl p-6 border border-stone-100 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-natural-dark flex items-center space-x-1.5 border-b border-stone-200/60 pb-3 mb-4">
              <Percent className="w-4 h-4 text-natural-accent" />
              <span>{isAmharic ? 'የደላላ ኮሚሽን መርህ' : 'Customary Standards'}</span>
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-xs">
                <Check className="w-4 h-4 text-natural-accent py-0.5 shrink-0" />
                <span className="text-stone-700 font-medium leading-normal">{t.commissionHouseRent}</span>
              </li>
              <li className="flex items-start space-x-2 text-xs">
                <Check className="w-4 h-4 text-natural-accent py-0.5 shrink-0" />
                <span className="text-stone-700 font-medium leading-normal">{t.commissionHouseSale}</span>
              </li>
              <li className="flex items-start space-x-2 text-xs">
                <Check className="w-4 h-4 text-natural-accent py-0.5 shrink-0" />
                <span className="text-stone-700 font-medium leading-normal">{t.commissionCarRent}</span>
              </li>
              <li className="flex items-start space-x-2 text-xs">
                <Check className="w-4 h-4 text-[#C19A6B] py-0.5 shrink-0" />
                <span className="text-stone-700 font-medium leading-normal">{t.commissionCarSale}</span>
              </li>
              <li className="flex items-start space-x-2 text-xs">
                <Check className="w-4 h-4 text-natural-accent py-0.5 shrink-0" />
                <span className="text-stone-700 font-medium leading-normal">{t.commissionServantHiring}</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-200/60 text-[10px] text-stone-400 font-sans flex items-start space-x-2 leading-relaxed">
            <span className="w-2 h-2 rounded-full bg-natural-accent shrink-0 mt-1"></span>
            <span>
              {isAmharic 
                ? 'በኢትዮጵያ ዲጂታል የደላላ አሰራር መሰረት፣ ደላላው ሁለቱንም ወገኖች በማገናኘት፣ በመደራደር እንዲሁም ውል በማዘጋጀት ታማኝ ድርሻውን ያከናውናል።'
                : 'Under digital brokerage norms in Ethiopia, the broker serves as a neutral negotiator to guarantee contracts, secure advance payments, and streamline compliance.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
