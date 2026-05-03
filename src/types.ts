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
}

export interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isDisplaced?: boolean; // Specific flag for the target audience
}
