import { Listing } from './types';

export const STATIC_LISTINGS: Listing[] = [
  // HOUSES
  {
    id: 'h1',
    category: 'house',
    subCategory: 'ሚከራይ', // To Rent in Amharic (የሚከራይ-match user's request)
    titleAm: 'ዘመናዊ ባላንድ ፎቅ ቪላ ቤት ቦሌ የሚከራይ',
    titleEn: 'Modern Multi-Story Villa for Rent in Bole',
    descriptionAm: 'ቦሌ በተረጋጋ ሰፈር ውስጥ የሚገኝ፣ 5 መኝታ ቤት፣ ሰፊ ሳሎን፣ ዘመናዊ ወጥ ቤት እና የቤት ሰራተኛ ክፍል ያለው ድንቅ ቪላ። ሰፊ ግቢና ለመኪና ማቆሚያ በቂ ቦታ አለው።',
    descriptionEn: 'Stunning villa located in a quiet Bole residential area. Features 5 bedrooms, a spacious living room, modern kitchen, and helper rooms. Large yard with ample parking.',
    price: 180000,
    priceType: 'rent',
    locationAm: 'ቦሌ፣ አዲስ አበባ',
    locationEn: 'Bole, Addis Ababa',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    phone: '0911223344',
    specifications: [
      { keyAm: 'መኝታ ክፍሎች', keyEn: 'Bedrooms', valueAm: '5', valueEn: '5' },
      { keyAm: 'ባልነሮች/መታጠቢያ', keyEn: 'Bathrooms', valueAm: '4.5', valueEn: '4.5' },
      { keyAm: 'ስፋት', keyEn: 'Area', valueAm: '350 ካሬ ሜትር', valueEn: '350 sqm' },
      { keyAm: 'ደህንነት', keyEn: 'Security', valueAm: 'ካሜራና አጥር አለው', valueEn: 'CCTV & Fenced' }
    ],
    dateAdded: '2026-05-25',
    isFeatured: true
  },
  {
    id: 'h2',
    category: 'house',
    subCategory: 'የሚሸጥ', // To Sell
    titleAm: 'በቅርብ የተገነባ የጋራ መኖሪያ አፓርታማ (ኮንዶሚኒየም) ቃሊቲ',
    titleEn: 'Newly Built Condominium Apartment in Kality for Sale',
    descriptionAm: 'ቃሊቲ በተመቻቸ ቦታ ላይ የሚገኝ ባለ 2 መኝታ ቤት ኮንዶሚኒየም ቤት። ሰፊ ሳሎን፣ 1 መታጠቢያ ቤት እና ወጥ ቤት አለው። ዋጋው ድርድር አለው።',
    descriptionEn: 'Beautiful 2-bedroom condominium apartment in Kality at a premium location. Features cozy living area, 1 bathroom, and kitchen. Price is negotiable.',
    price: 3200000,
    priceType: 'sale',
    locationAm: 'ቃሊቲ፣ አዲስ አበባ',
    locationEn: 'Kality, Addis Ababa',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    phone: '0912345678',
    specifications: [
      { keyAm: 'መኝታ ክፍሎች', keyEn: 'Bedrooms', valueAm: '2', valueEn: '2' },
      { keyAm: 'መታጠቢያ', keyEn: 'Bathrooms', valueAm: '1', valueEn: '1' },
      { keyAm: 'ፎቅ', keyEn: 'Floor', valueAm: '3ኛ ፎቅ', valueEn: '3rd Floor' },
      { keyAm: 'ድርድር', keyEn: 'Negotiable', valueAm: 'አዎ', valueEn: 'Yes' }
    ],
    dateAdded: '2026-05-26',
    isFeatured: true
  },
  {
    id: 'h3',
    category: 'house',
    subCategory: 'የሚከራይ', // To Rent
    titleAm: 'ለንግድ የሚሆን ሰፊ ቅጥር ግቢ ያለው ቤት መገናኛ',
    titleEn: 'Commercial Office/Residence Complex in Megenagna',
    descriptionAm: 'መገናኛ ዋና መንገድ አቅራቢያ የሚገኝ ሰፊ ግቢና ከ 10 በላይ ክፍሎች ያሉት ለቢሮ ወይም ለአገልግሎት የሚሆን ሰፊ ቤት።',
    descriptionEn: 'Spacious compound near Megenagna main road. Perfect for office use or guest house. Features 10+ rooms and parking space for 8 cars.',
    price: 350000,
    priceType: 'rent',
    locationAm: 'መገናኛ፣ አዲስ አበባ',
    locationEn: 'Megenagna, Addis Ababa',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    phone: '0955667788',
    specifications: [
      { keyAm: 'ክፍሎች ብዛት', keyEn: 'Total Rooms', valueAm: '12', valueEn: '12' },
      { keyAm: 'የመኪና ማቆሚያ', keyEn: 'Parking Spots', valueAm: '8 መኪኖች', valueEn: '8 Cars' },
      { keyAm: 'አይነት', keyEn: 'Type', valueAm: 'ለንግድ / ለቢሮ', valueEn: 'Commercial / Office' }
    ],
    dateAdded: '2026-05-27'
  },

  // CARS
  {
    id: 'c1',
    category: 'car',
    subCategory: 'የሚከራይ', // To Rent
    titleAm: 'ቶዮታ ቫይትዝ (Toyota Vitz) የሚከራይ ለረጅም ጊዜ',
    titleEn: 'Toyota Vitz For Long-Term Rent',
    descriptionAm: 'ለከተማ መንዳት እጅግ ምቹ እና ነዳጅ ቆጣቢ የሆነች ቶዮታ ቫይትዝ መኪና። ሞተርና ቻሲስ እጅግ በጥሩ ሁኔታ ላይ የሚገኝ፣ አውቶማቲክ ማርሽ።',
    descriptionEn: 'Extremely economic and compact Toyota Vitz for rent. Excellent motor and body condition, automatic transmission, cold A/C, perfect for city commute.',
    price: 35000,
    priceType: 'rent',
    locationAm: 'መገናኛ፣ አዲስ አበባ',
    locationEn: 'Megenagna, Addis Ababa',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    phone: '0922334455',
    specifications: [
      { keyAm: 'አይነት', keyEn: 'Make/Model', valueAm: 'Toyota Vitz 2014', valueEn: 'Toyota Vitz 2014' },
      { keyAm: 'ማርሽ', keyEn: 'Transmission', valueAm: 'አውቶማቲክ', valueEn: 'Automatic' },
      { keyAm: 'ነዳጅ', keyEn: 'Fuel Type', valueAm: 'ቤንዚን', valueEn: 'Petrol' },
      { keyAm: 'ሞተር', keyEn: 'Engine', valueAm: '1.0 L', valueEn: '1.0 L' }
    ],
    dateAdded: '2026-05-24',
    isFeatured: true
  },
  {
    id: 'c2',
    category: 'car',
    subCategory: 'የሚሸጥ', // To Sell
    titleAm: 'ቶዮታ ራቭፎር (Toyota RAV4) 2019 ሞዴል የሚሸጥ',
    titleEn: 'Toyota RAV4 2019 Model for Sale',
    descriptionAm: 'በጣም ንፁህ፣ በአውሮፓ እስታንዳርድ የመጣች RAV4 ስፖርት እትም። ጥቂት ኪሎሜትር ብቻ የሮጠች፣ ባለ ሙሉ አማራጭ (Full Option)።',
    descriptionEn: 'Very clean European-spec Toyota RAV4 Sport edition. Very low mileage, push-start button, leather seats, panoramic layout, and absolute pristine condition.',
    price: 6800000,
    priceType: 'sale',
    locationAm: 'ሃያ ሁስት (22)፣ አዲስ አበባ',
    locationEn: '22 Road, Addis Ababa',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    phone: '0933445566',
    specifications: [
      { keyAm: 'ሞዴል ዓመት', keyEn: 'Model Year', valueAm: '2019', valueEn: '2019' },
      { keyAm: 'ስርጭት', keyEn: 'Drive Type', valueAm: 'AWD (4WD)', valueEn: 'AWD (4WD)' },
      { keyAm: 'ነዳጅ', keyEn: 'Fuel Type', valueAm: 'ቤንዚን', valueEn: 'Petrol' },
      { keyAm: 'ኪሎሜትር', keyEn: 'Mileage', valueAm: '34,000 ኪ.ሜ', valueEn: '34,000 km' }
    ],
    dateAdded: '2026-05-28',
    isFeatured: true
  },

  // SERVANTS
  {
    id: 's1',
    category: 'servant',
    subCategory: 'የቤት', // Housemaid/Domestic worker
    titleAm: 'ታማኝና ልምድ ያላት የቤት ሰራተኛ (ሞግዚት)',
    titleEn: 'Experienced Housemaid & Nanny',
    descriptionAm: 'ለህፃናት እንክብካቤ፣ ለምግብ ዝግጅት እና ለቤት ማጽዳት ስራዎች የተካነች። የ 3 ዓመት የስራ ልምድ ያላት እና ታማኝነቷ በሰው የተመሰከረላት የቤት ሰራተኛ።',
    descriptionEn: 'Specialized in child care, cooking traditional & modern food, and regular cleaning. 3 years of certified experience with glowing references.',
    price: 8000,
    priceType: 'salary_monthly',
    locationAm: 'ገርጂ፣ አዲስ አበባ',
    locationEn: 'Gerji, Addis Ababa',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    phone: '0977889900',
    specifications: [
      { keyAm: 'ተፈላጊ ደመወዝ', keyEn: 'Expected Salary', valueAm: '8,000 ብር / በወር', valueEn: '8,000 ETB/month' },
      { keyAm: 'ልምድ', keyEn: 'Experience', valueAm: '3 ዓመት', valueEn: '3 Years' },
      { keyAm: 'ክህሎት', keyEn: 'Skills', valueAm: 'ባህል ምግብ ማብሰል፣ ህጻናት እንክብካቤ', valueEn: 'Traditional Cooking, Toddler Care' },
      { keyAm: 'የስራ አይነት', keyEn: 'Type', valueAm: 'አዳሪ (ሙሉ ጊዜ)', valueEn: 'Live-in (Full-time)' }
    ],
    dateAdded: '2026-05-27',
    isFeatured: true
  },
  {
    id: 's2',
    category: 'servant',
    subCategory: 'ተመላላሽ', // Commuter/Part-time
    titleAm: 'ተመላላሽ የቤት ሰራተኛ እና አልባሳት አጣቢ',
    titleEn: 'Part-Time (Commuter) Cook & Laundry Assistant',
    descriptionAm: 'በሳምንት 3 ወይም 4 ቀናት በመጣላት ምግብ ማብሰል፣ ልብስ ማጠብና መተኮስ የምትችል ተመላላሽ ሰራተኛ።',
    descriptionEn: 'Reliable commuter house assistant for cooking, laundry & ironing. Available 3-4 days a week for part-time hiring.',
    price: 4500,
    priceType: 'salary_monthly',
    locationAm: 'ሳር ቤት፣ አዲስ አበባ',
    locationEn: 'Sar Bet, Addis Ababa',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    phone: '0988990011',
    specifications: [
      { keyAm: 'ደመወዝ', keyEn: 'Salary', valueAm: '4,500 ብር/ወር', valueEn: '4,500 ETB/month' },
      { keyAm: 'ተገኝነት', keyEn: 'Availability', valueAm: 'በሳምንት 3 ቀናት (ተመላላሽ)', valueEn: '3 days a week (Commuter)' },
      { keyAm: 'አካባቢ', keyEn: 'Preffered Area', valueAm: 'ሳር ቤት ወይም ቦሌ ቅርብ', valueEn: 'Sar Bet / Bole area' }
    ],
    dateAdded: '2026-05-26'
  },
  {
    id: 's3',
    category: 'servant',
    subCategory: 'ጥበቃ', // Guard
    titleAm: 'ታማኝ ቀናተኛ እና ጠንካራ የቤት/ህንፃ ጥበቃ ሠራተኛ',
    titleEn: 'Reliable Residential House & Compound Guard',
    descriptionAm: 'ወታደራዊ ኮርስና ስልጠና የወሰደ፣ በታማኝነት ለረጅም ዓመታት በድርጅት ጥበቃ እና በግል ግቢ ጥበቃ ላይ የሰራ ታማኝ ግለሰብ።',
    descriptionEn: 'Finished formal guard training. Many years of experience guarding private residences and commercial warehouses. Impeccable background records.',
    price: 6500,
    priceType: 'salary_monthly',
    locationAm: 'ለቡ፣ አዲስ አበባ',
    locationEn: 'Lebu, Addis Ababa',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80',
    phone: '0911778844',
    specifications: [
      { keyAm: 'ደመወዝ', keyEn: 'Salary', valueAm: '6,500 ብር / ወር', valueEn: '6,500 ETB/month' },
      { keyAm: 'ልምድ', keyEn: 'Experience', valueAm: '5 ዓመት በላይ', valueEn: '5+ Years' },
      { keyAm: 'ስልጠና', keyEn: 'Training', valueAm: 'መሰረታዊ የጥበቃ ስልጠና', valueEn: 'Basic Security & Guarding Certificate' },
      { keyAm: 'ሰዓት', keyEn: 'Shift', valueAm: 'ከፊል/ሙሉ ጊዜ (አዳሪ)', valueEn: 'Night/Day shift or Live-in' }
    ],
    dateAdded: '2026-05-28'
  },
  {
    id: 's4',
    category: 'servant',
    subCategory: 'ካሼር', // Cashier
    titleAm: 'ልምድ ያላት ፈጣን የካፌ/ሱፐርማርኬት ካሼር ሰራተኛ',
    titleEn: 'Professional Supermarket/Cafe Cashier',
    descriptionAm: 'የአካውንቲንግ ወይም የማኔጅመንት ዲፕሎማ ያላት፣ ኮምፒውተርና የሽያጭ ሶፍትዌሮችን (POS system) በደንብ የምትችል ካሼር።',
    descriptionEn: 'Diploma in Accounting or Management. Skilled in computer basics and modern Point of Sale (POS) software. Friendly customer service skills.',
    price: 10000,
    priceType: 'salary_monthly',
    locationAm: 'ሲኤምሲ (CMC)፣ አዲስ አበባ',
    locationEn: 'CMC, Addis Ababa',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
    phone: '0912002122',
    specifications: [
      { keyAm: 'ደረጃ', keyEn: 'Education', valueAm: 'ዲፕሎማ / Accounting', valueEn: 'Diploma in Accounting' },
      { keyAm: 'ልምድ', keyEn: 'Experience', valueAm: '2 ዓመት', valueEn: '2 Years' },
      { keyAm: 'ሶፍትዌር', keyEn: 'POS System', valueAm: 'በጣም ጎበዝ', valueEn: 'Highly Expert' }
    ],
    dateAdded: '2026-05-25'
  },
  {
    id: 's5',
    category: 'servant',
    subCategory: 'አስተናጋጅ', // Waitress
    titleAm: 'ፈገግተኛ እና ቅልጥፍና ያላት ካፌ/ሬስቶራንት አስተናጋጅ',
    titleEn: 'Friendly Coffee Shop & Restaurant Waitress',
    descriptionAm: 'ደንበኛ ማስተናገድ የምትወድ፣ በስራዋ ላይ ፈጣንና ትጉ የሆነች ልምድ ያላት አስተናጋጅ።',
    descriptionEn: 'Enthusiastic waitress with 1+ years experience in busy restaurants and high-volume cafes. Attentive and customer-friendly.',
    price: 6000,
    priceType: 'salary_monthly',
    locationAm: 'ቺቺኒያ (Chichinia)፣ አዲስ አበባ',
    locationEn: 'Chichinia, Addis Ababa',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    phone: '0944005522',
    specifications: [
      { keyAm: 'ደመወዝ', keyEn: 'Salary', valueAm: '6,000 ብር + ቲፕ', valueEn: '6,000 ETB + Tips' },
      { keyAm: 'ቋንቋ', keyEn: 'Languages', valueAm: 'አማርኛ፣ እንግሊዝኛ (መካከለኛ)', valueEn: 'Amharic, Conversational English' }
    ],
    dateAdded: '2026-05-24'
  },
  {
    id: 's6',
    category: 'servant',
    subCategory: 'ባር ማን', // Barman
    titleAm: 'ባለሙያ የኮክቴል እና የቡና ባርማን ሠራተኛ',
    titleEn: 'Professional Cocktail & Coffee Barman/Barista',
    descriptionAm: 'የተለያዩ ኮክቴሎችን፣ ሞክቴሎችን እና ባህላዊ/ዘመናዊ ቡናዎችን ማዘጋጀት የሚችል ባለሙያ።',
    descriptionEn: 'Skilled barista and bartender. Proficient in preparing cocktails, mocktails, juices, and specialty espresso coffees.',
    price: 12000,
    priceType: 'salary_monthly',
    locationAm: 'ካዛንቺስ፣ አዲስ አበባ',
    locationEn: 'Kazanchis, Addis Ababa',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    phone: '0955443311',
    specifications: [
      { keyAm: 'ልምድ', keyEn: 'Experience', valueAm: '4 ዓመት', valueEn: '4 Years' },
      { keyAm: 'ከፍተኛ ብቃት', keyEn: 'Strong Expertise', valueAm: 'ኤስፕሬሶ ማሽኖች፣ ላቴ አርት', valueEn: 'Espresso Machines, Latte Art' }
    ],
    dateAdded: '2026-05-26'
  },
  {
    id: 's7',
    category: 'servant',
    subCategory: 'ፅዳት', // Cleaning
    titleAm: 'ለድርጅቶች ወይም ለትላልቅ ህንጻዎች ታማኝ የፅዳት ሰራተኛ',
    titleEn: 'Office & Commercial Cleaning Professional',
    descriptionAm: 'ስራዋን የምትወድ፣ ለታማኝነት ማረጋገጫ ማቅረብ የምትችል፣ ለድርጅት ቢሮዎች ወይም ለሆቴል ፅዳት የተዘጋጀች።',
    descriptionEn: 'Capable cleaner for commercial offices or guest houses. Hardworking, punctual, and highly recommended with solid references.',
    price: 5000,
    priceType: 'salary_monthly',
    locationAm: 'ፒያሳ፣ አዲስ አበባ',
    locationEn: 'Piassa, Addis Ababa',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80', // same cleaning placeholder but solid
    phone: '0911002233',
    specifications: [
      { keyAm: 'ተመራጭ ሰዓት', keyEn: 'Type', valueAm: 'ሙሉ ጊዜ (ተመላላሽ)', valueEn: 'Full-time Commuter' },
      { keyAm: 'ልምድ', keyEn: 'Experience', valueAm: '2 ዓመት', valueEn: '2 Years' }
    ],
    dateAdded: '2026-05-27'
  }
];

