export type CategoryType = 'house' | 'car' | 'servant';

export interface Listing {
  id: string;
  category: CategoryType;
  subCategory: string; // e.g., 'rent', 'sell', 'housemaid', 'cook', etc.
  titleAm: string;
  titleEn: string;
  descriptionAm: string;
  descriptionEn: string;
  price?: number; // Price in Birr
  priceType?: 'rent' | 'sale' | 'salary_monthly' | 'salary_negotiable';
  locationAm: string;
  locationEn: string;
  image: string;
  images?: string[];
  phone: string;
  specifications: {
    keyAm: string;
    keyEn: string;
    valueAm: string;
    valueEn: string;
  }[];
  dateAdded: string;
  isFeatured?: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'rented' | 'sold' | 'hired';
}

export interface SearchFilters {
  searchQuery: string;
  category: CategoryType | 'all';
  subCategory: string | 'all';
  priceRange: [number, number];
  location: string;
}

export interface UserRequest {
  id: string;
  name: string;
  phone: string;
  requestType: CategoryType;
  subCategory: string;
  details: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}
