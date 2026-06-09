import React, { useState } from 'react';
import { MapPin, Phone, Calendar, Info, Check, MessageSquare, Crosshair } from 'lucide-react';
import { Listing } from '../types';
import { AMHARIC_TRANSLATIONS, ENGLISH_TRANSLATIONS } from './data';

interface ListingCardProps {
  key?: string;
  listing: Listing;
  isAmharic: boolean;
  onContactClick: (listing: Listing) => void;
}

export default function ListingCard({ listing, isAmharic, onContactClick }: ListingCardProps) {
  const t = isAmharic ? AMHARIC_TRANSLATIONS : ENGLISH_TRANSLATIONS;
  const [copied, setCopied] = useState(false);

  // Helper to format price to local currency (ETB) format
  const formatPrice = (price?: number) => {
    if (!price) return isAmharic ? 'ድርድር' : 'Negotiable';
    return new Intl.NumberFormat('en-US').format(price) + ' ETB';
  };

  const getPriceSuffix = () => {
    if (!listing.price) return '';
    if (listing.priceType === 'rent') return isAmharic ? ' / በወር' : ' / month';
    if (listing.priceType === 'salary_monthly') return isAmharic ? ' / በወር' : ' / month';
    return '';
  };

  // Badge styles based on category
  const getBadgeStyles = () => {
    switch (listing.category) {
      case 'house':
        return 'bg-blue-50 text-blue-700 border-blue-200/50';
      case 'car':
        return 'bg-sky-50 text-sky-700 border-sky-200/50';
      case 'servant':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  const copyPhoneNumber = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(listing.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      id={`listing-${listing.id}`}
      className="bg-white rounded-2xl border border-stone-100 hover:border-stone-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col h-full pointer-events-auto card-hover"
    >
      {/* Listing Image */}
      <div 
        onClick={() => onContactClick(listing)}
        className="relative aspect-video w-full overflow-hidden bg-[#F9F5EE] cursor-pointer group/img"
      >
        <img
          src={listing.image}
          alt={isAmharic ? listing.titleAm : listing.titleEn}
          referrerPolicy="no-referrer"
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        {/* Overlay Hover hint */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all duration-300">
          <span className="bg-white/95 text-stone-900 border border-[#8B4513]/10 px-3.5 py-1.5 rounded-xl text-[10.5px] font-bold shadow-md transform translate-y-2 group-hover/img:translate-y-0 transition-transform duration-300">
            🔍 {isAmharic ? 'ዝርዝር እና ፎቶዎች ይመልከቱ' : 'View Details & Gallery'}
          </span>
        </div>
        {/* Category & Subcategory Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border shadow-3xs ${getBadgeStyles()}`}>
            {isAmharic ? (listing.category === 'house' ? 'ቤት' : listing.category === 'car' ? 'መኪና' : 'ሰራተኛ') : listing.category.toUpperCase()}
          </span>
          <span className="bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg font-sans">
            {listing.subCategory}
          </span>
          <span className="bg-blue-100/95 backdrop-blur-xs text-blue-800 text-[10px] font-bold px-2 py-1 rounded-lg border border-blue-200 font-mono">
            #{listing.id}
          </span>
          {listing.status && ['rented', 'sold', 'hired'].includes(listing.status) && (
            <span className="bg-rose-600 border border-rose-500 text-white text-[9.5px] font-black px-2.5 py-1 rounded-lg shadow-sm tracking-wider animate-pulse uppercase">
              {listing.status === 'rented' 
                ? (isAmharic ? '🔑 ተከራይቷል' : 'RENTED') 
                : listing.status === 'sold' 
                ? (isAmharic ? '🚗 ተሽጧል' : 'SOLD')
                : (isAmharic ? '💼 ተቀጥሯል' : 'HIRED')}
            </span>
          )}
        </div>

        {/* Dynamic price Tag banner */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-natural-accent/15">
          <p className="text-sm font-black text-stone-900 font-mono">
            {formatPrice(listing.price)}
            <span className="text-[10px] text-stone-500 font-medium">{getPriceSuffix()}</span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between font-sans">
        <div>
          {/* Header & Title */}
          <div className="flex items-start justify-between gap-2.5">
            <h4 className="text-base font-extrabold text-stone-800 leading-snug tracking-tight group-hover:text-natural-dark transition-colors line-clamp-2">
              {isAmharic ? listing.titleAm : listing.titleEn}
            </h4>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-1 text-stone-400 text-xs mt-2 font-medium">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">{isAmharic ? listing.locationAm : listing.locationEn}</span>
          </div>

          {/* Short description */}
          <p className="text-xs text-stone-500 mt-2.5 line-clamp-2 leading-relaxed font-sans">
            {isAmharic ? listing.descriptionAm : listing.descriptionEn}
          </p>

          {/* Specifications list (Mini tags) */}
          <div className="mt-4 pt-3.5 border-t border-stone-100 grid grid-cols-2 gap-x-3 gap-y-2">
            {listing.specifications.slice(0, 4).map((spec, index) => (
              <div key={index} className="flex items-center justify-between text-[11px] font-sans">
                <span className="text-stone-400 font-medium">{isAmharic ? spec.keyAm : spec.keyEn}:</span>
                <span className="text-stone-700 font-bold truncate max-w-[70px]" title={isAmharic ? spec.valueAm : spec.valueEn}>
                  {isAmharic ? spec.valueAm : spec.valueEn}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons tray */}
        <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center space-x-2">
          {/* Contact details */}
          <button
            id={`btn-contact-${listing.id}`}
            onClick={() => onContactClick(listing)}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 bg-natural-accent hover:bg-natural-accent/90 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t.contactBroker}</span>
          </button>

          {/* Fast Call Button */}
          <button
            id={`btn-copy-phone-${listing.id}`}
            onClick={copyPhoneNumber}
            title={listing.phone}
            className={`px-3 py-2.5 rounded-xl border flex items-center justify-center transition-all ${
              copied 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
