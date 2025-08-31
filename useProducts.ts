import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      // Test Supabase connection first
      const { error: connectionError } = await supabase
        .from('products')
        .select('count', { count: 'exact', head: true });

      if (connectionError) {
        console.error('Supabase connection error:', connectionError);
        if (connectionError.message.includes('Failed to fetch')) {
          throw new Error('Unable to connect to database. Please check your internet connection and Supabase configuration.');
        }
        throw connectionError;
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        // If tables don't exist yet, use empty array
        if (error.code === 'PGRST205') {
          setProducts([]);
          return;
        }
        throw error;
      }

      const formattedProducts: Product[] = data.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.original_price || undefined,
        image: item.image_url || 'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: item.rating,
        reviews: item.reviews_count,
        category: item.categories?.name || 'غير محدد',
        description: item.description || '',
        inStock: item.in_stock,
        stockQuantity: item.stock_quantity
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('Network error: Unable to connect to Supabase. Please check:');
        console.error('1. Your internet connection');
        console.error('2. VITE_SUPABASE_URL in .env file');
        console.error('3. VITE_SUPABASE_ANON_KEY in .env file');
        console.error('4. Supabase project status');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        // If tables don't exist yet, use empty array
        if (error.code === 'PGRST205') {
          setCategories([]);
          return;
        }
        throw error;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      // Find category ID
      const category = categories.find(c => c.name === productData.category);
      
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          original_price: productData.originalPrice,
          image_url: productData.image,
          category_id: category?.id,
          rating: productData.rating,
          reviews_count: productData.reviews,
          in_stock: productData.inStock,
          stock_quantity: productData.stockQuantity || 0
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProducts(); // Refresh products list
      return data;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      // Find category ID if category is being updated
      let categoryId;
      if (productData.category) {
        const category = categories.find(c => c.name === productData.category);
        categoryId = category?.id;
      }

      const { error } = await supabase
        .from('products')
        .update({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          original_price: productData.originalPrice,
          image_url: productData.image,
          category_id: categoryId,
          rating: productData.rating,
          reviews_count: productData.reviews,
          in_stock: productData.inStock,
          stock_quantity: productData.stockQuantity
        })
        .eq('id', id);

      if (error) throw error;

      await fetchProducts(); // Refresh products list
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchProducts(); // Refresh products list
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  return {
    products,
    categories,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: fetchProducts
  };
}