export const AMHARIC_TRANSLATIONS = {
  appName: 'ደላላው',
  appMotto: 'ታማኝ የቤት፣ የመኪና እና የሰራተኛ ዲጂታል አገናኝ',
  home: 'ዋና ገጽ',
  listings: 'ዝርዝሮች',
  postRequest: 'ማስታወቂያ / ፍላጎት ይለጥፉ',
  calculator: 'የደላላ ኮሚሽን',
  about: 'ስለ እኛ',
  house: 'ቤት',
  car: 'መኪና',
  servant: 'ሰራተኛ',
  all: 'အားလုံး',
  searchPlaceholder: 'በመግለጫ፣ አካባቢ ወይም ርዕስ ይፈልጉ...',
  filterByCategory: 'በምድብ ይምረጡ',
  filterBySubCategory: 'በዝርዝር ምድብ ይምረጡ',
  toRent: 'የሚከራይ',
  toSell: 'የሚሸጥ',
  housemaid: 'የቤት',
  commuter: 'ተመላላሽ',
  cleaning: 'ፅዳት',
  guard: 'ጥበቃ',
  waiter: 'አስተናጋጅ',
  cashier: 'ካሼр',
  barman: 'ባር ማን',
  others: 'ሌሎችም',
  location: 'አካባቢ',
  price: 'ዋጋ',
  details: 'ዝርዝር ሁኔታ',
  contactBroker: 'ደላላውን አግኝ',
  callSMS: 'በስልክ / SMS ያነጋግሩ',
  submitRequest: 'ፍላጎትዎን ለደላላው ይንገሩ (ይዘዙ)',
  requestTitle: 'ስልክ ቁጥርዎን እና ፍላጎትዎን ይተው፣ ፈጣን ደላላ እናገናኝዎታለን።',
  successMessage: 'ፍላጎትዎ በተሳካ ሁኔታ ተመዝግቧል! በጥቂት ደቂቃዎች ውስጥ ደዋይ ደላላ ያገኘዎታል።',
  commissionCalculatorTitle: 'የደላላ ኮሚሽን ማስያ (Brokerage Fee Calculator)',
  commissionExplanation: 'በኢትዮጵያ የስራ ፈጠራ እና የደላላ ባህል መሰረት፣ በመደበኛነት የሚከተለው የኮሚሽን ተመን ይተገበራል፡',
  commissionHouseRent: 'ቤት ኪራይ፡ የ1 ወር ኪራይ መጠን 10% (ወይም እንደ ስምምነቱ)',
  commissionHouseSale: 'ቤት ሽያጭ፡ 2% ከጠቅላላው ሽያጭ',
  commissionCarRent: 'መኪና ኪራይ፡ ከጠቅላላ ውል 10%',
  commissionCarSale: 'መኪና ሽያጭ፡ 2% ከጠቅላላው ሽያጭ',
  commissionServantHiring: 'ሰራተኛ ቅጥር፡ የአንድ ወር ደመወዝ 10% - 20% የአገልግሎት ክፍያ',
  inputPriceToCalc: 'የቤት/የመኪና ሽያጭ ወይም ኪራይ ዋጋ ያስገቡ (ብር)፡',
  calculate: 'አስላ',
  agentFee: 'የደላላው ኮሚሽን (ግምት)፡',
  disclaimer: '* ማሳሰቢያ፡ ይህ ግምታዊ ክፍያ ሲሆን ከዋናው ደላላ ጋር በሚያደርጉት ድርድር ሊቀንስ ወይም ሊጨምር ይችላል።',
  postRequestBtn: 'ደላላ እዘዝ / ፍላጎት መዝግብ',
  viewAll: 'ሁሉንም እይ',
  featuredListings: 'ልዩ ትኩረት የተሰጣቸው ዝርዝሮች (Featured Listings)',
  viewDetails: 'ዝርዝሩን እይ',
  phonePlaceholder: 'ለምሳሌ 0911223344',
  fullName: 'ሙሉ ስም',
  requiredField: 'አስፈላጊ መረጃ ነው',
  detailsPlaceholder: 'ለምሳሌ፡ ቦሌ አካባቢ 3 መኝታ ቤት ያለው የሚከራይ ቪላ እፈልጋለሁ። ወይም ቶዮታ ይተስ መኪና የሚሸጥ ካለ ማግኘት እፈልጋለሁ።',
  cancel: 'ይቅር',
  loading: 'በመጫን ላይ ነው...',
  subCategoriesHeader: 'ንዑስ ምድቦች'
};

