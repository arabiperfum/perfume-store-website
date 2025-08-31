import React, { useState } from 'react';
import { 
  Package, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  X,
  Save,
  Upload
} from 'lucide-react';
import { Product } from '../types';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [loading, setLoading] = useState(false);

  const { products, categories, addProduct, updateProduct, deleteProduct } = useProducts();
  const { orders } = useOrders();

  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    price: 0,
    originalPrice: 0,
    image: '',
    rating: 5,
    reviews: 0,
    category: 'عطور نسائية',
    description: '',
    inStock: true
  });

  const handleSaveProduct = async () => {
    setLoading(true);
    
    try {
      if (isAddingProduct) {
        await addProduct({
          name: productForm.name || '',
          price: productForm.price || 0,
          originalPrice: productForm.originalPrice,
          image: productForm.image || 'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: productForm.rating || 5,
          reviews: productForm.reviews || 0,
          category: productForm.category || 'عطور نسائية',
          description: productForm.description || '',
          inStock: productForm.inStock !== false,
          stockQuantity: productForm.stockQuantity || 0
        });
        setIsAddingProduct(false);
      } else if (editingProduct) {
        await updateProduct(editingProduct.id, productForm);
        setEditingProduct(null);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('حدث خطأ أثناء حفظ المنتج');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProductOld = () => {
    if (isAddingProduct) {
      // Old logic for adding product
      setIsAddingProduct(false);
    } else if (editingProduct) {
      // Old logic for updating product
      setEditingProduct(null);
    }
    
    resetForm();
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('حدث خطأ أثناء حذف المنتج');
      }
    }
  };

  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm(product);
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      price: 0,
      originalPrice: 0,
      image: '',
      rating: 5,
      reviews: 0,
      category: 'عطور نسائية',
      description: '',
      inStock: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'processing': return 'قيد المعالجة';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalCustomers = orders.length; // تقدير عدد العملاء من الطلبات

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-100">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">لوحة التحكم</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <nav className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors ${
                  activeTab === 'overview' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                نظرة عامة
              </button>
              
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors ${
                  activeTab === 'products' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Package className="w-5 h-5" />
                المنتجات
              </button>
              
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors ${
                  activeTab === 'orders' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                الطلبات
              </button>
              
              <button
                onClick={() => setActiveTab('customers')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors ${
                  activeTab === 'customers' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-5 h-5" />
                العملاء
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-2xl font-bold mb-6">نظرة عامة</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600">إجمالي المبيعات</p>
                        <p className="text-2xl font-bold text-green-600">{totalRevenue} ريال</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600">عدد الطلبات</p>
                        <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
                      </div>
                      <ShoppingBag className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600">عدد العملاء</p>
                        <p className="text-2xl font-bold text-purple-600">{totalCustomers}</p>
                      </div>
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="text-lg font-semibold mb-4">آخر الطلبات</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2">رقم الطلب</th>
                          <th className="py-2">العميل</th>
                          <th className="py-2">المبلغ</th>
                          <th className="py-2">الحالة</th>
                          <th className="py-2">التاريخ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(order => (
                          <tr key={order.id} className="border-b">
                            <td className="py-3">#{order.id.slice(0, 8)}</td>
                            <td className="py-3">{order.customerInfo.name}</td>
                            <td className="py-3">{order.total} ريال</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </td>
                            <td className="py-3">{new Date(order.createdAt).toLocaleDateString('ar-SA')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">إدارة المنتجات</h3>
                  <button
                    onClick={() => setIsAddingProduct(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    إضافة منتج جديد
                  </button>
                </div>

                {(isAddingProduct || editingProduct) && (
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h4 className="text-lg font-semibold mb-4">
                      {isAddingProduct ? 'إضافة منتج جديد' : 'تعديل المنتج'}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          اسم المنتج
                        </label>
                        <input
                          type="text"
                          value={productForm.name}
                          onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الفئة
                        </label>
                        <select
                          value={productForm.category}
                          onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          {categories.map(category => (
                            <option key={category.id} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          السعر
                        </label>
                        <input
                          type="number"
                          value={productForm.price}
                          onChange={(e) => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          السعر الأصلي (اختياري)
                        </label>
                        <input
                          type="number"
                          value={productForm.originalPrice || ''}
                          onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: e.target.value ? Number(e.target.value) : undefined }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رابط الصورة
                        </label>
                        <input
                          type="url"
                          value={productForm.image}
                          onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الوصف
                        </label>
                        <textarea
                          value={productForm.description}
                          onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={productForm.inStock}
                            onChange={(e) => setProductForm(prev => ({ ...prev, inStock: e.target.checked }))}
                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-sm font-medium text-gray-700">متوفر في المخزون</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 mt-6">
                      <button
                        onClick={handleSaveProduct}
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {loading ? 'جاري الحفظ...' : 'حفظ'}
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingProduct(false);
                          setEditingProduct(null);
                          resetForm();
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المنتج
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الفئة
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            السعر
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الحالة
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map(product => (
                          <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-10 h-10 rounded-lg object-cover ml-4"
                                />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {product.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    التقييم: {product.rating} ({product.reviews} مراجعة)
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {product.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {product.price} ريال
                              {product.originalPrice && (
                                <div className="text-xs text-gray-500 line-through">
                                  {product.originalPrice} ريال
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                product.inStock 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {product.inStock ? 'متوفر' : 'نفد المخزون'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEditProduct(product)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h3 className="text-2xl font-bold mb-6">إدارة الطلبات</h3>
                
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            رقم الطلب
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            العميل
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المنتجات
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المبلغ
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الحالة
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            التاريخ
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map(order => (
                          <tr key={order.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{order.id.slice(0, 8)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {order.customerInfo.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {order.customerInfo.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.items.length} منتج
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.total} ريال
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div>
                <h3 className="text-2xl font-bold mb-6">إدارة العملاء</h3>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600 text-center">
                    سيتم إضافة إدارة العملاء في التحديث القادم
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}