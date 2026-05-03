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
} from "lucide-react";
import { Property, PropertyType } from "../types";
import { cn } from "../lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const propertySchema = z.object({
  name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  type: z.enum(["hotel", "apartment", "hostel"]),
  description: z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل"),
  pricePerNight: z.coerce.number().min(0, "السعر يجب أن يكون رقماً إيجابياً"),
  image: z.string().url("أدخل رابط صورة صحيح"),
  location: z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل"),
  amenities: z.string().min(3, "أدخل الميزات مفصولة بفاصلة"),
  isUrgentShelter: z.boolean().default(false),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

export const HostDashboard = ({
  user,
  properties,
  addProperty,
  onClose,
}: {
  user: any;
  properties: Property[];
  addProperty: (prop: Partial<Property>) => void;
  onClose: () => void;
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myProperties = properties.filter((p) => p.ownerId === user.uid);

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
        isUrgentShelter: data.isUrgentShelter,
        rating: 5.0, // Default for new
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
    <div className="fixed inset-0 z-[100] bg-[#f5f2ed] overflow-y-auto w-full h-full">
      <div className="bg-[#0f172a] text-white p-8 pb-32">
        <div className="max-w-7xl mx-auto flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold title-serif flex items-center gap-3">
              <Building className="text-primary" size={32} />
              لوحة تحكم المنشآت
            </h1>
            <p className="text-gray-400 mt-2">نظرة عامة على منشآتك وحجوزاتك</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Building size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">منشآتي</p>
              <h3 className="text-2xl font-bold">{myProperties.length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">
                الإيرادات المحتملة (شهرياً)
              </p>
              <h3 className="text-2xl font-bold font-mono text-[#0f172a] opacity-80">
                $
                {myProperties.reduce(
                  (acc, curr) => acc + curr.pricePerNight * 15,
                  0,
                )}
              </h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">إجمالي الحجوزات</p>
              <h3 className="text-2xl font-bold text-[#0f172a] opacity-80">
                -
              </h3>{" "}
              {/* Mocked */}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold title-serif text-gray-900">
            عقاراتي المدرجة
          </h2>
          <button
            onClick={() => setIsAdding(true)}
            className="pill-button flex items-center gap-2"
          >
            <PlusCircle size={20} />
            إضافة عقار جديد
          </button>
        </div>

        {myProperties.length === 0 ? (
          <div className="bg-white p-12 rounded-[32px] border border-dashed border-gray-300 text-center text-gray-500 shadow-sm">
            <Building size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              لا توجد منشآت بعد
            </h3>
            <p className="mb-6">
              ابدأ بإدراج فندقك أو شقتك المفروشة للوصول إلى آلاف الضيوف.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="text-primary font-bold hover:underline"
            >
              أضف عقارك الأول
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {myProperties.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 relative group"
              >
                <div className="h-48 relative">
                  <img
                    src={p.image}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt=""
                  />
                  {p.isUrgentShelter && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                      مأوى مدعوم
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10 flex items-center gap-1 cursor-pointer hover:bg-primary hover:text-white transition-colors">
                    <Edit2 size={12} />
                    تعديل
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                    <MapPin size={14} />
                    <span className="truncate">{p.location}</span>
                  </div>
                  <h3 className="text-xl font-bold title-serif mb-2">
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-bold text-[#0f172a]">
                      ${p.pricePerNight}{" "}
                      <span className="text-sm font-normal text-gray-500">
                        / ليلة
                      </span>
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-600">
                      {p.type === "hotel"
                        ? "فندق"
                        : p.type === "apartment"
                          ? "شقة"
                          : "نُزُل"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
