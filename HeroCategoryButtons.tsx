import React from 'react';
import { Home, Car, UserCheck, Key, ShoppingCart, Sparkles, Shield, User, Landmark, Beer, ChevronRight, AlertCircle } from 'lucide-react';
import { AMHARIC_TRANSLATIONS, ENGLISH_TRANSLATIONS } from '../data';
import { CategoryType } from '../types';

interface HeroCategoryButtonsProps {
  isAmharic: boolean;
  onFilterSelect: (category: CategoryType, subCategory: string) => void;
}

export default function HeroCategoryButtons({ isAmharic, onFilterSelect }: HeroCategoryButtonsProps) {
  const t = isAmharic ? AMHARIC_TRANSLATIONS : ENGLISH_TRANSLATIONS;
  const [activeCategory, setActiveCategory] = React.useState<CategoryType>('house');

  const categoriesConfig = [
    {
      id: 'house' as CategoryType,
      titleAm: 'ቤት',
      titleEn: 'House',
      descAm: 'የሚከራዩ ወይም የሚሸጡ ዘመናዊ ቪላዎች፣ አፓርታማዎች እና ኮንዶሚኒየሞች።',
      descEn: 'Find modern villas, apartments, and condominiums to rent or buy.',
      icon: Home,
      color: 'from-blue-600 to-indigo-600',
      submenus: [
        { labelAm: 'የሚከራይ', labelEn: 'To Rent', icon: Key, filterVal: 'የሚከራይ' },
        { labelAm: 'የሚሸጥ', labelEn: 'To Sell', icon: ShoppingCart, filterVal: 'የሚሸጥ' }
      ]
    },
    {
      id: 'car' as CategoryType,
      titleAm: 'መኪና',
      titleEn: 'Car',
      descAm: 'የሚከራዩ የከተማ መኪኖች፣ ዘመናዊ SUVs እና የሚሸጡ ንፁህ ተሽከርካሪዎች።',
      descEn: 'Rent premium city cars, luxury SUVs, or purchase vetted vehicles.',
      icon: Car,
      color: 'from-sky-500 to-blue-700',
      submenus: [
        { labelAm: 'የሚከራይ', labelEn: 'To Rent', icon: Key, filterVal: 'የሚከራይ' },
        { labelAm: 'የሚሸጥ', labelEn: 'To Sell', icon: ShoppingCart, filterVal: 'የሚሸጥ' }
      ]
    },
    {
      id: 'servant' as CategoryType,
      titleAm: 'ሰራተኛ',
      titleEn: 'Staff & Servants',
      descAm: 'የቤት ሞግዚት፣ ተመላላሽ፣ ጥበቃ፣ ፅዳት፣ አስተናጋጅ እና የካፌ/ሆቴል ባለሙያዎች።',
      descEn: 'Hire vetted housemaids, waiters, cashiers, guards, cleaner & more staffing.',
      icon: UserCheck,
      color: 'from-indigo-600 to-cyan-500',
      submenus: [
        { labelAm: 'የቤት ሰራተኛ', labelAmShort: 'የቤት', labelEn: 'House Worker', icon: User, filterVal: 'የቤት' },
        { labelAm: 'ተመላላሽ', labelAmShort: 'ተመላላሽ', labelEn: 'Part-time', icon: Sparkles, filterVal: 'ተመላላሽ' },
        { labelAm: 'ፅዳት', labelAmShort: 'ፅዳት', labelEn: 'Cleaning', icon: Sparkles, filterVal: 'ፅዳት' },
        { labelAm: 'ጥበቃ', labelAmShort: 'ጥበቃ', labelEn: 'Guard/Security', icon: Shield, filterVal: 'ጥበቃ' },
        { labelAm: 'አስተናጋጅ', labelAmShort: 'አስተናጋጅ', labelEn: 'Waiter/Waitress', icon: User, filterVal: 'አስተናጋጅ' },
        { labelAm: 'ካሼር', labelAmShort: 'ካሼር', labelEn: 'Cashier', icon: Landmark, filterVal: 'ካሼር' },
        { labelAm: 'ባር ማን', labelAmShort: 'ባር ማን', labelEn: 'Barman', icon: Beer, filterVal: 'ባር ማን' },
        { labelAm: 'ሌሎችም', labelAmShort: 'ሌሎችም', labelEn: 'Others', icon: AlertCircle, filterVal: 'ሌሎችም' }
      ]
    }
  ];

  const activeCategoryConfig = categoriesConfig.find(c => c.id === activeCategory) || categoriesConfig[0];

  return (
    <div className="w-full py-2 bg-natural-light border-b border-[#C19A6B]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Modern Intro - Compact and space-efficient */}
        <div className="text-center max-w-2xl mx-auto mb-[2px]">
          <h1 className="text-base md:text-xl font-extrabold text-[#8B4513] tracking-tight leading-none font-sans">
            {isAmharic ? 'ይፈልጉ፣ ይምረጡ፣ ፈጣኑን ደላላ ያግኙ' : 'Browse properties, cars & staff instantly'}
          </h1>
        </div>

        {/* 3 Main Aligned Category Buttons - Compact & Horizontal - stretched left to right - Exactly 2px space from heading above */}
        <div className="flex flex-col items-center justify-center w-full max-w-none bg-white/70 backdrop-blur-md p-1 rounded-xl border border-[#C19A6B]/20 shadow-xs mb-2 mt-0" id="home-main-categories">
          <div className="flex flex-row items-center justify-center gap-1.5 w-full">
            {categoriesConfig.map((cat) => {
              const IconComponent = cat.icon;
              const isActive = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  id={`main-cat-btn-${cat.id}`}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-2.5 md:px-6 rounded-lg text-xs md:text-sm font-black transition-all duration-200 pointer-events-auto cursor-pointer ${
                    isActive
                      ? `bg-gradient-to-r ${cat.color} text-white shadow-xs scale-[1.01]`
                      : 'bg-stone-50/70 hover:bg-stone-100 text-stone-700 hover:text-stone-900 border border-stone-200/60'
                  }`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span className="tracking-tight text-[11px] md:text-xs">
                    {isAmharic ? cat.titleAm : cat.titleEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Horizontal Submenu list right below the active main category */}
        <div className="w-full max-w-none text-center animate-fade-in" id="submenu-horizontal-container">
          {/* Swipe-Scrollable sub-categories menu extending horizontally */}
          <div className="flex flex-row overflow-x-auto whitespace-nowrap scrollbar-none gap-1.5 px-1 py-1 justify-start md:justify-center w-full max-w-full">
            {/* Dynamic visual "View All" pill for the selected category */}
            <button
              id={`submenu-btn-${activeCategory}-all`}
              onClick={() => onFilterSelect(activeCategory, 'all')}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-stone-900 text-white hover:bg-stone-950 active:scale-95 text-[11px] font-bold transition-all pointer-events-auto cursor-pointer shrink-0 shadow-3xs border border-stone-800"
            >
              <span>{isAmharic ? `ሁሉንም` : `All`}</span>
              <ChevronRight className="w-3 h-3" />
            </button>

            {/* List submenus horizontally as small pill buttons in a scrollable view */}
            {activeCategoryConfig.submenus.map((sub, idx) => {
              const SubIcon = sub.icon;
              return (
                <button
                  key={idx}
                  id={`submenu-btn-${activeCategory}-${sub.filterVal}`}
                  onClick={() => onFilterSelect(activeCategory, sub.filterVal)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white hover:bg-natural-light group border border-stone-200 hover:border-natural-accent/40 text-stone-700 hover:text-stone-900 transition-all pointer-events-auto shadow-4xs hover:shadow-3xs active:scale-95 text-[11px] font-semibold cursor-pointer shrink-0"
                >
                  <SubIcon className="w-3 h-3 text-stone-400 group-hover:text-natural-dark shrink-0" />
                  <span>{isAmharic ? (('labelAmShort' in sub ? (sub as any).labelAmShort : '') || sub.labelAm) : sub.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
