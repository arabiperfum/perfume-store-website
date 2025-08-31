import React, { useState } from 'react';
import { X, CreditCard, MapPin, Phone, Mail, User } from 'lucide-react';
import { CartItem } from '../types';
import { useOrders } from '../hooks/useOrders';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  total: number;
  onOrderComplete: () => void;
}

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  total, 
  onOrderComplete 
}: CheckoutModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createOrder } = useOrders();

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!customerInfo.name) newErrors.name = 'الاسم مطلوب';
    if (!customerInfo.email) newErrors.email = 'البريد الإلكتروني مطلوب';
    if (!customerInfo.phone) newErrors.phone = 'رقم الهاتف مطلوب';
    if (!customerInfo.address) newErrors.address = 'العنوان مطلوب';
    if (!customerInfo.city) newErrors.city = 'المدينة مطلوبة';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (paymentMethod === 'cash') return true;
    
    const newErrors: Record<string, string> = {};
    
    if (!cardInfo.number) newErrors.cardNumber = 'رقم البطاقة مطلوب';
    if (!cardInfo.expiry) newErrors.expiry = 'تاريخ الانتهاء مطلوب';
    if (!cardInfo.cvv) newErrors.cvv = 'رمز الأمان مطلوب';
    if (!cardInfo.name) newErrors.cardName = 'اسم حامل البطاقة مطلوب';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmitOrder = () => {
    setLoading(true);
    
    createOrder(cartItems, customerInfo, paymentMethod as 'card' | 'cash')
      .then(() => {
        onOrderComplete();
        onClose();
        setStep(1);
        setCustomerInfo({
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          postalCode: ''
        });
        setCardInfo({
          number: '',
          expiry: '',
          cvv: '',
          name: ''
        });
      })
      .catch((error) => {
        console.error('Error creating order:', error);
        setErrors({ general: 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.' });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmitOrderOld = () => {
    // محاكاة إرسال الطلب (الكود القديم)
    setTimeout(() => {
      onOrderComplete();
      onClose();
      setStep(1);
      setCustomerInfo({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: ''
      });
      setCardInfo({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
      });
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-right align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold text-gray-900">إتمام الطلب</h3>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 1 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className="text-xs mt-2 text-center">معلومات الشحن</div>
            </div>
            <div className={`w-16 h-1 mx-4 ${step >= 2 ? 'bg-amber-500' : 'bg-gray-200'}`} />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 2 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className="text-xs mt-2 text-center">طريقة الدفع</div>
            </div>
            <div className={`w-16 h-1 mx-4 ${step >= 3 ? 'bg-amber-500' : 'bg-gray-200'}`} />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 3 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <div className="text-xs mt-2 text-center">مراجعة الطلب</div>
            </div>
          </div>

          {/* Step 1: Shipping Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold mb-4">معلومات الشحن</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="أدخل اسمك الكامل"
                    />
                    <User className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="أدخل بريدك الإلكتروني"
                    />
                    <Mail className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="أدخل رقم هاتفك"
                    />
                    <Phone className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المدينة
                  </label>
                  <select
                    value={customerInfo.city}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">اختر المدينة</option>
                    <option value="الرياض">الرياض</option>
                    <option value="جدة">جدة</option>
                    <option value="الدمام">الدمام</option>
                    <option value="مكة المكرمة">مكة المكرمة</option>
                    <option value="المدينة المنورة">المدينة المنورة</option>
                  </select>
                  {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العنوان التفصيلي
                  </label>
                  <div className="relative">
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                      rows={3}
                      className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="أدخل عنوانك التفصيلي"
                    />
                    <MapPin className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الرمز البريدي (اختياري)
                  </label>
                  <input
                    type="text"
                    value={customerInfo.postalCode}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="أدخل الرمز البريدي"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold mb-4">طريقة الدفع</h4>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <span>بطاقة ائتمانية</span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>الدفع عند الاستلام</span>
                  </label>
                </div>

                {paymentMethod === 'card' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم البطاقة
                      </label>
                      <input
                        type="text"
                        value={cardInfo.number}
                        onChange={(e) => setCardInfo(prev => ({ ...prev, number: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="1234 5678 9012 3456"
                      />
                      {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاريخ الانتهاء
                      </label>
                      <input
                        type="text"
                        value={cardInfo.expiry}
                        onChange={(e) => setCardInfo(prev => ({ ...prev, expiry: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          errors.expiry ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="MM/YY"
                      />
                      {errors.expiry && <p className="mt-1 text-sm text-red-600">{errors.expiry}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رمز الأمان
                      </label>
                      <input
                        type="text"
                        value={cardInfo.cvv}
                        onChange={(e) => setCardInfo(prev => ({ ...prev, cvv: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          errors.cvv ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="123"
                      />
                      {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اسم حامل البطاقة
                      </label>
                      <input
                        type="text"
                        value={cardInfo.name}
                        onChange={(e) => setCardInfo(prev => ({ ...prev, name: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          errors.cardName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="الاسم كما هو مكتوب على البطاقة"
                      />
                      {errors.cardName && <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Order Review */}
          {step === 3 && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold">مراجعة الطلب</h4>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold mb-3">المنتجات المطلوبة:</h5>
                <div className="space-y-2">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold">{item.price * item.quantity} ريال</p>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>المجموع الكلي:</span>
                    <span className="text-amber-600">{total} ريال</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold mb-3">معلومات الشحن:</h5>
                <div className="space-y-1 text-sm">
                  <p><strong>الاسم:</strong> {customerInfo.name}</p>
                  <p><strong>البريد الإلكتروني:</strong> {customerInfo.email}</p>
                  <p><strong>الهاتف:</strong> {customerInfo.phone}</p>
                  <p><strong>العنوان:</strong> {customerInfo.address}, {customerInfo.city}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold mb-3">طريقة الدفع:</h5>
                <p className="text-sm">
                  {paymentMethod === 'card' ? 'بطاقة ائتمانية' : 'الدفع عند الاستلام'}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                السابق
              </button>
            )}
            
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 px-6 rounded-lg font-semibold"
              >
                التالي
              </button>
            ) : (
              <button
                onClick={handleSubmitOrder}
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 px-6 rounded-lg font-semibold"
              >
                {loading ? 'جاري الإرسال...' : 'تأكيد الطلب'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}