export const ENGLISH_TRANSLATIONS = {
  appName: 'Delalaw',
  appMotto: 'Your Trusted Digital Broker for Houses, Cars, and Staff',
  home: 'Home',
  listings: 'Listings',
  postRequest: 'Post Requirement',
  calculator: 'Commission Desk',
  about: 'About Us',
  house: 'House',
  car: 'Car',
  servant: 'Servants & Staff',
  all: 'All',
  searchPlaceholder: 'Search by title, description, or location...',
  filterByCategory: 'Filter by Grid',
  filterBySubCategory: 'Filter by Spec',
  toRent: 'To Rent',
  toSell: 'To Sell',
  housemaid: 'Housemaid',
  commuter: 'Commuter/Part-time',
  cleaning: 'Cleaning',
  guard: 'Security/Guard',
  waiter: 'Waiter/Waitress',
  cashier: 'Cashier',
  barman: 'Barman',
  others: 'Others',
  location: 'Location',
  price: 'Price',
  details: 'Details',
  contactBroker: 'Contact Broker Agent',
  callSMS: 'Contact via Phone / SMS',
  submitRequest: 'Submit Custom Request to Broker',
  requestTitle: 'Submit your requirement, our active digital brokers will match it instantly.',
  successMessage: 'Your request has been successfully registered! A matched broker will call you shortly.',
  commissionCalculatorTitle: 'Ethiopian Brokerage Fee (Delala) Calculator',
  commissionExplanation: 'According to typical brokerage customs in Ethiopia, the standard Delala commission is calculation:',
  commissionHouseRent: 'House Rental: 10% of 1st month rent (or full 1 month depending on contract)',
  commissionHouseSale: 'House Sale: 2% of the total transaction price',
  commissionCarRent: 'Car Rent: 10% of total lease duration',
  commissionCarSale: 'Car Sale: 2% of the grand deal price',
  commissionServantHiring: 'Hiring Staff: Flat admin/setup fee or percentage of monthly salary',
  inputPriceToCalc: 'Enter House/Car Price or Salary in ETB:',
  calculate: 'Calculate Commission',
  agentFee: 'Estimated Broker Fee:',
  disclaimer: '* Note: This is an estimated customary fee. Actual commission may vary depending on direct agreement with your representative.',
  postRequestBtn: 'Post Custom Order / Hire Broker',
  viewAll: 'View All',
  featuredListings: 'Featured Custom Listings',
  viewDetails: 'Details',
  phonePlaceholder: 'e.g. 0911223344',
  fullName: 'Full Name',
  requiredField: 'This field is required',
  detailsPlaceholder: 'e.g., Looking for a 3-bedroom apartment for rent around Bole or Old Airport.',
  cancel: 'Cancel',
  loading: 'Loading Broker Desk...',
  subCategoriesHeader: 'Sub-Categories Available'
};
