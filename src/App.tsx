import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  Home, 
  Hotel, 
  Building2, 
  Search, 
  MapPin, 
  Star, 
  Volume2, 
  ChevronRight, 
  CreditCard,
  X,
  Menu,
  Heart,
  MessageSquare, 
  Send, 
  Loader2,
  User as UserIcon,
  LogOut,
  Ticket,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { INITIAL_PROPERTIES } from './data';
import { Property, PropertyType, Booking } from './types';
import { cn } from './lib/utils';
import { getPropertySuggestion } from './services/geminiService';

import { HostDashboard } from './components/HostDashboard';

interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// --- Context ---

interface AppState {
  properties: Property[];
  bookings: Booking[];
  wishlist: string[];
  addProperty: (property: Partial<Property>) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  addBooking: (booking: Partial<Booking>) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  toggleWishlist: (propertyId: string) => void;
}

export const AppStateContext = createContext<AppState | null>(null);

export const AppStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const addProperty = (property: Partial<Property>) => {
    setProperties(prev => [...prev, { 
      ...property, 
      id: Date.now().toString(),
      unitsCount: property.unitsCount || 1,
      unitsAvailable: property.unitsAvailable || 1
    } as Property]);
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addBooking = (booking: Partial<Booking>) => {
    setBookings(prev => [...prev, { 
      ...booking, 
      id: Date.now().toString(), 
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: new Date().toISOString() 
    } as Booking]);
  };

  const updateBookingStatus = (id: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  return (
    <AppStateContext.Provider value={{ 
      properties, 
      bookings, 
      wishlist, 
      addProperty, 
      updateProperty,
      addBooking, 
      updateBookingStatus,
      toggleWishlist 
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
};

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USER: FirebaseUser = {
  uid: "mocked-host-uid-1",
  displayName: "أحمد المضيف",
  email: "host@example.com",
  photoURL: "https://i.pravatar.cc/150?u=mocked-host-uid-1"
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setUser(MOCK_USER);
  };

  const logout = async () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// --- Components ---

const Navbar = ({ 
  onOpenBookings, 
  onOpenHostDashboard, 
  onOpenWishlist,
  filter,
  setFilter
}: { 
  onOpenBookings: () => void, 
  onOpenHostDashboard: () => void, 
  onOpenWishlist: () => void,
  filter: string,
  setFilter: (f: any) => void
}) => {
  const { user, login, logout } = useAuth();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFilter('all')}>
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
            أ
          </div>
          <span className="text-2xl font-bold text-primary tracking-tight">أقمت</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-gray-600 font-medium bg-white/50 px-8 py-2.5 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
          <button onClick={() => setFilter('all')} className={cn("hover:text-primary transition-all relative py-1", filter === 'all' && "text-primary font-bold after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full")}>الرئيسية</button>
          <button onClick={() => setFilter('urgent')} className={cn("hover:text-primary transition-all relative py-1", filter === 'urgent' && "text-primary font-bold after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full")}>دعم عاجل</button>
          <button onClick={onOpenWishlist} className="hover:text-primary transition-colors flex items-center gap-1.5 group">
            <Heart size={16} className="group-hover:fill-red-500 group-hover:text-red-500 transition-all" /> 
            المفضلة
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-bold leading-none text-gray-800">{user.displayName}</p>
                <div className="flex gap-2 text-[10px] mt-1">
                  <button onClick={onOpenBookings} className="text-primary hover:underline font-bold">حجوزاتي</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={onOpenHostDashboard} className="text-accent hover:underline font-bold">الإدارة</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={logout} className="text-red-400 hover:underline">خروج</button>
                </div>
              </div>
              <button onClick={onOpenBookings} className="relative group p-0.5 rounded-full border border-primary/20 hover:border-primary transition-colors">
                <img src={user.photoURL || ''} className="w-9 h-9 rounded-full object-cover" alt="" />
                <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-3 h-3 rounded-full border-2 border-white shadow-sm"></div>
              </button>
            </div>
          ) : (
            <button 
              onClick={login}
              className="pill-button font-bold text-sm shadow-xl shadow-primary/10 hover:shadow-primary/20 transition-all"
            >
              تسجيل
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const BottomNav = ({ 
  activeTab, 
  setActiveTab,
  onOpenBookings,
  onOpenWishlist
}: { 
  activeTab: string, 
  setActiveTab: (tab: any) => void,
  onOpenBookings: () => void,
  onOpenWishlist: () => void
}) => {
  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100]">
      <div className="bg-white/95 backdrop-blur-xl border border-white/50 rounded-[28px] shadow-2xl p-2 flex items-center justify-around">
        <button 
          onClick={() => setActiveTab('all')}
          className={cn("flex flex-col items-center gap-1 p-2 rounded-2xl transition-all", activeTab === 'all' ? "text-primary bg-primary/5" : "text-gray-400")}
        >
          <Home size={20} />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>
        <button 
          onClick={() => setActiveTab('urgent')}
          className={cn("flex flex-col items-center gap-1 p-2 rounded-2xl transition-all", activeTab === 'urgent' ? "text-green-600 bg-green-50" : "text-gray-400")}
        >
          <Search size={20} />
          <span className="text-[10px] font-bold">عاجل</span>
        </button>
        <button 
          onClick={onOpenWishlist}
          className="flex flex-col items-center gap-1 p-2 rounded-2xl text-gray-400"
        >
          <Heart size={20} />
          <span className="text-[10px] font-bold">المفضلة</span>
        </button>
        <button 
          onClick={onOpenBookings}
          className="flex flex-col items-center gap-1 p-2 rounded-2xl text-gray-400"
        >
          <Ticket size={20} />
          <span className="text-[10px] font-bold">حجوزاتي</span>
        </button>
      </div>
    </div>
  );
};

const PropertyCard = ({ property, onClick }: { property: Property; onClick: () => void; key?: string }) => {
  const { wishlist, toggleWishlist } = useAppState();
  const isWishlisted = wishlist.includes(property.id);

  return (
    <motion.div 
      layoutId={property.id}
      onClick={onClick}
      className={cn(
        "group relative bg-white rounded-[28px] overflow-hidden shadow-sm hover:shadow-2xl transition-all border cursor-pointer",
        property.isUrgentShelter ? "border-green-500/40 ring-1 ring-green-100" : "border-gray-100"
      )}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4 }}
    >
      <div className="aspect-[4/3] overflow-hidden relative">
        <img 
          src={property.image} 
          alt={property.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
        />
        <div className="absolute top-4 left-4 z-10">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(property.id);
            }}
            className={cn(
              "p-2.5 rounded-full shadow-md transition-all active:scale-90",
              isWishlisted ? "bg-red-500 text-white" : "bg-white/90 backdrop-blur text-gray-500 hover:text-red-500"
            )}
          >
            <Heart size={18} fill={isWishlisted ? "white" : "none"} />
          </button>
        </div>
        
        {property.isUrgentShelter && (
          <div className="absolute top-4 right-4 z-10 bg-green-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-sm bg-opacity-90">
            <CheckCircle size={12} />
            تأكيد فوري
          </div>
        )}

        <div className="absolute bottom-4 right-4 z-10 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-sm font-bold border border-white/10">
          {property.pricePerNight}$ <span className="text-[10px] font-normal text-gray-300">/ ليلة</span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">
          <MapPin size={12} className="text-primary" />
          <span className="truncate">{property.location}</span>
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-900 title-serif leading-tight group-hover:text-primary transition-colors">{property.name}</h3>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-lg border border-yellow-100">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-sm text-yellow-700">{property.rating}</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 bg-gray-50 text-gray-500 rounded-md border border-gray-100 uppercase tracking-tighter">
            {property.type === 'hotel' ? 'فندق' : property.type === 'apartment' ? 'شقة' : 'نُزُل'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const FilterBar = ({ activeType, setActiveType }: { activeType: PropertyType | 'all', setActiveType: (t: PropertyType | 'all') => void }) => {
  const filters = [
    { id: 'all', label: 'الكل', icon: Home },
    { id: 'hotel', label: 'فنادق', icon: Hotel },
    { id: 'apartment', label: 'شقق', icon: Building2 },
    { id: 'hostel', label: 'نُزُل', icon: Home },
  ];

  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-4 mb-8 scrollbar-hide">
      {filters.map((f) => {
        const Icon = f.icon;
        return (
          <button
            key={f.id}
            onClick={() => setActiveType(f.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-full border transition-all whitespace-nowrap",
              activeType === f.id 
                ? "bg-primary text-white border-primary shadow-md" 
                : "bg-white text-gray-600 border-gray-200 hover:border-primary/50"
            )}
          >
            <Icon size={18} />
            <span className="font-medium">{f.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const PropertyDetails = ({ property, onClose, onBook }: { property: Property; onClose: () => void; onBook: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleSpeak = () => {
    if (property.audioDescriptionUrl) {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(property.description);
      utterance.lang = 'ar-SA';
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <audio 
        ref={audioRef} 
        src={property.audioDescriptionUrl} 
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      <motion.div 
        layoutId={property.id}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white w-full max-w-5xl md:max-h-[90vh] h-[95vh] md:h-auto rounded-t-[40px] md:rounded-[40px] overflow-hidden relative shadow-2xl flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 z-20 p-2.5 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition-all active:scale-95"
        >
          <X size={24} />
        </button>

        <div className="w-full md:w-1/2 h-[350px] md:h-auto relative shrink-0">
          <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:hidden" />
          {property.virtualTourUrl && (
            <button className="absolute bottom-6 right-6 bg-white/95 backdrop-blur px-5 py-2.5 rounded-full font-bold text-xs shadow-xl flex items-center gap-2 hover:bg-white transition-all transform hover:scale-105 active:scale-95 border border-white/20">
              <Building2 size={16} /> جولة 360°
            </button>
          )}
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-12 overflow-y-auto bg-[#fafafb] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-primary font-bold tracking-widest uppercase text-[10px] md:text-xs">
              {property.type === 'hotel' ? 'منشأة فاخرة' : property.type === 'apartment' ? 'سكن عائلي' : 'نُزُل اقتصادي'}
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold ring-1 ring-yellow-200">
              <Star size={14} className="fill-yellow-600 border-none" />
              {property.rating} • {property.reviewsCount || 0} تقييم
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 title-serif text-gray-900 leading-tight">{property.name}</h2>
          
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-8 font-medium">
            <MapPin size={16} className="text-primary" />
            <span>{property.location}</span>
          </div>

          <div className="mb-8 p-6 bg-white rounded-[32px] relative border border-gray-100 shadow-sm group">
            <button 
              onClick={handleSpeak}
              className={cn(
                "absolute -top-4 left-6 p-4 rounded-full shadow-xl transition-all active:scale-90",
                isPlaying ? "bg-primary text-white ring-8 ring-primary/10 animate-pulse" : "bg-white text-primary border border-gray-100 hover:bg-gray-50"
              )}
            >
              <Volume2 size={24} />
            </button>
            <h4 className="font-bold text-xs mb-3 text-gray-400 uppercase tracking-widest">التجربة الصوتية والوصف</h4>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base font-medium">
              {property.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-5 rounded-3xl border border-gray-100">
              <h5 className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-wider">تفاصيل الجودة</h5>
              <div className="space-y-3">
                {[
                  { label: 'النظافة', score: property.detailedRatings?.cleanliness },
                  { label: 'الموقع', score: property.detailedRatings?.location },
                  { label: 'القيمة', score: property.detailedRatings?.value }
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">{r.label}</span>
                    <div className="flex-1 mx-3 h-1.5 bg-gray-50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${(r.score || 0) * 20}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-accent" 
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-900">{r.score || '-'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-100">
               <h5 className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-wider">المرافق المتاحة</h5>
               <div className="flex flex-wrap gap-2">
                  {property.amenities.map(a => (
                    <span key={a} className="px-3 py-1.5 bg-gray-50 text-[10px] font-bold text-gray-600 rounded-xl border border-gray-100">{a}</span>
                  ))}
               </div>
            </div>
          </div>

          <div className="mt-auto sticky bottom-0 bg-[#fafafb]/95 backdrop-blur-md pt-6 pb-2 border-t border-gray-100 flex items-center justify-between gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">السعر النهائي</span>
              <span className="text-3xl font-bold text-primary">{property.pricePerNight}$ <span className="text-sm font-normal text-gray-400">/ ليلة</span></span>
            </div>
            <button 
              onClick={onBook}
              className="bg-primary text-white flex-1 py-5 rounded-[20px] font-bold text-lg shadow-2xl shadow-primary/20 hover:bg-[#3d3d2a] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
            >
              حجز فوري وآمن
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const BookingModal = ({ property, onClose, onConfirm }: { property: Property; onClose: () => void; onConfirm: () => void }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pin, setPin] = useState('');

  const handlePay = async () => {
    if (pin.length !== 4) return;
    
    setStep(2); // Processing Show
    
    // Simulate network delay for Shellen Pay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await onConfirm();
    setStep(3); // Success Show
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative"
      >
        {step === 1 && (
          <motion.div exit={{ opacity: 0, x: -20 }} className="relative">
            {/* Shellen Header */}
            <div className="bg-[#0f172a] text-white p-6 pb-10 rounded-b-[32px] shadow-sm relative z-10 w-full overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              <div className="flex justify-between items-center mb-6 relative">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-serif italic font-bold">ش</div>
                  <span className="font-bold text-xl tracking-wider">شِلّن PAY</span>
                </div>
                <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full backdrop-blur font-medium">بوابة دفع آمنة</span>
              </div>
              <p className="text-gray-400 text-sm mb-1 font-medium relative">إجمالي المبلغ المطلوب</p>
              <h2 className="text-4xl font-bold font-sans relative">{property.pricePerNight} <span className="text-lg font-medium text-gray-400">USD</span></h2>
            </div>

            <div className="p-8 -mt-6 bg-white relative z-0">
              <div className="mb-8 bg-gray-50/80 p-4 border border-gray-100 rounded-2xl flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <img src={property.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 line-clamp-1 title-serif leading-tight mb-1">{property.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">
                    1 ليلة • {property.type === 'hotel' ? 'فندق' : property.type === 'apartment' ? 'شقة' : 'نُزُل'}
                  </p>
                </div>
              </div>

              <div className="space-y-5 mb-8">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-2 px-1">رقم هاتف محفظة شِلّن</label>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus-within:border-[#0f172a] focus-within:bg-white transition-colors">
                    <span className="text-gray-400 font-sans font-medium text-lg">+964</span>
                    <div className="w-px h-6 bg-gray-200"></div>
                    <input type="text" defaultValue="770 123 4567" className="w-full text-lg font-sans font-medium outline-none bg-transparent" dir="ltr" />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-2 px-1">الرقم السري (PIN)</label>
                  <div className="flex gap-2 justify-between" dir="ltr">
                    {[0, 1, 2, 3].map((i) => (
                      <input
                        key={i}
                        type="password"
                        maxLength={1}
                        className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-2xl text-center text-xl font-bold focus:border-[#0f172a] focus:bg-white outline-none transition-colors"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            const newPin = pin.split('');
                            newPin[i] = val;
                            setPin(newPin.join(''));
                            const next = e.target.nextElementSibling as HTMLInputElement;
                            if (next) next.focus();
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handlePay}
                  disabled={pin.length !== 4}
                  className="w-full bg-[#0f172a] text-white py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 hover:bg-[#1e293b] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  دفع {property.pricePerNight}$ الآن
                </button>
                <button onClick={onClose} className="w-full text-gray-500 font-bold py-3 hover:text-gray-900 transition-colors">إلغاء والعودة</button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-12 text-center min-h-[400px] flex flex-col items-center justify-center"
          >
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center font-serif italic text-indigo-600 font-bold text-xl">
                ش
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">جاري معالجة الدفع...</h3>
            <p className="text-gray-500">يرجى الانتظار وعدم إغلاق النافذة</p>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="p-8 text-center bg-gray-50"
          >
            <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30">
              <CheckCircle size={40} />
            </div>
            
            <h3 className="text-2xl font-bold mb-2 title-serif text-gray-900">عملية ناجحة</h3>
            <p className="text-gray-500 mb-8 text-sm">تم الدفع وتأكيد الحجز بنجاح.</p>
            
            {/* Ticket Mock */}
            <div className="bg-white rounded-2xl p-6 mb-8 text-right border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-1 bg-green-500" />
              <div className="flex items-center gap-3 mb-6">
                <Ticket className="text-primary" />
                <span className="font-bold text-gray-900">إيصال الحجز الرقمي</span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-end border-b border-dashed border-gray-100 pb-3">
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">المنشأة</span>
                    <span className="font-bold text-gray-900 line-clamp-1">{property.name}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-end border-b border-dashed border-gray-100 pb-3">
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">تاريخ الدخول</span>
                    <span className="font-bold text-gray-900">
                      {format(new Date(), 'dd MMM yyyy', { locale: ar })}
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-xs text-gray-400 block mb-1">المبلغ</span>
                    <span className="font-bold text-[#0f172a] font-sans">{property.pricePerNight}$</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-500">رقم المرجع (شِلّن)</span>
                <span className="font-mono font-bold text-gray-900 tracking-widest">
                  SH-{Math.floor(Math.random()*10000).toString().padStart(4, '0')}
                </span>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-[#4a4a35] transition-colors"
            >
              عرض الحجز في تذاكري
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

const UserBookingsModal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const { bookings: allBookings, properties } = useAppState();
  
  const bookings = allBookings
    .filter(b => b.userId === user?.uid)
    .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const loading = false;

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#f5f2ed] w-full max-w-4xl max-h-[90vh] rounded-[40px] overflow-hidden flex flex-col shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="bg-white p-8 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-4">
            <img src={user.photoURL || ''} className="w-16 h-16 rounded-2xl" alt=""/>
            <div>
              <h2 className="text-2xl font-bold title-serif">{user.displayName}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Ticket className="text-primary" />
            التذاكر الرقمية والحجوزات العاجلة
          </h3>

          {loading ? (
             <div className="flex items-center justify-center h-40">
               <Loader2 className="animate-spin text-primary" size={32} />
             </div>
          ) : bookings.length === 0 ? (
            <div className="text-center text-gray-500 py-10 bg-white rounded-3xl border border-gray-100 border-dashed">
              لا توجد حجوزات نشطة حالياً.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {bookings.map(booking => {
                const prop = properties.find(p => p.id === booking.propertyId);
                if (!prop) return null;
                
                return (
                  <div key={booking.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col relative">
                    {prop.isUrgentShelter && (
                       <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full z-10 font-bold">مأوى مدعوم</div>
                    )}
                    <div className="flex p-4 gap-4 border-b border-dashed border-gray-200">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                        <img src={prop.image} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold leading-tight line-clamp-1 title-serif mb-1">{prop.name}</h4>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>المرجع: SHLN-{booking.id.slice(-6).toUpperCase()}</p>
                          <p>بتاريخ: {format(new Date(booking.createdAt), 'dd MMM yyyy', { locale: ar })}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-gray-50 flex items-center gap-6 justify-between flex-1">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">رمز الدخول السريع</p>
                        <p className="font-bold text-gray-900 border-b pb-2 mb-2">أبرز هذا الرمز عند الوصول</p>
                        <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                          <CheckCircle size={16} />
                          مؤكد ({booking.status})
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                        <QRCodeSVG value={`AQAMT:${booking.id}:${user.uid}`} size={80} level="M" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// --- AIChat Component ---

const MessageBubble = ({ message, key }: { message: { role: 'user' | 'ai', text: string }, key?: number }) => (
  <div key={key} className={cn(
    "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed",
    message.role === 'user' ? "mr-auto bg-primary text-white" : "ml-auto bg-white border border-gray-100 shadow-sm text-gray-800"
  )}>
    {message.text}
  </div>
);

const AIChat = ({ properties }: { properties: Property[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;
    
    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setIsLoading(true);

    const aiRes = await getPropertySuggestion(userMsg, properties);
    setMessages(prev => [...prev, { role: 'ai', text: aiRes || 'عذراً، لم أستطع فهم طلبك.' }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-24 md:bottom-8 left-6 md:left-8 z-[120]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, x: -20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: -20 }}
            className="absolute bottom-20 left-0 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
          >
            <div className="p-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={20} />
                <span className="font-bold">مساعد أقمت الذكي</span>
              </div>
              <button onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>

            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.length === 0 && (
                <p className="text-center text-gray-400 mt-10">مرحباً! كيف يمكنني مساعدتك اليوم في العثور على مكان إقامتك؟</p>
              )}
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} />
              ))}
              {isLoading && (
                <div className="ml-auto bg-white border border-gray-100 shadow-sm p-3 rounded-2xl flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-primary" />
                  <span className="text-xs text-gray-500">جاري التفكير...</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اسأل عن أي شيء..." 
                className="flex-1 outline-none text-sm"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="p-2 bg-primary text-white rounded-xl disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-95"
      >
        <MessageSquare size={28} />
      </button>
    </div>
  );
};

const WishlistModal = ({ onClose }: { onClose: () => void }) => {
  const { wishlist, properties } = useAppState();
  const wishlistedProperties = properties.filter(p => wishlist.includes(p.id));
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] overflow-hidden flex flex-col shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-gray-50 rounded-full shadow-sm hover:bg-gray-100 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-8 border-b border-gray-100 bg-[#fef2f2]/50">
          <h2 className="text-2xl font-bold title-serif flex items-center gap-2 text-red-600">
            <Heart size={24} fill="currentColor" /> قائمة الأمنيات
          </h2>
          <p className="text-gray-500 text-sm">الأماكن التي تود زيارتها لاحقاً</p>
        </div>

        <div className="p-8 overflow-y-auto flex-1 bg-gray-50/30">
          {wishlistedProperties.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <Heart size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 font-bold">قائمتك فارغة حالياً</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {wishlistedProperties.map(p => (
                <PropertyCard key={p.id} property={p} onClick={() => setSelectedProp(p)} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {selectedProp && (
          <PropertyDetails property={selectedProp} onClose={() => setSelectedProp(null)} onBook={() => {}} />
        )}
      </AnimatePresence>
    </div>
  );
};

const MainApp = () => {
  const { user, login } = useAuth();
  const { properties, bookings, addBooking, addProperty, updateProperty, updateBookingStatus } = useAppState();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [bookingProperty, setBookingProperty] = useState<Property | null>(null);
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [filter, setFilter] = useState<PropertyType | 'all' | 'urgent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [guests, setGuests] = useState(1);

  const filteredProperties = properties.filter(p => {
    if (filter === 'urgent') return p.isUrgentShelter;
    const matchType = filter === 'all' || p.type === filter;
    const matchSearch = p.name.includes(searchQuery) || p.location.includes(searchQuery) || p.description.includes(searchQuery);
    return matchType && matchSearch;
  });

  const handleBookingConfirm = async (property: Property) => {
    if (!user) {
      login();
      return;
    }

    addBooking({
      propertyId: property.id,
      userId: user.uid,
      guestName: user.displayName || 'ضيف غير معروف',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
      totalPrice: property.pricePerNight,
    });
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar 
        onOpenBookings={() => setIsBookingsModalOpen(true)} 
        onOpenHostDashboard={() => setIsHostModalOpen(true)}
        onOpenWishlist={() => setIsWishlistModalOpen(true)}
        filter={filter}
        setFilter={setFilter}
      />
      
      <main className="max-w-7xl mx-auto px-4 pt-32">
        {/* Luxury Hero Section with Smart Search */}
        <div className="mb-8 md:mb-16 relative rounded-[32px] md:rounded-[48px] bg-white border border-gray-100 overflow-hidden shadow-sm p-6 md:p-20 text-center">
          <div className="absolute inset-0 opacity-10 pointer-events-none oval-mask bg-primary/20" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl md:text-7xl font-bold mb-6 text-gray-900 title-serif max-w-4xl mx-auto leading-tight"
            >
              أينما تكون وجهتك، <br/>
              <span className="text-primary italic relative">
                مقر إقامتك
                <svg className="absolute -bottom-2 left-0 w-full h-2 text-accent/40" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </span> بانتظارك
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed px-4"
            >
              منصة رقمية شاملة لحجز غرف فندقية، وشقق مفروشة، ونُزُل. ندعم المسافرين والباحثين عن مأوى مؤقت بخواص بحث ذكية ووصف صوتي احترافي.
            </motion.p>
            
            <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-2xl p-2 rounded-[24px] md:rounded-[32px] shadow-2xl shadow-primary/5 border border-white/50 flex flex-col md:flex-row items-stretch gap-2">
              <div className="flex-1 flex items-center gap-3 px-6 py-4 border-b md:border-b-0 md:border-l border-gray-100">
                <Search size={20} className="text-primary shrink-0" />
                <input 
                  type="text" 
                  placeholder="إلى أين أنت ذاهب؟ (مدينة، مأوى)" 
                  className="w-full bg-transparent outline-none font-medium placeholder:text-gray-400 text-sm md:text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex-1 flex items-center gap-3 px-6 py-4 border-b md:border-b-0 md:border-l border-gray-100 group cursor-pointer hover:bg-gray-50/50 transition-colors">
                <Calendar size={20} className="text-primary shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">التواريخ</span>
                  <span className="text-sm font-medium text-gray-600">اختر موعد الإقامة</span>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-3 px-6 py-4 border-l border-gray-100">
                <UserIcon size={20} className="text-primary shrink-0" />
                <div className="flex flex-col items-start translate-y-[-2px]">
                   <span className="text-[10px] text-gray-400 font-bold uppercase">الضيوف</span>
                   <select 
                    className="bg-transparent outline-none font-medium appearance-none text-sm cursor-pointer"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                  >
                    <option value={1}>1 شخص</option>
                    <option value={2}>شخصين</option>
                    <option value={4}>عائلة (4+)</option>
                  </select>
                </div>
              </div>
              <button className="bg-primary text-white px-8 md:px-12 py-4 rounded-xl md:rounded-2xl font-bold shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95">
                <Search size={18} />
                <span>بحث ذكي</span>
              </button>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {[
              { id: 'all', label: 'الكل', icon: Home },
              { id: 'hotel', label: 'فنادق نُخبة', icon: Hotel },
              { id: 'apartment', label: 'شقق سكنية', icon: Building2 },
              { id: 'urgent', label: 'دعم عاجل', icon: CheckCircle },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={cn(
                  "flex items-center gap-3 px-6 py-3.5 rounded-full border transition-all whitespace-nowrap font-bold text-sm",
                  filter === f.id 
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" 
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                )}
              >
                <f.icon size={18} />
                {f.label}
              </button>
            ))}
          </div>
          
          <div className="hidden md:block text-sm text-gray-500 font-medium">
            عرض <span className="font-bold text-gray-900">{filteredProperties.length}</span> من المنشآت المتاحة
          </div>
        </div>

        {/* Grid with Staggered Animation */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
        >
          {filteredProperties.map((p) => (
            <PropertyCard 
              key={p.id} 
              property={p} 
              onClick={() => setSelectedProperty(p)} 
            />
          ))}
          {filteredProperties.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-gray-100">
               <Search size={48} className="mx-auto text-gray-200 mb-4" />
               <p className="text-gray-500 font-bold">عذراً، لم نجد نتائج تطابق بحثك حالياً</p>
               <button onClick={() => {setFilter('all'); setSearchQuery('');}} className="mt-4 text-primary font-bold underline">عرض جميع المنشآت</button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isWishlistModalOpen && (
          <WishlistModal onClose={() => setIsWishlistModalOpen(false)} />
        )}
        {selectedProperty && (
          <PropertyDetails 
            property={selectedProperty} 
            onClose={() => setSelectedProperty(null)}
            onBook={() => {
              if (!user) {
                login();
              } else {
                setBookingProperty(selectedProperty);
                setSelectedProperty(null);
              }
            }}
          />
        )}
        {bookingProperty && (
          <BookingModal 
            property={bookingProperty} 
            onClose={() => setBookingProperty(null)}
            onConfirm={() => handleBookingConfirm(bookingProperty)}
          />
        )}
        {isBookingsModalOpen && (
          <UserBookingsModal 
            onClose={() => setIsBookingsModalOpen(false)} 
          />
        )}
        {isHostModalOpen && user && (
          <HostDashboard 
            user={user}
            properties={properties}
            bookings={bookings}
            updateProperty={updateProperty}
            updateBookingStatus={updateBookingStatus}
            addProperty={addProperty}
            onClose={() => setIsHostModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <AIChat properties={properties} />

      <BottomNav 
        activeTab={filter} 
        setActiveTab={setFilter}
        onOpenBookings={() => setIsBookingsModalOpen(true)}
        onOpenWishlist={() => setIsWishlistModalOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppStateProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </AppStateProvider>
  );
}

