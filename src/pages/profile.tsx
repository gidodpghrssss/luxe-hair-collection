import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { GetServerSideProps } from 'next';

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  orderItems: {
    id: string;
    quantity: number;
    price: number;
    product: {
      title: string;
      imageUrl: string;
    };
  }[];
}

interface ProfileProps {
  orders: Order[];
}

export default function Profile({ orders }: ProfileProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('orders');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/profile');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Head>
        <title>My Profile | Luxe Hair Collection</title>
      </Head>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and orders</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Sign Out
                </button>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Full name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{session.user.name || 'Not provided'}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{session.user.email}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Account type</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">{session.user.role}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`${
                      activeTab === 'orders'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                  >
                    Orders
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`${
                      activeTab === 'settings'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => setActiveTab('wishlist')}
                    className={`${
                      activeTab === 'wishlist'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                  >
                    Wishlist
                  </button>
                </nav>
              </div>

              {activeTab === 'orders' && (
                <div className="mt-6">
                  <h2 className="text-lg font-medium text-gray-900">Order History</h2>
                  {orders.length === 0 ? (
                    <div className="mt-6 text-center py-12 bg-white rounded-lg shadow">
                      <p className="text-gray-500">You haven't placed any orders yet.</p>
                      <Link href="/products" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {orders.map((order) => (
                          <li key={order.id}>
                            <div className="px-4 py-4 sm:px-6">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-primary-600 truncate">
                                  Order #{order.id.substring(0, 8)}
                                </p>
                                <div className="ml-2 flex-shrink-0 flex">
                                  <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-gray-100 text-gray-800'}`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                  <p className="flex items-center text-sm text-gray-500">
                                    {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                                  </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                  <p>
                                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-4">
                                <div className="flex space-x-2 overflow-x-auto py-2">
                                  {order.orderItems.map((item) => (
                                    <div key={item.id} className="flex-shrink-0 w-16">
                                      <img 
                                        src={item.product.imageUrl} 
                                        alt={item.product.title} 
                                        className="h-16 w-16 rounded-md object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="mt-2 flex justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  Total: ${order.total.toFixed(2)}
                                </p>
                                <Link href={`/orders/${order.id}`} className="text-sm font-medium text-primary-600 hover:text-primary-500">
                                  View Order Details
                                </Link>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Account Settings</h2>
                  <form className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          defaultValue={session.user.name || ''}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          defaultValue={session.user.email || ''}
                          disabled
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="password"
                          id="password"
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Wishlist</h2>
                  <p className="text-gray-500 text-center py-12">Your wishlist is empty.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // This would normally fetch orders from the database based on the user's session
  // For now, we'll return an empty array
  return {
    props: {
      orders: [],
    },
  };
};
