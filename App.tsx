import React, { useState } from 'react';
import { ShoppingCart, Search, Heart, Star, Menu, X, User, Phone, Mail, MapPin, Settings } from 'lucide-react';
import { CartItem } from './types';
import { useAuth } from './hooks/useAuth';
import { useProducts } from './hooks/useProducts';
import { useFavorites } from './hooks/useFavorites';
import LoginModal from './components/LoginModal';
import AdminDashboard from './components/AdminDashboard';
import CheckoutModal from './components/CheckoutModal';

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const { user, signOut, loading: authLoading } = useAuth();
  const { products, categories, loading: productsLoading } = useProducts();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const categoryNames = ['الكل', ...categories.map(c => c.name)];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'الكل' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleLogout = () => {
    signOut();
    setIsAdminDashboardOpen(false);
  };

  const handleOrderComplete = () => {
    setCart([]);
    setIsCartOpen(false);
    alert('تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً لتأكيد الطلب.');
  };

  const proceedToCheckout = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  if (authLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-2 text-sm text-gray-600 border-b">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>+966 50 123 4567</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>info@perfumestore.com</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span>شحن مجاني للطلبات أكثر من 500 ريال</span>
            </div>
          </div>

          {/* Main Header */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="text-2xl font-bold text-amber-600">مساعد العطور</h1>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="ابحث عن العطور..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="text-sm">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-gray-500">{user.isAdmin ? 'مدير' : 'عميل'}</p>
                  </div>
                  {user.isAdmin && (
                    <button
                      onClick={() => setIsAdminDashboardOpen(true)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="لوحة التحكم"
                    >
                      <Settings className="w-6 h-6" />
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg relative"
                >
                  <User className="w-6 h-6" />
                </button>
              )}
              
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Heart className="w-6 h-6" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg relative"
              >
                <ShoppingCart className="w-6 h-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className={`${isMenuOpen ? 'block' : 'hidden'} lg:block pb-4`}>
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-8">
              {categoryNames.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-right lg:text-center transition-colors ${
                    selectedCategory === category
                      ? 'bg-amber-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            عالم العطور الأصيلة
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            اكتشف مجموعتنا الفاخرة من العطور العربية الأصيلة والعود والمسك والزعفران
          </p>
          <button 
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            تسوق الآن
          </button>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">منتجاتنا المميزة</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                      isFavorite(product.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                  {product.originalPrice && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-sm">
                      خصم {Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </div>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">نفد المخزون</span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-amber-600 font-medium">{product.category}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">{product.rating}</span>
                      <span className="text-sm text-gray-400">({product.reviews})</span>
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-semibold mb-2">{product.name}</h4>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-amber-600">{product.price} ريال</span>
                      {product.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">{product.originalPrice} ريال</span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                      className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                        product.inStock
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {product.inStock ? 'أضف للسلة' : 'نفد المخزون'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-amber-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2">شحن مجاني</h4>
              <p className="text-gray-600">شحن مجاني لجميع الطلبات أكثر من 500 ريال</p>
            </div>
            <div className="text-center">
              <div className="bg-amber-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2">جودة مضمونة</h4>
              <p className="text-gray-600">جميع منتجاتنا أصلية ومضمونة الجودة</p>
            </div>
            <div className="text-center">
              <div className="bg-amber-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2">دعم 24/7</h4>
              <p className="text-gray-600">خدمة عملاء متاحة على مدار الساعة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-xl font-bold mb-4 text-amber-400">مساعد العطور</h5>
              <p className="text-gray-300 mb-4">
                متجرك الموثوق للعطور العربية الأصيلة والعود والمسك والزعفران
              </p>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4" />
                <span>الرياض، المملكة العربية السعودية</span>
              </div>
            </div>
            
            <div>
              <h6 className="font-semibold mb-4">روابط سريعة</h6>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-amber-400 transition-colors">الرئيسية</a></li>
                <li><a href="#products" className="hover:text-amber-400 transition-colors">المنتجات</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">من نحن</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">اتصل بنا</a></li>
              </ul>
            </div>
            
            <div>
              <h6 className="font-semibold mb-4">الفئات</h6>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-amber-400 transition-colors">عطور نسائية</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">عطور رجالية</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">عطور مشتركة</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">العود والمسك</a></li>
              </ul>
            </div>
            
            <div>
              <h6 className="font-semibold mb-4">تواصل معنا</h6>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+966 50 123 4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@perfumestore.com</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 مساعد العطور. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCartOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">سلة التسوق ({getTotalItems()})</h3>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 h-[calc(100vh-200px)]">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">سلة التسوق فارغة</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{item.name}</h4>
                        <p className="text-amber-600 font-bold">{item.price} ريال</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="border-t p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">المجموع:</span>
                  <span className="text-xl font-bold text-amber-600">{getTotalPrice()} ريال</span>
                </div>
                <button 
                  onClick={proceedToCheckout}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  إتمام الطلب
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {isAdminDashboardOpen && user?.isAdmin && (
        <AdminDashboard
          onClose={() => setIsAdminDashboardOpen(false)}
        />
      )}

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={cart}
        total={getTotalPrice()}
        onOrderComplete={handleOrderComplete}
      />
    </div>
  );
}

export default App;