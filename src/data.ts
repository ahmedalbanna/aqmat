import { Property } from './types';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: '1',
    name: 'فندق السلام الراقي',
    type: 'hotel',
    description: 'يقع فندق السلام في قلب المدينة، ويوفر غرفاً واسعة ومريحة مع إطلالات خلابة. مثالي للمسافرين الباحثين عن الهدوء والرفاهية.',
    pricePerNight: 120,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    amenities: ['واي فاي مجاني', 'تكييف', 'موقف سيارات', 'إفطار'],
    location: 'وسط المدينة، القاهرة',
    rating: 4.8,
    available: true
  },
  {
    id: '2',
    name: 'شقة العائلة الهادئة',
    type: 'apartment',
    description: 'شقة مفروشة بالكامل تتكون من غرفتين وصالة. مكان مثالي للعائلات النازحة التي تبحث عن مأوى مؤقت آمن ومستقل.',
    pricePerNight: 80,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    amenities: ['مطبخ كامل', 'غسالة ملابس', 'تلفزيون', 'مصعد'],
    location: 'حي الزمالك، القاهرة',
    rating: 4.5,
    available: true
  },
  {
    id: '3',
    name: 'نُزُل الشباب فيكتوريا',
    type: 'hostel',
    description: 'نُزُل اقتصادي يوفر غرفاً مشتركة وخدمات أساسية جيدة. خيار ممتاز للمسافرين ذوي الميزانية المحدودة.',
    pricePerNight: 25,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    amenities: ['خزائن شخصية', 'غرفة غسيل', 'مساحة عمل مشتركة'],
    location: 'داون تاون، الإسكندرية',
    rating: 4.2,
    available: true
  },
  {
    id: '4',
    name: 'فندق الواحة الخضراء',
    type: 'hotel',
    description: 'منتجع هادئ يوفر أجواء طبيعية مريحة للأعصاب. غرف مصممة بطراز عصري مريح.',
    pricePerNight: 150,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    amenities: ['مسبح', 'منتجع صحي', 'مطعم فاخر'],
    location: 'الغردقة، البحر الأحمر',
    rating: 4.9,
    available: true
  },
  {
    id: '5',
    name: 'دار الإيواء - مبادرة أمان',
    type: 'hostel',
    description: 'مكان إقامة مدعوم بالكامل مخصص للحالات الإنسانية الطارئة والنزوح. يوفر بيئة آمنة ونظيفة للعائلات مع توفر الاحتياجات الأساسية.',
    pricePerNight: 10,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    amenities: ['مطبخ مشترك', 'وجبات يومية', 'دعم نفسي', 'رعاية صحية أولية'],
    location: 'مدينة العبور، القاهرة',
    rating: 4.7,
    available: true,
    isUrgentShelter: true
  }
];
