import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building,
  PlusCircle,
  TrendingUp,
  Users,
  MapPin,
  Star,
  Edit2,
  X,
  CheckCircle,
  Loader2,
  LayoutDashboard,
  Calendar,
  DollarSign,
  QrCode,
  BarChart3,
  Search,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MoreVertical,
  CalendarDays,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import { Property, Booking, FinancialRecord } from "../types";
import { cn } from "../lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const propertySchema = z.object({
  name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  type: z.enum(["hotel", "apartment", "hostel"]),
  description: z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل"),
  pricePerNight: z.coerce.number().min(0, "السعر يجب أن يكون رقماً إيجابياً"),
  image: z.string().url("أدخل رابط صورة صحيح"),
  location: z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل"),
  amenities: z.string().min(3, "أدخل الميزات مفصولة بفاصلة"),
  unitsCount: z.coerce.number().min(1, "يجب وجود وحدة واحدة على الأقل"),
  isUrgentShelter: z.boolean().default(false),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

type HostTab = 'overview' | 'inventory' | 'bookings' | 'finance';

export const HostDashboard = ({
  user,
  properties,
  bookings,
  updateProperty,
  updateBookingStatus,
  addProperty,
  onClose,
}: {
  user: any;
  properties: Property[];
  bookings: Booking[];
  updateProperty: (id: string, updates: Partial<Property>) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  addProperty: (prop: Partial<Property>) => void;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<HostTab>('overview');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myProperties = properties.filter((p) => p.ownerId === user.uid);
  const myPropertyIds = myProperties.map(p => p.id);
  const myBookings = bookings.filter(b => myPropertyIds.includes(b.propertyId));

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: {
      type: "apartment",
      isUrgentShelter: false,
    },
  });

  const onSubmit = async (data: PropertyFormValues) => {
    setIsSubmitting(true);
    try {
      const amenitiesArray = data.amenities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const newProperty = {
        name: data.name,
        type: data.type,
        description: data.description,
        pricePerNight: data.pricePerNight,
        image: data.image,
        location: data.location,
        amenities: amenitiesArray,
        unitsCount: data.unitsCount,
        unitsAvailable: data.unitsCount,
        isUrgentShelter: data.isUrgentShelter,
        rating: 5.0, 
        available: true,
        ownerId: user.uid,
      };

      addProperty(newProperty);
      reset();
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#f8f9fb] overflow-y-auto w-full h-full flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0f172a] text-white flex flex-col h-screen sticky top-0 shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-xl">
            أ
          </div>
          <span className="text-xl font-bold">لوحة المضيف</span>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'overview' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">الرئيسية</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('inventory')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'inventory' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Building size={20} />
            <span className="font-medium">المنشآت والمخزون</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('bookings')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'bookings' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Calendar size={20} />
            <span className="font-medium">إدارة الحجوزات</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('finance')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'finance' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <DollarSign size={20} />
            <span className="font-medium">المالية والتقارير</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onClose}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X size={20} />
            <span className="font-medium">إغلاق اللوحة</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen relative overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40 px-8 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 title-serif">
            {activeTab === 'overview' && 'لوحة المعلومات'}
            {activeTab === 'inventory' && 'إدارة المنشآت والمخزون'}
            {activeTab === 'bookings' && 'الحجوزات والنزلاء'}
            {activeTab === 'finance' && 'الأداء المالي والتسويات'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 relative">
              <Bell size={20} />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none">{user.displayName}</p>
                <p className="text-[10px] text-gray-500 mt-1">مالك منشأة</p>
              </div>
              <img src={user.photoURL} className="w-8 h-8 rounded-full border border-gray-100" alt="" />
            </div>
          </div>
        </header>

        <div className="p-8">
           {activeTab === 'overview' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { label: 'إجمالي الإيرادات', value: `$${myBookings.reduce((acc, b) => acc + b.totalPrice, 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', trend: '+12%' },
                   { label: 'نشطة حالياً', value: myBookings.filter(b => b.status === 'checked-in').length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', trend: 'ثابت' },
                   { label: 'الغرف المتاحة', value: myProperties.reduce((acc, p) => acc + p.unitsAvailable, 0), icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-100', trend: '-2' },
                   { label: 'تقييم المنشآت', value: (myProperties.reduce((acc, p) => acc + p.rating, 0) / (myProperties.length || 1)).toFixed(1), icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100', trend: '4.8' },
                 ].map((stat, i) => (
                   <div key={i} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                     <div className="flex items-center justify-between mb-4">
                       <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                         <stat.icon size={24} />
                       </div>
                       <span className={cn("text-xs font-bold px-2 py-1 rounded-lg", stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500')}>
                         {stat.trend}
                       </span>
                     </div>
                     <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                     <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                   </div>
                 ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-bold text-gray-900 title-serif">الزيارات والحجوزات (شهر مايو)</h3>
                     <BarChart3 size={20} className="text-gray-400" />
                   </div>
                   <div className="h-64 flex items-end gap-2 px-2">
                     {[40, 65, 30, 85, 45, 75, 90].map((h, i) => (
                       <div key={i} className="flex-1 group relative">
                         <div 
                           className="bg-primary/20 hover:bg-primary transition-all rounded-t-lg" 
                           style={{ height: `${h}%` }}
                         ></div>
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                           {h * 10} زيارة
                         </div>
                       </div>
                     ))}
                   </div>
                   <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 px-2">
                     <span>السبت</span>
                     <span>الأحد</span>
                     <span>الاثنين</span>
                     <span>الثلاثاء</span>
                     <span>الأربعاء</span>
                     <span>الخميس</span>
                     <span>الجمعة</span>
                   </div>
                 </div>

                 <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold text-gray-900 title-serif">الحجوزات الأخيرة</h3>
                      <button onClick={() => setActiveTab('bookings')} className="text-sm text-primary font-bold hover:underline">عرض الكل</button>
                    </div>
                    <div className="space-y-6 flex-1">
                      {myBookings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <Calendar size={48} className="mb-2 opacity-20" />
                          <p>لا توجد حجوزات حتى الآن</p>
                        </div>
                      ) : (
                        myBookings.slice(0, 4).map(booking => (
                          <div key={booking.id} className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-bold text-gray-600">
                              {booking.guestName.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 text-sm">{booking.guestName}</h4>
                              <p className="text-xs text-gray-500">{format(new Date(booking.startDate), 'dd MMMM', { locale: ar })}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900 text-sm">${booking.totalPrice}</p>
                              <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full font-bold",
                                booking.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                              )}>
                                {booking.status === 'confirmed' ? 'مؤكد' : 'قيد الانتظار'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                 </div>
               </div>
             </motion.div>
           )}

           {activeTab === 'inventory' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
               <div className="flex justify-between items-center bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                 <div>
                   <h3 className="text-xl font-bold text-gray-900 title-serif">قائمة المنشآت</h3>
                   <p className="text-sm text-gray-400 mt-1">إدارة الوحدات المتاحة والأسعار بشكل فوري</p>
                 </div>
                 <button onClick={() => setIsAdding(true)} className="pill-button flex items-center gap-2">
                   <PlusCircle size={20} />
                   إضافة منشأة جديدة
                 </button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {myProperties.map(property => (
                    <div key={property.id} className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm flex flex-col sm:flex-row">
                      <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 relative">
                         <img src={property.image} className="w-full h-full object-cover" alt="" />
                         <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded-lg">
                           ID: {property.id.slice(-4)}
                         </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between mb-4">
                          <div>
                            <h4 className="font-bold text-lg text-gray-900 title-serif">{property.name}</h4>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin size={12} /> {property.location}
                            </p>
                          </div>
                          <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                            <SettingsIcon size={18} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gray-50 p-3 rounded-2xl">
                            <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase">الوحدات (المتاحة / الإجمالي)</p>
                            <div className="flex items-center gap-2">
                               <input 
                                 type="number"
                                 defaultValue={property.unitsAvailable}
                                 className="w-12 bg-white border border-gray-200 rounded-lg text-center font-bold text-sm outline-none focus:border-primary"
                                 onChange={(e) => updateProperty(property.id, { unitsAvailable: parseInt(e.target.value) })}
                               />
                               <span className="text-gray-300">/</span>
                               <span className="font-bold text-sm">{property.unitsCount}</span>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-2xl">
                            <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase">السعر الأساسي لليلة</p>
                            <div className="flex items-center gap-1 text-primary font-bold">
                               <span className="text-xs">$</span>
                               <input 
                                 type="number"
                                 defaultValue={property.pricePerNight}
                                 className="w-16 bg-white border border-gray-200 rounded-lg text-center font-bold text-sm outline-none focus:border-primary"
                                 onChange={(e) => updateProperty(property.id, { pricePerNight: parseInt(e.target.value) })}
                               />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-gray-50 mt-auto">
                          <button className="flex-1 text-xs font-bold py-2 bg-primary/5 text-primary rounded-xl hover:bg-primary/10 transition-colors">عروض اللحظة الأخيرة</button>
                          <button className="flex-1 text-xs font-bold py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">أسعار موسمية</button>
                          <div className="flex items-center gap-2 mr-auto">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">حالة الحجز</span>
                            <div className={cn(
                              "w-10 h-5 rounded-full relative transition-colors cursor-pointer",
                              property.available ? "bg-green-500" : "bg-gray-300"
                            )} onClick={() => updateProperty(property.id, { available: !property.available })}>
                              <div className={cn(
                                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                property.available ? "right-6" : "right-1"
                              )}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
             </motion.div>
           )}

           {activeTab === 'bookings' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                      <QrCode size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 title-serif">تسجيل وصول سريع</h3>
                      <p className="text-xs text-gray-500">امسح رمز QR الخاص بالنزيل لبدء الإقامة فوراً</p>
                    </div>
                  </div>
                  <div className="flex flex-1 max-w-md w-full gap-2">
                    <div className="relative flex-1 text-right">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="ابحث برقم الحجز أو اسم النزيل..." 
                        className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:bg-white focus:border-primary transition-all text-right"
                      />
                    </div>
                    <button className="bg-[#0f172a] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-[#1e293b] transition-all flex items-center gap-2">
                      <QrCode size={18} />
                      فتح الماسح
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right" dir="rtl">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">النزيل</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">المنشأة</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">التاريخ</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">المبلغ</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">الحالة</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">الإجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {myBookings.length === 0 ? (
                           <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-gray-400">لا توجد سجلات حجوزات حالياً</td>
                           </tr>
                        ) : (
                          myBookings.map(booking => {
                            const property = properties.find(p => p.id === booking.propertyId);
                            return (
                              <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-sm uppercase">
                                      {booking.guestName.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-bold text-gray-900 text-sm whitespace-nowrap">{booking.guestName}</p>
                                      <p className="text-[10px] text-gray-400 font-mono">#{booking.id.slice(-6).toUpperCase()}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-sm text-gray-600 font-medium whitespace-nowrap">{property?.name}</p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-700">{format(new Date(booking.startDate), 'dd MMM', { locale: ar })} - {format(new Date(booking.endDate), 'dd MMM', { locale: ar })}</span>
                                    <span className="text-[10px] text-gray-400 font-bold">إقامة كاملة</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="font-mono font-bold text-sm text-gray-900">${booking.totalPrice}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={cn(
                                    "text-[10px] px-2 py-1 rounded-full font-bold inline-block whitespace-nowrap",
                                    booking.status === 'confirmed' ? "bg-green-50 text-green-600" : 
                                    booking.status === 'checked-in' ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"
                                  )}>
                                    {booking.status === 'confirmed' ? 'مؤكد' : 
                                     booking.status === 'checked-in' ? 'مقيد بالوصول' : 'منتهي/ملغي'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                     <button 
                                       onClick={() => updateBookingStatus(booking.id, booking.status === 'checked-in' ? 'checked-out' : 'checked-in')}
                                       className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                                     >
                                       {booking.status === 'checked-in' ? <LogOut size={16} /> : <CheckCircle size={16} />}
                                     </button>
                                     <button className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                                       <MoreVertical size={16} />
                                     </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
             </motion.div>
           )}

           {activeTab === 'finance' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-2">الرصيد المتاح للسحب</p>
                    <h3 className="text-3xl font-bold text-indigo-600 font-sans mb-4">${(myBookings.reduce((acc, b) => acc + b.totalPrice, 0) * 0.85).toFixed(2)}</h3>
                    <button className="w-full py-3 bg-[#0f172a] text-white rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-colors">طلب تسوية مالية</button>
                  </div>
                  <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-2">عمولة المنصة (15%)</p>
                    <h3 className="text-3xl font-bold text-gray-400 font-sans mb-4">${(myBookings.reduce((acc, b) => acc + b.totalPrice, 0) * 0.15).toFixed(2)}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                       <Clock size={12} /> آخر تحديث: لحظي
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-2">مقارنة الأداء بالمنطقة</p>
                    <h3 className="text-3xl font-bold text-green-600 mb-4">+18%</h3>
                    <div className="flex items-center gap-2 text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded-md w-fit font-bold">
                       <ArrowUpRight size={12} /> أداء ممتاز مقارنة بالمنافسين
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 title-serif mb-6 text-right">سجل العمليات المالية</h3>
                  <div className="space-y-4">
                    {[
                      { desc: 'تسوية أسبوعية - الأسبوع 17', date: '28 أبريل 2024', amount: -450, status: 'completed' },
                      { desc: 'إيراد حجز #AQ-2281', date: '01 مايو 2024', amount: 120, status: 'completed' },
                      { desc: 'إيراد حجز #AQ-2285', date: '02 مايو 2024', amount: 85, status: 'pending' },
                    ].map((tx, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 flex-row-reverse">
                        <div className="flex items-center gap-4 text-right flex-row-reverse">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600')}>
                            {tx.amount > 0 ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{tx.desc}</p>
                            <p className="text-xs text-gray-500 font-bold">{tx.date}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className={cn("font-bold text-sm font-sans", tx.amount > 0 ? 'text-green-600' : 'text-gray-900')}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount}$
                          </p>
                          <span className={cn("text-[10px] font-bold", tx.status === 'completed' ? 'text-blue-500' : 'text-orange-500')}>
                            {tx.status === 'completed' ? 'تمت' : 'قيد المعالجة'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </motion.div>
           )}
        </div>
      </main>


      {/* Add Property Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] overflow-hidden flex flex-col shadow-2xl relative"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur z-10">
                <h3 className="text-2xl font-bold title-serif text-gray-900 flex items-center gap-2">
                  <Building className="text-primary" />
                  تفاصيل المنشأة الجديدة
                </h3>
                <button
                  onClick={() => setIsAdding(false)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form
                  id="add-property-form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        اسم المنشأة
                      </label>
                      <input
                        {...register("name")}
                        className={cn(
                          "w-full p-4 border rounded-2xl outline-none bg-gray-50 focus:bg-white focus:border-primary transition-colors hover:border-gray-300",
                          errors.name ? "border-red-500" : "border-gray-200",
                        )}
                        placeholder="مثال: فندق السلام"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        نوع المنشأة
                      </label>
                      <select
                        {...register("type")}
                        className="w-full p-4 border border-gray-200 rounded-2xl outline-none bg-gray-50 focus:bg-white focus:border-primary transition-colors cursor-pointer"
                      >
                        <option value="hotel">فندق (غرف وأجنحة)</option>
                        <option value="apartment">شقة مفروشة</option>
                        <option value="hostel">نُزُل (سرير مشترك/مستقل)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الموقع (العنوان بالتفصيل)
                    </label>
                    <input
                      {...register("location")}
                      className={cn(
                        "w-full p-4 border rounded-2xl outline-none bg-gray-50 focus:bg-white focus:border-primary transition-colors hover:border-gray-300",
                        errors.location ? "border-red-500" : "border-gray-200",
                      )}
                      placeholder="شارع الاستقلال، وسط الديرة..."
                    />
                    {errors.location && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.location.message}
                      </p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        السعر لليلة (USD)
                      </label>
                      <input
                        type="number"
                        {...register("pricePerNight")}
                        className={cn(
                          "w-full p-4 border rounded-2xl outline-none bg-gray-50 focus:bg-white focus:border-primary transition-colors hover:border-gray-300 font-sans",
                          errors.pricePerNight
                            ? "border-red-500"
                            : "border-gray-200",
                        )}
                        placeholder="0.00"
                        dir="ltr"
                      />
                      {errors.pricePerNight && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.pricePerNight.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        رابط الصورة (URL)
                      </label>
                      <input
                        {...register("image")}
                        className={cn(
                          "w-full p-4 border rounded-2xl outline-none bg-gray-50 focus:bg-white focus:border-primary transition-colors hover:border-gray-300 font-sans",
                          errors.image ? "border-red-500" : "border-gray-200",
                        )}
                        placeholder="https://..."
                        dir="ltr"
                      />
                      {errors.image && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.image.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المرافق (مفصولة بفاصلة)
                    </label>
                    <input
                      {...register("amenities")}
                      className={cn(
                        "w-full p-4 border rounded-2xl outline-none bg-gray-50 focus:bg-white focus:border-primary transition-colors hover:border-gray-300",
                        errors.amenities ? "border-red-500" : "border-gray-200",
                      )}
                      placeholder="مكيف، واي فاي مجاني، مسبح..."
                    />
                    {errors.amenities && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.amenities.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      وصف المنشأة
                    </label>
                    <textarea
                      {...register("description")}
                      className={cn(
                        "w-full p-4 border rounded-2xl outline-none bg-gray-50 focus:bg-white focus:border-primary transition-colors hover:border-gray-300 resize-none min-h-[120px]",
                        errors.description
                          ? "border-red-500"
                          : "border-gray-200",
                      )}
                      placeholder="اكتب وصفاً جذاباً يعكس مميزات المكان..."
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                    <input
                      type="checkbox"
                      id="urgent"
                      {...register("isUrgentShelter")}
                      className="w-6 h-6 rounded border-gray-300 text-green-600 focus:ring-green-600 cursor-pointer accent-green-600"
                    />
                    <label
                      htmlFor="urgent"
                      className="text-sm text-green-900 cursor-pointer select-none"
                    >
                      <span className="font-bold block">
                        هل هذا مأوى إغاثي/عاجل للنازحين؟
                      </span>
                      سيتم تمييز هذا العقار ليكون ضمن المبادرات الإنسانية.
                    </label>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50">
                <button
                  type="submit"
                  form="add-property-form"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 hover:bg-[#4a4a35] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    "نشر المنشأة"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
