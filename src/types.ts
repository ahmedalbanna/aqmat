export type PropertyType = 'hotel' | 'apartment' | 'hostel';

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  description: string;
  audioDescriptionUrl?: string; // Optional if we use TTS on the fly
  pricePerNight: number;
  image: string;
  amenities: string[];
  location: string;
  rating: number;
  available: boolean;
  isUrgentShelter?: boolean;
  ownerId?: string;
  virtualTourUrl?: string;
  unitsCount: number;
  unitsAvailable: number;
  featured?: boolean;
  detailedRatings?: {
    cleanliness: number;
    location: number;
    value: number;
    service: number;
  };
  reviewsCount?: number;
}

export interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  guestName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked-in' | 'checked-out';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  createdAt: string;
}

export interface FinancialRecord {
  id: string;
  hostId: string;
  amount: number;
  type: 'revenue' | 'settlement' | 'commission';
  date: string;
  status: 'pending' | 'completed';
  description: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isDisplaced?: boolean; 
  walletBalance?: number;
}
