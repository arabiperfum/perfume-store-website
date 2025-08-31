import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { Order, CartItem } from '../types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              image_url,
              categories (
                name
              )
            )
          )
        `)
        .eq(user.isAdmin ? '' : 'user_id', user.isAdmin ? '' : user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders: Order[] = data.map(order => ({
        id: order.id,
        userId: order.user_id || '',
        total: order.total_amount,
        status: order.status as Order['status'],
        createdAt: order.created_at,
        customerInfo: {
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone,
          address: order.shipping_address,
          city: order.city,
          postalCode: order.postal_code || undefined
        },
        paymentMethod: order.payment_method as 'card' | 'cash',
        items: order.order_items.map((item: any) => ({
          id: item.product_id,
          name: item.products?.name || 'منتج محذوف',
          price: item.price,
          image: item.products?.image_url || 'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=400',
          category: item.products?.categories?.name || 'غير محدد',
          description: '',
          rating: 5,
          reviews: 0,
          inStock: true,
          quantity: item.quantity
        }))
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (
    items: CartItem[],
    customerInfo: Order['customerInfo'],
    paymentMethod: 'card' | 'cash'
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'pending',
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          shipping_address: customerInfo.address,
          city: customerInfo.city,
          postal_code: customerInfo.postalCode,
          payment_method: paymentMethod
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await fetchOrders(); // Refresh orders list
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      await fetchOrders(); // Refresh orders list
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  return {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    refreshOrders: fetchOrders
  };
}