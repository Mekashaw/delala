import React from 'react';
import { Home, Briefcase, Car, User, ShieldCheck, Languages, Handshake } from 'lucide-react';
import { AMHARIC_TRANSLATIONS, ENGLISH_TRANSLATIONS } from './data';
import Logo from './Logo';

interface HeaderProps {
  isAmharic: boolean;
  setIsAmharic: (val: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  onOpenCalculator: () => void;
  currentUser?: any;
}

export default function Header({
  isAmharic,
  setIsAmharic,
  activeSection,
  setActiveSection,
  onOpenCalculator,
  currentUser,
}: HeaderProps) {
  const t = isAmharic ? AMHARIC_TRANSLATIONS : ENGLISH_TRANSLATIONS;

  const navItems = [
    { id: 'request', label: t.postRequestBtn, icon: Handshake },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none group"
            onClick={() => setActiveSection('home')}
            id="logo-brand-container"
          >
            <Logo size={42} className="group-hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center space-x-1.5 font-sans">
                <span className="text-xl font-extrabold text-stone-800 tracking-tight">
                  {t.appName}
                </span>
              </div>
              <p className="text-[10px] text-stone-500 leading-none mt-0.5 tracking-tight font-sans">
                {t.appMotto}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 font-sans">
            <button
              id="nav-home-btn"
              onClick={() => setActiveSection('home')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                activeSection === 'home'
                  ? 'bg-natural-accent text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              {t.home}
            </button>
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}-btn`}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  activeSection === item.id
                    ? 'bg-natural-accent text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-3 font-sans">
            {/* Language Switcher */}
            <button
              id="lang-toggle-btn"
              onClick={() => setIsAmharic(!isAmharic)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-natural-dark shadow-2xs hover:border-stone-300 transition-all cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-natural-accent" />
              <span>{isAmharic ? 'English' : 'አማርኛ'}</span>
            </button>

            {/* Login / Member Portal Button */}
            <button
              id="header-portal-btn"
              onClick={() => setActiveSection('auth')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeSection === 'auth'
                  ? 'bg-natural-dark text-white shadow-xs scale-102'
                  : currentUser
                    ? 'border-2 border-natural-accent/50 bg-natural-accent/10 text-stone-800 hover:bg-natural-accent/20 shadow-xs'
                    : 'border border-stone-200 hover:border-natural-dark text-stone-700 hover:text-stone-900 bg-white shadow-3xs'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>
                {currentUser 
                  ? (currentUser.role === 'admin' ? (isAmharic ? 'አስተዳዳሪ' : 'Admin Profile') : (isAmharic ? 'የእኔ ሰሌዳ' : 'Dashboard'))
                  : (isAmharic ? 'ግባ/መዝግብ' : 'Login / Signup')
                }
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
