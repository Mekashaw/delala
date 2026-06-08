import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import HeroCategoryButtons from './components/HeroCategoryButtons';
import ListingCard from './components/ListingCard';
import BrokerOrderForm from './components/BrokerOrderForm';
import CommissionCalculator from './components/CommissionCalculator';
import AuthHub from './components/AuthHub';
import { STATIC_LISTINGS, AMHARIC_TRANSLATIONS, ENGLISH_TRANSLATIONS } from './data';
import { Listing, CategoryType } from './types';
import { Search, RotateCcw, Phone, MessageSquare, Compass, SlidersHorizontal, BookOpen, AlertCircle, X, Check, ArrowRight, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export default function App() {
  const [isAmharic, setIsAmharic] = useState(true);
  const [activeSection, setActiveSection] = useState<'home' | 'listings' | 'request' | 'auth'>('home');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [contactingListing, setContactingListing] = useState<Listing | null>(null);
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [isSuccessAlert, setIsSuccessAlert] = useState(false);
  const [pendingForwardListing, setPendingForwardListing] = useState<Listing | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Calculate all listing images for photo lightbox viewing
  const allListingImages = useMemo(() => {
    if (!contactingListing) return [];
    return [contactingListing.image, ...(contactingListing.images || [])];
  }, [contactingListing]);

  // Bind keyboard navigation for full screen photo switcher
  useEffect(() => {
    if (lightboxImageIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setLightboxImageIndex(prev => {
          if (prev === null) return null;
          return (prev - 1 + allListingImages.length) % allListingImages.length;
        });
      } else if (e.key === 'ArrowRight') {
        setLightboxImageIndex(prev => {
          if (prev === null) return null;
          return (prev + 1) % allListingImages.length;
        });
      } else if (e.key === 'Escape') {
        setLightboxImageIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImageIndex, allListingImages]);

  // Synchronised persistence listing database state
  const [listings, setListings] = useState<Listing[]>(() => {
    const saved = localStorage.getItem('delala_listings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return STATIC_LISTINGS;
      }
    } else {
      localStorage.setItem('delala_listings', JSON.stringify(STATIC_LISTINGS));
      return STATIC_LISTINGS;
    }
  });

  // Synchronised authentication session state
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('delala_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const t = isAmharic ? AMHARIC_TRANSLATIONS : ENGLISH_TRANSLATIONS;

  // Load listings from the server-side database on mount
  useEffect(() => {
    const fetchListings = () => {
      fetch('/api/listings')
        .then((res) => {
          if (!res.ok) throw new Error('Database response not ok');
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setListings(data);
            localStorage.setItem('delala_listings', JSON.stringify(data));
          }
        })
        .catch((err) => {
          console.error('Failed to fetch from server database:', err);
        });
    };
    fetchListings();
    
    // Set a periodic short polling helper so other users' edits or admin approves show automatically without refresh
    const rInterval = setInterval(fetchListings, 5000);
    return () => clearInterval(rInterval);
  }, []);

  // Fetch announcements periodically
  useEffect(() => {
    const fetchAnnouncements = () => {
      fetch('/api/announcements')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch announcements');
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setAnnouncements(data);
          }
        })
        .catch((err) => console.error('Failed to load announcements:', err));
    };
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 4000);
    return () => clearInterval(interval);
  }, []);

  // Derive only approved, rented, sold, hired and general static listings for public eyes
  const publicListings = useMemo(() => {
    return listings.filter(item => {
      const status = (item as any).status;
      return !status || status === 'approved' || status === 'rented' || status === 'sold' || status === 'hired';
    });
  }, [listings]);

  // Jump to listings with predefined category & subcategory filters
  const handleFilterSelect = (category: CategoryType, subCategory: string) => {
    setSelectedCategory(category);
    setSelectedSubCategory(subCategory);
    setActiveSection('listings');
    // Scroll smoothly to listings container
    setTimeout(() => {
      document.getElementById('listings-container-anchor')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Direct Live Chat forward redirector helper
  const handleDirectChatForward = (listing: Listing) => {
    setContactingListing(null);
    setIsSuccessAlert(false);
    setPendingForwardListing(listing);
    setActiveSection('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter listings based on category, subcategory, and search query
  const filteredListings = useMemo(() => {
    return publicListings.filter((item) => {
      // Category check
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Subcategory check
      if (selectedSubCategory !== 'all' && item.subCategory !== selectedSubCategory) {
        return false;
      }
      // Text Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().replace('#', '').trim();
        const matchesId = item.id.toLowerCase().includes(query);
        const matchesAm = 
          item.titleAm.toLowerCase().includes(query) || 
          item.descriptionAm.toLowerCase().includes(query) || 
          item.locationAm.toLowerCase().includes(query);
        const matchesEn = 
          item.titleEn.toLowerCase().includes(query) || 
          item.descriptionEn.toLowerCase().includes(query) || 
          item.locationEn.toLowerCase().includes(query);
        return matchesId || matchesAm || matchesEn;
      }
      return true;
    });
  }, [publicListings, selectedCategory, selectedSubCategory, searchQuery]);

  const featuredListings = useMemo(() => {
    return publicListings.filter(item => item.isFeatured);
  }, [publicListings]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedSubCategory('all');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-natural-bg text-stone-900 font-sans antialiased selection:bg-natural-accent/30 selection:text-natural-dark flex flex-col">
      {/* Primary Header */}
      <Header
        isAmharic={isAmharic}
        setIsAmharic={setIsAmharic}
        activeSection={activeSection}
        setActiveSection={(sec) => {
          setActiveSection(sec as any);
          if (sec === 'listings') {
            setSelectedCategory('all');
            setSelectedSubCategory('all');
          }
        }}
        onOpenCalculator={() => {
          setShowCalculator(true);
          // Scroll smoothly to commission calculator
          setTimeout(() => {
            document.getElementById('calculator-section-anchor')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        currentUser={currentUser}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {activeSection === 'home' && (
          <div className="animate-fade-in">
            {/* Ambient visual announcement */}
            <div className="bg-stone-900 text-stone-100 py-3 text-center text-xs font-semibold px-4 tracking-normal border-b border-stone-850 flex items-center justify-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-natural-accent animate-ping"></span>
              <span>
                {isAmharic 
                  ? 'ደላላው ዲጂታል መድረክ፡ በአዲስ መልክ ተሻሽሎ ቀርቧል! ቤት፣ መኪና እና የቤት ሰራተኛ በእጅዎ ላይ።' 
                  : 'Delalaw Broker App: Re-designed with verified listings and interactive staff hiring.'}
              </span>
            </div>

            {/* Three Main Aligned Category Buttons Block */}
            <HeroCategoryButtons 
              isAmharic={isAmharic}
              onFilterSelect={handleFilterSelect}
            />

            {/* Featured Section on Hero Page */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-stone-250 pb-3 mb-6">
                <div>
                  <h2 className="text-base md:text-lg font-extrabold text-[#8B4513] tracking-tight">
                    {t.featuredListings}
                  </h2>
                  <p className="text-[10px] md:text-xs text-stone-450 font-sans mt-0.5">
                    {isAmharic ? 'በደላላው እጅግ ተመራጭ እና የተረጋገጡ የአሁኑ ሳምንት ልዩ ዝርዝሮች' : 'Direct certified listings vetted by our regional brokers.'}
                  </p>
                </div>
                <button
                  id="home-view-all-btn"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubCategory('all');
                    setActiveSection('listings');
                  }}
                  className="mt-3 sm:mt-0 flex items-center space-x-1.5 text-xs font-bold text-natural-dark hover:text-natural-accent transition-colors pointer-events-auto cursor-pointer"
                >
                  <span>{t.viewAll}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Grid of Featured Listings */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="featured-listings-grid">
                {featuredListings.map((item) => (
                  <ListingCard
                    key={item.id}
                    listing={item}
                    isAmharic={isAmharic}
                    onContactClick={(lst) => setContactingListing(lst)}
                  />
                ))}
              </div>
            </section>

            {/* Visual Call-to-Action order segment */}
            <section className="bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-800 text-white py-12 md:py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="max-w-xl">
                  <span className="text-white bg-white/10 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/20">
                    {isAmharic ? 'የደላላ ማዘዣ ቦርድ' : 'CUSTOM ORDER MATCHER'}
                  </span>
                  <h3 className="text-3xl font-extrabold tracking-tight mt-4">
                    {isAmharic ? 'የሚፈልጉትን እቃ/ቤት ላላገኙ ደላላ ማዘዝ ይችላሉ!' : 'Cant find what you are looking for? Order a Delala'}
                  </h3>
                  <p className="text-white/85 text-xs md:text-sm mt-3 leading-relaxed font-sans">
                    {isAmharic 
                      ? 'እርስዎ የሚፈልጉትን ዝርዝር ሁኔታ (የቤት፣ የመኪና ወይም የሰራተኛ ዓይነት) ይንገሩን። ፈጣን እና ታማኝ ወኪል ደላላ በደቂቃዎች ውስጥ አፈላልጎ ያስረክብዎታል።'
                      : 'Submit your budget, target location or worker specifications. Our offline network of verified brokers will search Addis Ababa to match your need.'}
                  </p>
                </div>
                <button
                  id="goto-request-btn"
                  onClick={() => setActiveSection('request')}
                  className="px-8 py-4 bg-stone-900 hover:bg-stone-950 active:scale-95 rounded-2xl text-xs font-bold tracking-wide text-white transition-all shadow-lg hover:shadow-xl hover:scale-102 shrink-0 pointer-events-auto cursor-pointer"
                >
                  {t.postRequestBtn}
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Listings Catalog View */}
        {activeSection === 'listings' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in" id="listings-view">
            {/* Top Anchor for scroll */}
            <div id="listings-container-anchor" className="scroll-mt-24" />

            {/* Filter Headline & Controls */}
            <div className="bg-white rounded-3xl border border-stone-150 p-6 shadow-xs mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-stone-800 tracking-tight flex items-center space-x-2">
                    <Compass className="w-5 h-5 text-natural-accent" />
                    <span>{t.listings}</span>
                  </h1>
                  <p className="text-xs text-stone-550 font-sans mt-0.5">
                    {isAmharic ? 'ከታች ያሉትን ምድቦች እና አማራጮች በመጠቀም የደላላ ዝርዝሮችን ያጣሩ' : 'Filter or search verified broker inventory below'}
                  </p>
                </div>

                {/* Subcategories Selector Bar according to selected category */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    id="cat-tab-all"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedSubCategory('all');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative pointer-events-auto cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-natural-accent text-white shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/50'
                    }`}
                  >
                    {isAmharic ? 'ሁሉንም ምድብ' : 'All Categories'}
                  </button>
                  <button
                    id="cat-tab-house"
                    onClick={() => {
                      setSelectedCategory('house');
                      setSelectedSubCategory('all');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all pointer-events-auto cursor-pointer ${
                      selectedCategory === 'house'
                        ? 'bg-natural-accent text-white shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/50'
                    }`}
                  >
                    {isAmharic ? 'ቤት' : 'House'}
                  </button>
                  <button
                    id="cat-tab-car"
                    onClick={() => {
                      setSelectedCategory('car');
                      setSelectedSubCategory('all');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all pointer-events-auto cursor-pointer ${
                      selectedCategory === 'car'
                        ? 'bg-natural-accent text-white shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/50'
                    }`}
                  >
                    {isAmharic ? 'መኪና' : 'Car'}
                  </button>
                  <button
                    id="cat-tab-servant"
                    onClick={() => {
                      setSelectedCategory('servant');
                      setSelectedSubCategory('all');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all pointer-events-auto cursor-pointer ${
                      selectedCategory === 'servant'
                        ? 'bg-natural-accent text-white shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/50'
                    }`}
                  >
                    {isAmharic ? 'ሰራተኛ' : 'Staff'}
                  </button>
                </div>
              </div>

              {/* Advanced Inputs & Search Filter bars */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-6 pt-5 border-t border-stone-100 items-center">
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    id="catalog-search-input"
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 outline-hidden text-xs font-sans text-stone-900 focus:border-natural-accent focus:ring-2 focus:ring-natural-accent/20 transition-all bg-stone-50/50"
                  />
                  {searchQuery && (
                    <button
                      id="search-clear-btn"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs pointer-events-auto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Subcategory Pill Select list based on user selections */}
                <div className="sm:col-span-11 flex items-center space-x-1 overflow-x-auto py-1 shrink-0 scrollbar-none font-sans mt-3 md:mt-0">
                  <span className="text-[10px] text-stone-400 font-extrabold uppercase select-none mr-2">
                    {isAmharic ? 'ንዑስ ምድብ፡' : 'Sub:'}
                  </span>
                  
                  {/* House / Car Subcategories Pills */}
                  {(selectedCategory === 'house' || selectedCategory === 'car') && (
                    <div className="flex space-x-1">
                      <button
                        id="subcat-pill-all"
                        onClick={() => setSelectedSubCategory('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all pointer-events-auto shrink-0 cursor-pointer ${
                          selectedSubCategory === 'all'
                            ? 'bg-natural-light text-natural-dark border border-natural-accent/20'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                        }`}
                      >
                        {isAmharic ? 'ሁሉንም' : 'All'}
                      </button>
                      <button
                        id="subcat-pill-rent"
                        onClick={() => setSelectedSubCategory('የሚከራይ')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all pointer-events-auto shrink-0 cursor-pointer ${
                          selectedSubCategory === 'የሚከራይ'
                            ? 'bg-natural-light text-natural-dark border border-natural-accent/20'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                        }`}
                      >
                        {isAmharic ? 'የሚከራይ' : 'To Rent'}
                      </button>
                      <button
                        id="subcat-pill-sell"
                        onClick={() => setSelectedSubCategory('የሚሸጥ')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all pointer-events-auto shrink-0 cursor-pointer ${
                          selectedSubCategory === 'የሚሸጥ'
                            ? 'bg-natural-light text-natural-dark border border-natural-accent/20'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                        }`}
                      >
                        {isAmharic ? 'የሚሸጥ' : 'To Sell'}
                      </button>
                    </div>
                  )}

                  {/* Servant Subcategories Pills */}
                  {selectedCategory === 'servant' && (
                    <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none">
                      {['all', 'የቤት', 'ተመላላሽ', 'ፅዳት', 'ጥበቃ', 'አስተናጋጅ', 'ካሼር', 'ባር ማን', 'ሌሎችም'].map((sub) => {
                        const getEnglishSubLabel = (subAm: string) => {
                          if (subAm === 'all') return 'All';
                          if (subAm === 'የቤት') return 'House Worker';
                          if (subAm === 'ተመላላሽ') return 'Part-time';
                          if (subAm === 'ፅዳት') return 'Cleaning';
                          if (subAm === 'ጥበቃ') return 'Security';
                          if (subAm === 'አስተናጋጅ') return 'Waiter/Waitress';
                          if (subAm === 'ካሼር') return 'Cashier';
                          if (subAm === 'ባር ማን') return 'Barman';
                          return 'Others';
                        };
                        return (
                          <button
                            key={sub}
                            id={`subcat-pill-${sub}`}
                            onClick={() => setSelectedSubCategory(sub)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all pointer-events-auto shrink-0 cursor-pointer ${
                              selectedSubCategory === sub
                                ? 'bg-natural-light text-natural-dark border border-natural-accent/20'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                            }`}
                          >
                            {isAmharic ? sub : getEnglishSubLabel(sub)}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {selectedCategory === 'all' && (
                    <span className="text-xs text-stone-400 italic">
                      {isAmharic ? 'መጀመሪያ ዋና ምድብ ይምረጡ' : 'Select a major category first'}
                    </span>
                  )}
                </div>

                {/* Reset button */}
                <div className="sm:col-span-1 flex justify-end">
                  <button
                    id="reset-filters-btn"
                    onClick={handleResetFilters}
                    title={isAmharic ? 'ማጣሪያዎቹን አጽዳ' : 'Reset Filters'}
                    className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-all pointer-events-auto cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Core Listing Grid */}
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredListings.map((item) => (
                  <ListingCard
                    key={item.id}
                    listing={item}
                    isAmharic={isAmharic}
                    onContactClick={(lst) => setContactingListing(lst)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-150 p-8 max-w-xl mx-auto shadow-sm">
                <div className="w-14 h-14 bg-natural-light text-natural-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">
                  {isAmharic ? 'ምንም አይነት ዝርዝር አልተገኘም' : 'No Listings Found'}
                </h3>
                <p className="text-xs text-stone-550 font-sans mt-2 max-w-sm mx-auto leading-relaxed">
                  {isAmharic 
                    ? 'ያስገቡትን የፊደል ስህተት ወይም የመረጡትን ንዑስ ማጣሪያ በማስተካከል በድጋሚ ይሞክሩ። ወይም በቀጥታ ለእኛ ማዘዝ ይችላሉ።'
                    : 'Try checking your search terminology, or post a custom broker match request to look for specific availability.'}
                </p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    id="notfound-reset-btn"
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-[#8B4513] rounded-xl text-xs font-bold transition-all pointer-events-auto cursor-pointer"
                  >
                    {isAmharic ? 'ሁሉንም ሰርዝ' : 'Reset Filters'}
                  </button>
                  <button
                    id="notfound-request-btn"
                    onClick={() => setActiveSection('request')}
                    className="px-5 py-2.5 bg-natural-accent hover:bg-natural-accent/90 text-white rounded-xl text-xs font-bold transition-all pointer-events-auto cursor-pointer"
                  >
                    {t.postRequestBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom Order Request Screen */}
        {activeSection === 'request' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6 animate-fade-in" id="request-view">
            <div className="mb-3 text-center sm:text-left">
              <h1 className="text-xl md:text-2xl font-black text-stone-850 tracking-tight">
                {isAmharic ? 'የደላላ ማዘዣ ጣቢያ' : 'Submit Custom Requirements'}
              </h1>
              <p className="text-xs text-stone-550 font-sans mt-0.5">
                {isAmharic 
                  ? 'የሚከራይ ወይም የሚሸጥ ቤት/መኪና ወይንም ተፈላጊ ሰራተኛ እዚህ ይዘዙ። ታማኝ ወኪሎች በፍጥነት ያገኙዎታል።' 
                  : 'Specify what you are looking to rent, sell, buy, or recruit, and active brokers will search the market.'}
              </p>
            </div>

            <BrokerOrderForm 
              isAmharic={isAmharic} 
              onRequestSubmitted={() => {}} 
            />
          </div>
        )}

        {/* Member and Administrator Portal View containing AuthHub */}
        {activeSection === 'auth' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in" id="auth-portal-view">
            <AuthHub
              isAmharic={isAmharic}
              listings={listings}
              setListings={setListings}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              onClose={() => setActiveSection('home')}
              pendingForwardListing={pendingForwardListing}
              clearPendingForwardListing={() => setPendingForwardListing(null)}
            />
          </div>
        )}

        {/* Commission Calculator Section */}
        {showCalculator && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-24" id="calculator-section-anchor">
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl border border-stone-100">
              <button
                id="close-calculator-btn"
                onClick={() => setShowCalculator(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-750 transition-all pointer-events-auto cursor-pointer z-50 animate-fade-in"
                title={isAmharic ? 'ዝጋ' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
              <CommissionCalculator isAmharic={isAmharic} />
            </div>
          </div>
        )}

        {/* Educational About Section */}
        <section className="bg-stone-900 text-stone-100 py-12 md:py-16 border-t border-stone-850">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-5 space-y-4">
                <span className="text-[10px] text-[#C19A6B] font-extrabold tracking-widest uppercase bg-[#C19A6B]/10 px-3 py-1.5 rounded-full border border-[#C19A6B]/20">
                  {isAmharic ? 'ታማኝነት ቀድሞ ይፈተሻል' : 'Trust Vetted Process'}
                </span>
                <h4 className="text-xl font-bold font-sans text-white">
                  {isAmharic ? 'ስለ ደላላው ዲጂታል መድረክ' : 'About Delalaw Broker Network'}
                </h4>
                <p className="text-xs text-stone-400 font-sans leading-relaxed">
                  {isAmharic 
                    ? 'ድርጅታችን በኢትዮጵያ ውስጥ ያሉ የቤት፣ የመኪና እና የቤት ሰራተኞችን (Domestic Staffing) ፍላጎት በቀላሉ እና በታማኝነት ለማገናኘት የተፈጠረ የዲጂታል ቴክኖሎጂ አገናኝ ነው። ከማጭበርበር የጸዳ፣ በህጋዊ ሰነዶችን እና ወኪሎችን የተመሰረተ ግብይት እናረጋግጣለን።'
                    : 'Delalaw is Ethiopias digital broker aggregator matching houses for rent/sale, verified pre-inspected vehicles, and domestic professionals (maids, cashiers, guards) with prospective clients seamlessly without the standard chaos.'}
                </p>
              </div>

              <div className="md:col-span-3 space-y-3 font-sans">
                <h5 className="text-sm font-bold text-white uppercase tracking-wider">
                  {isAmharic ? 'ዋና ዋና አገልግሎቶች' : 'Key Portals'}
                </h5>
                <ul className="space-y-2 text-xs text-stone-400">
                  <li className="hover:text-natural-accent transition-colors cursor-pointer" onClick={() => handleFilterSelect('house', 'all')}>
                    • {isAmharic ? 'ቤት ኪራይ እና ሽያጭ' : 'Villas & Condos'}
                  </li>
                  <li className="hover:text-natural-accent transition-colors cursor-pointer" onClick={() => handleFilterSelect('car', 'all')}>
                    • {isAmharic ? 'መኪና ኪራይ እና ግዢ' : 'Vehicle Rentals'}
                  </li>
                  <li className="hover:text-natural-accent transition-colors cursor-pointer" onClick={() => handleFilterSelect('servant', 'all')}>
                    • {isAmharic ? 'የቤት፣ የፅዳት እና የጥበቃ ሠራተኛ' : 'Housemaids & Guards'}
                  </li>
                  <li className="hover:text-natural-accent transition-colors cursor-pointer" onClick={() => handleFilterSelect('servant', 'አስተናጋጅ')}>
                    • {isAmharic ? 'አስተናጋጅ፣ ካሼር እና ባርማን' : 'Hospitality Staff'}
                  </li>
                </ul>
              </div>

              <div className="md:col-span-4 space-y-4 font-sans text-xs text-stone-400 leading-relaxed">
                <h5 className="text-sm font-bold text-white uppercase tracking-wider">
                  {isAmharic ? 'ስልክ እና አድራሻ' : 'Support Desk'}
                </h5>
                <p>
                  📍 {isAmharic ? 'ቦሌ መንገድ፣ ኤድና ሞል ህንፃ፣ አዲስ አበባ፣ ኢትዮጵያ' : 'Bole Road, Edna Mall Bldg, Addis Ababa, Ethiopia'}
                </p>
                <p>
                  📞 {isAmharic ? 'ስልክ፡ +251 900 123456 / +251 911 654321' : 'Phone: +251 900 123456 / +251 911 654321'}
                </p>
                <p>
                  ✉️ {isAmharic ? 'ኢሜል፡ support@delalaw.com' : 'Email: support@delalaw.com'}
                </p>
                <p className="border-t border-stone-800 pt-3 text-[10px] text-stone-550">
                  © {new Date().getFullYear()} {isAmharic ? 'ደላላው ዲጂታል ቴክኖሎጂ። መብቱ በህግ የተጠበቀ ነው።' : 'Delalaw Digital Inc. All Rights Reserved.'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Contact Dialog Card Modal popup */}
      {contactingListing && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative shadow-2xl border border-stone-100" id="contact-dialog-modal">
            <button
              id="close-contact-modal-btn"
              onClick={() => {
                setContactingListing(null);
                setIsSuccessAlert(false);
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-750 transition-all pointer-events-auto cursor-pointer"
              title={isAmharic ? 'ዝጋ' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header / Info bar */}
            <div>
              <span className="text-[10px] text-natural-dark bg-natural-light px-2.5 py-1 rounded-md font-bold tracking-widest uppercase border border-natural-accent/20">
                {isAmharic ? 'የደላላው የስልክ አገናኝ' : 'Broker Agent Connection'}
              </span>
              <h3 className="text-xl font-black text-stone-850 mt-3 tracking-tight font-sans">
                {isAmharic ? 'አስተማማኝ አሊያንስ ፈጣን ግንኙነት' : 'Direct Call/SMS Channel'}
              </h3>
              <p className="text-xs text-stone-550 mt-1.5 font-medium leading-relaxed font-sans">
                {isAmharic 
                  ? 'ከታች የተገለጹትን ስልክ ቁጥሮች በመጠቀም ከአገናኙ ደላላ ጋር በቀጥታ ያገናኙ፡' 
                  : 'Call or write an SMS matching your budget and availability for this item:'}
              </p>
            </div>

            {/* Micro card detail preview */}
            <div className="bg-stone-50/50 border border-stone-150 rounded-2xl p-4 mt-4 flex items-center space-x-3.5">
              <img
                src={contactingListing.image}
                alt=""
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-100"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-stone-900 truncate">
                  {isAmharic ? contactingListing.titleAm : contactingListing.titleEn}
                </p>
                <div className="flex items-center space-x-1.5 text-stone-500 text-[11px] mt-1 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{isAmharic ? contactingListing.locationAm : contactingListing.locationEn}</span>
                </div>
                <p className="text-xs font-black text-natural-dark mt-1 font-mono">
                  {new Intl.NumberFormat('en-US').format(contactingListing.price || 0)} ETB
                </p>
              </div>
            </div>

            {/* Gallery Section with Scrolling Option */}
            <div className="my-[15px]">
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>📸 {isAmharic ? 'የምስሎች ማሳያ ጋለሪ' : 'Property Photos Gallery'}</span>
                <span className="text-[9px] text-stone-400 font-mono">
                  {((contactingListing.images?.length || 0) + 1)} {isAmharic ? 'ፎቶዎች' : 'photos'}
                </span>
              </p>
              
              {/* Horizontal Scroll bar */}
              <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-stone-100 snap-x snap-mandatory">
                
                {/* 1. Cover Image */}
                <div 
                  onClick={() => setLightboxImageIndex(0)}
                  className="snap-start shrink-0 w-[85%] first:ml-0 aspect-video rounded-2xl overflow-hidden border border-stone-200 relative group/gall border-2 border-natural-accent/60 cursor-zoom-in active:scale-95 transition-all duration-250"
                  title={isAmharic ? "ሙሉ መጠን ለመመልከት ይጫኑ" : "Click to view full size"}
                >
                  <img
                    src={contactingListing.image}
                    alt="Cover"
                    className="w-full h-full object-cover transition-transform duration-305 group-hover/gall:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/gall:opacity-100 flex items-center justify-center transition-all">
                    <span className="bg-white/90 text-stone-900 text-[10px] uppercase font-bold py-1 px-2.5 rounded-lg border shadow-sm">
                      🔍 {isAmharic ? 'ሙሉ ምስል' : 'Zoom'}
                    </span>
                  </div>
                  <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-lg border border-white/20 font-sans font-bold">
                    ★ {isAmharic ? 'ዋና ገጽ' : 'Cover'}
                  </span>
                </div>

                {/* 2. Additional Scrollable Images */}
                {contactingListing.images && contactingListing.images.map((imgUrl, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setLightboxImageIndex(idx + 1)}
                    className="snap-start shrink-0 w-[85%] aspect-video rounded-2xl overflow-hidden border border-stone-200 relative group/gall cursor-zoom-in active:scale-95 transition-all duration-250"
                    title={isAmharic ? "ሙሉ መጠን ለመመልከት ይጫኑ" : "Click to view full size"}
                  >
                    <img
                      src={imgUrl}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-305 group-hover/gall:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/gall:opacity-100 flex items-center justify-center transition-all">
                      <span className="bg-white/90 text-stone-900 text-[10px] uppercase font-bold py-1 px-2.5 rounded-lg border shadow-sm">
                        🔍 {isAmharic ? 'ሙሉ ምስል' : 'Zoom'}
                      </span>
                    </div>
                    <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-lg font-mono">
                      {idx + 1} / {contactingListing.images?.length}
                    </span>
                  </div>
                ))}

              </div>
              
              {/* Scrolling hint */}
              <p className="text-[9px] text-stone-400 mt-1 font-medium italic flex items-center space-x-1 justify-center">
                <span>↔️ {isAmharic ? 'ለቀሪዎቹ ምስሎች ወደ ቀኝ ወይም ግራ ያንሸራትቱ' : 'Swipe/scroll left or right to view all photos'}</span>
              </p>
            </div>

            {/* Primary Phone Buttons */}
            <div className="space-y-2.5 font-sans">
              <a
                id="modal-call-anchor"
                href={`tel:${contactingListing.phone}`}
                onClick={() => setIsSuccessAlert(true)}
                className="w-full flex items-center justify-center space-x-2.5 bg-natural-accent hover:bg-natural-accent/90 active:scale-98 text-white py-3.5 rounded-2xl text-xs font-bold transition-all shadow-md shadow-natural-accent/15 pointer-events-auto cursor-pointer"
              >
                <Phone className="w-4 h-4 animate-bounce" />
                <span>{isAmharic ? 'ደውለው ያነጋግሩ፡' : 'Call Broker:'} {contactingListing.phone}</span>
              </a>

              <button
                id="modal-sms-anchor"
                onClick={() => handleDirectChatForward(contactingListing)}
                className="w-full flex items-center justify-center space-x-2.5 bg-stone-900 hover:bg-stone-950 active:scale-98 text-white py-3.5 rounded-2xl text-xs font-bold transition-all pointer-events-auto cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 animate-pulse" />
                <span>{isAmharic ? 'ቀጥታ እዚህ በቻት ያነጋግሩ (ፎርዋርድ ያድርጉ)' : 'Start Live Chat & Forward Details'}</span>
              </button>
            </div>

            {/* Quick success call feedback */}
            {isSuccessAlert && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center space-x-2 animate-fade-in" id="mobile-call-sim-alert">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-[10px] text-emerald-800 font-semibold leading-normal font-sans">
                  {isAmharic 
                    ? 'ስልክ ለመደወል እየሞከሩ ነው! ደላላውን ሲያነጋግሩ "ደላላው መድረክ" ላይ እንዳዩት ይግለጹለት።' 
                    : 'Dialing triggered! Inform the broker you found their listing on Delalaw Broker platform.'}
                </p>
              </div>
            )}

            <div className="mt-5 text-center">
              <p className="text-[10px] text-stone-400 font-medium font-sans">
                {isAmharic 
                  ? '* ደላላው ምንም ዓይነት የቅድመ ክፍያ ክፍያዎችን እንዳይከፍሉ ይመክራል።' 
                  : '* Warning: Never transfer money before physical inspection.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat / Match Request FAB on Bottom-Right */}
      <div 
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto"
        id="floating-match-request-fab"
      >
        {/* Interactive Speech notification prompt above the FAB */}
        <div className="bg-stone-900 text-[#FDFBF7] text-[11px] font-black py-1.5 px-3 rounded-xl shadow-md border border-stone-800 mb-2 mr-1 animate-bounce select-none flex items-center space-x-1 font-sans">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            {isAmharic ? 'የደላላ ማዘዣ እዚህ አለ!' : 'Request Broker Here!'}
          </span>
        </div>

        {/* FAB Button with icon */}
        <button
          onClick={() => {
            setActiveSection('request');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-107 active:scale-95 shadow-2xl relative cursor-pointer border-2 border-white ${
            activeSection === 'request'
              ? 'bg-stone-900 text-white shadow-blue-600/35 shadow-lg'
              : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'
          }`}
          title={isAmharic ? 'የደላላ ማዘዣ የውይይት መስኮት' : 'Match Request Chat Portal'}
          id="floating-request-action-bubble"
        >
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
          <MessageSquare className="w-6 h-6 shrink-0" />
        </button>
      </div>

      {/* Full-screen high-fidelity Image View Gallery Lightbox */}
      {lightboxImageIndex !== null && allListingImages.length > 0 && (
        <div 
          onClick={() => setLightboxImageIndex(null)}
          className="fixed inset-0 bg-stone-950/98 z-[100] flex flex-col items-center justify-between p-4 md:p-6 select-none animate-fade-in pointer-events-auto"
          id="photo-view-lightbox-modal"
        >
          {/* Top header navigation details */}
          <div className="w-full max-w-5xl flex items-center justify-between text-white z-10 pt-2">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#C19A6B]">
                {isAmharic ? 'የሙሉ መጠን ምስል እይታ' : 'Full-Screen Photo Showcase'}
              </span>
              <h4 className="text-sm font-black truncate max-w-xs md:max-w-md font-sans">
                {contactingListing && (isAmharic ? contactingListing.titleAm : contactingListing.titleEn)}
              </h4>
            </div>
            
            {/* Index Counter */}
            <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15 text-xs font-mono font-bold tracking-wider">
              {lightboxImageIndex + 1} / {allListingImages.length}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setLightboxImageIndex(null)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-rose-600/90 text-white border border-white/10 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-lg"
              title={isAmharic ? 'ዝጋ (Esc)' : 'Close (Esc)'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Centered Image Container with slider triggers */}
          <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-4 overflow-hidden">
            
            {/* Left Navigate arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxImageIndex(prev => prev !== null ? (prev - 1 + allListingImages.length) % allListingImages.length : null);
              }}
              className="absolute left-2 md:left-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/85 text-white/80 hover:text-white border border-white/10 transition-all cursor-pointer hover:scale-110 active:scale-90 shadow-2xl mr-2"
              title={isAmharic ? 'ያለፈው (←)' : 'Previous (←)'}
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            {/* Main Interactive Zoomable Image */}
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="relative max-h-[72vh] md:max-h-[80vh] max-w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-stone-900 group"
            >
              <img
                src={allListingImages[lightboxImageIndex]}
                alt="Full sized detail"
                className="max-h-[72vh] md:max-h-[80vh] w-auto max-w-full object-contain pointer-events-none select-none transition-transform duration-500 hover:scale-102"
                referrerPolicy="no-referrer"
              />
              
              {/* Type Badge */}
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/10 text-[10px] font-black text-[#C19A6B] uppercase tracking-widest font-sans flex items-center space-x-1">
                <span>📸</span>
                <span>
                  {lightboxImageIndex === 0 
                    ? (isAmharic ? 'ዋና ምስል (Cover)' : 'Primary Cover Photo') 
                    : `${isAmharic ? 'ተጨማሪ ፎቶ' : 'Additional Perspective Photo'} #${lightboxImageIndex}`}
                </span>
              </div>
            </div>

            {/* Right Navigate arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxImageIndex(prev => prev !== null ? (prev + 1) % allListingImages.length : null);
              }}
              className="absolute right-2 md:right-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/85 text-white/80 hover:text-white border border-white/10 transition-all cursor-pointer hover:scale-110 active:scale-90 shadow-2xl ml-2"
              title={isAmharic ? 'ቀጣይ (→)' : 'Next (→)'}
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>

          </div>

          {/* Bottom navigation helper controls hint */}
          <div className="w-full max-w-5xl text-center pb-2">
            <p className="text-[10px] md:text-xs text-stone-400 font-medium italic flex items-center justify-center space-x-1.5">
              <span>↔️ {isAmharic ? 'የስልክ ቁልፎች (← / →) ወይም ቀስቶችን ተጠቅመው ምስሎችን ያቀያይሩ' : 'Use arrow keys (← / →) or side buttons to browse gallery'}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
