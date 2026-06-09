import React, { useState, useEffect } from 'react';
import { Sparkles, Send, CheckCircle2, User, Phone, Tag, ClipboardList, HelpCircle } from 'lucide-react';
import { UserRequest, CategoryType } from '../types';
import { AMHARIC_TRANSLATIONS, ENGLISH_TRANSLATIONS } from './data';

interface BrokerOrderFormProps {
  isAmharic: boolean;
  preSelectedCategory?: CategoryType;
  preSelectedSubCategory?: string;
  onRequestSubmitted: () => void;
}

export default function BrokerOrderForm({
  isAmharic,
  preSelectedCategory = 'house',
  preSelectedSubCategory = 'all',
  onRequestSubmitted,
}: BrokerOrderFormProps) {
  const t = isAmharic ? AMHARIC_TRANSLATIONS : ENGLISH_TRANSLATIONS;

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reqType, setReqType] = useState<CategoryType>(preSelectedCategory);
  const [subCat, setSubCat] = useState('all');
  const [details, setDetails] = useState('');
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [customRequests, setCustomRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Load existing requests from DB on mount
  useEffect(() => {
    fetch('/api/requests')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomRequests(data);
        }
      })
      .catch(err => {
        console.error("Failed to fetch requests from server:", err);
      });
  }, []);

  // Update dynamic dropdown menus based on requested categories
  const getSubmenuChoices = () => {
    if (reqType === 'house' || reqType === 'car') {
      return [
        { nameAm: 'የሚከራይ', nameEn: 'To Rent' },
        { nameAm: 'የሚሸጥ', nameEn: 'To Sell' }
      ];
    }
    // Servant options
    return [
      { nameAm: 'የቤት', nameEn: 'Housemaid' },
      { nameAm: 'ተመላላሽ', nameEn: 'Part-time' },
      { nameAm: 'ፅዳት', nameEn: 'Cleaning' },
      { nameAm: 'ጥበቃ', nameEn: 'Security/Guard' },
      { nameAm: 'አስተናጋጅ', nameEn: 'Waiter/Waitress' },
      { nameAm: 'ካሼር', nameEn: 'Cashier' },
      { nameAm: 'ባር ማን', nameEn: 'Barman' },
      { nameAm: 'ሌሎችም', nameEn: 'Others' }
    ];
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phoneNumber.trim()) return;

    setLoading(true);

    const newRequest = {
      name: name.trim(),
      phone: phoneNumber.trim(),
      requestType: reqType,
      subCategory: subCat === 'all' ? (getSubmenuChoices()[0]?.nameAm || 'የሚከራይ') : subCat,
      details: details.trim() || `${isAmharic ? 'ዝርዝር መግለጫ አልተጻፈም' : 'No specifications specified'}.`,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRequest)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create server request');
        return res.json();
      })
      .then(() => fetch('/api/requests'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomRequests(data);
        }
        setIsSuccess(true);
        setLoading(false);
        setName('');
        setPhoneNumber('');
        setDetails('');
        onRequestSubmitted();
      })
      .catch(err => {
        console.error("Error creating request:", err);
        setLoading(false);
        alert(isAmharic ? 'የማዘዣ ምዝገባ አልተሳካም። እባክዎ እንደገና ይሞክሩ!' : 'Error submitting request. Please try again!');
      });
  };

  return (
    <div className="flex justify-center py-4 pointer-events-auto w-full font-sans" id="broker-form-section">
      {/* Form Card */}
      <div className="w-full max-w-xl bg-white p-4 sm:p-5 rounded-2xl border border-stone-150 shadow-md">
        <div className="flex items-center space-x-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-natural-accent flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-stone-800 leading-tight">{t.postRequestBtn}</h3>
            <p className="text-[10px] text-stone-500 font-sans">{t.requestTitle}</p>
          </div>
        </div>

        {isSuccess ? (
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4 text-center animate-fade-in" id="submit-success-box">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white mx-auto mb-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-emerald-950 font-bold text-sm">{isAmharic ? 'መልካም ዜና!' : 'Order Received!'}</h4>
            <p className="text-emerald-700 text-[11px] mt-1 leading-relaxed">
              {t.successMessage}
            </p>
            <button
              id="new-request-toggle-btn"
              onClick={() => setIsSuccess(false)}
              className="mt-4 px-4 py-2 bg-white hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold border border-emerald-200 transition-all pointer-events-auto"
            >
              {isAmharic ? 'ሌላ ፍላጎት ጨምር' : 'Post Another Need'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-3 font-sans">
            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10.5px] font-black text-stone-600 mb-1 flex items-center space-x-1 uppercase tracking-wider">
                  <User className="w-3 h-3 text-natural-accent" />
                  <span>{t.fullName}</span>
                </label>
                <input
                  id="req-name-input"
                  type="text"
                  required
                  placeholder={isAmharic ? 'ሙሉ ስም ያስገቡ' : 'e.g. Samuel Bekele'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-natural-accent focus:ring-2 focus:ring-natural-accent/20 outline-hidden font-sans text-xs transition-all text-stone-900 placeholder:text-stone-400"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-black text-stone-600 mb-1 flex items-center space-x-1 uppercase tracking-wider">
                  <Phone className="w-3 h-3 text-natural-accent" />
                  <span>{isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'}</span>
                </label>
                <input
                  id="req-phone-input"
                  type="tel"
                  required
                  placeholder={t.phonePlaceholder}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-natural-accent focus:ring-2 focus:ring-natural-accent/20 outline-hidden font-sans text-xs transition-all text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* Main Category Selector (ቤት, መኪና, ሰራተኛ) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
              <div>
                <label className="block text-[10.5px] font-black text-stone-600 mb-1 flex items-center space-x-1 uppercase tracking-wider">
                  <Tag className="w-3 h-3 text-natural-accent" />
                  <span>{isAmharic ? 'ምን ማግኘት ይፈልጋሉ?' : 'What do you need?'}</span>
                </label>
                <select
                  id="req-category-select"
                  value={reqType}
                  onChange={(e) => {
                    setReqType(e.target.value as CategoryType);
                    setSubCat('all'); // reset to default
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-natural-accent focus:ring-2 focus:ring-natural-accent/20 outline-hidden bg-white text-xs font-sans transition-all text-stone-900 cursor-pointer"
                >
                  <option value="house">{isAmharic ? 'ቤት / House' : 'House'}</option>
                  <option value="car">{isAmharic ? 'መኪና / Car' : 'Car'}</option>
                  <option value="servant">{isAmharic ? 'ሰራተኛ / Staff' : 'Staff & Servants'}</option>
                </select>
              </div>

              {/* Dynamic Subcategories Dropdown strictly reflecting User Instructions */}
              <div>
                <label className="block text-[10.5px] font-black text-stone-600 mb-1 flex items-center space-x-1 uppercase tracking-wider">
                  <ClipboardList className="w-3 h-3 text-natural-accent" />
                  <span>{isAmharic ? 'ዝርዝር ንዑስ ምድብ' : 'Specific Type'}</span>
                </label>
                <select
                  id="req-subcategory-select"
                  value={subCat}
                  onChange={(e) => setSubCat(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-natural-accent focus:ring-2 focus:ring-natural-accent/20 outline-hidden bg-white text-xs font-sans transition-all text-stone-900 cursor-pointer"
                >
                  <option value="all">
                    {isAmharic ? '-- ሁሉንም ይፈልጋሉ --' : '-- Choose subclass --'}
                  </option>
                  {getSubmenuChoices().map((choice, i) => (
                    <option key={i} value={choice.nameAm}>
                      {isAmharic ? choice.nameAm : choice.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description / Needs specifications */}
            <div>
              <label className="block text-[10.5px] font-black text-stone-600 mb-1 flex items-center space-x-1 uppercase tracking-wider">
                <HelpCircle className="w-3 h-3 text-natural-accent" />
                <span>{isAmharic ? 'ተጨማሪ ፍላጎት ካለዎ ይግለጹልን' : 'Write details for the broker'}</span>
              </label>
              <textarea
                id="req-details-textarea"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={t.detailsPlaceholder}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-natural-accent focus:ring-2 focus:ring-natural-accent/20 outline-hidden font-sans text-xs transition-all text-stone-900 placeholder:text-stone-400"
              />
            </div>

            <button
              id="submit-broker-order-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-natural-accent hover:bg-natural-accent/90 active:scale-[0.99] text-white px-5 py-2.5 rounded-lg text-xs font-black transition-all shadow-md shadow-natural-accent/10 pointer-events-auto cursor-pointer"
            >
              <span>{loading ? t.loading : t.submitRequest}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
