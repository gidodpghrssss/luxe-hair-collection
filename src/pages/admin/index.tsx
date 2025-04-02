import React from 'react';
import Head from 'next/head';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Sample data for the dashboard
const stats = [
  {
    name: 'Total Revenue',
    value: '$24,567.89',
    change: '+12.5%',
    trend: 'up',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Orders',
    value: '156',
    change: '+8.2%',
    trend: 'up',
    icon: ShoppingBagIcon,
  },
  {
    name: 'Customers',
    value: '1,245',
    change: '+15.3%',
    trend: 'up',
    icon: UsersIcon,
  },
  {
    name: 'Page Views',
    value: '8,942',
    change: '-2.7%',
    trend: 'down',
    icon: EyeIcon,
  },
];

// Sample data for revenue chart
const revenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Revenue',
      data: [12500, 15000, 17800, 16200, 19500, 22000, 24500, 26000, 23000, 25500, 28000, 30000],
      borderColor: 'rgb(229, 79, 127)',
      backgroundColor: 'rgba(229, 79, 127, 0.1)',
      fill: true,
      tension: 0.4,
    },
  ],
};

// Sample data for product categories chart
const categoriesData = {
  labels: ['Wigs', 'Extensions', 'Closures', 'Frontals', 'Bundles', 'Accessories'],
  datasets: [
    {
      label: 'Sales by Category',
      data: [35, 25, 15, 10, 10, 5],
      backgroundColor: [
        'rgba(229, 79, 127, 0.8)',
        'rgba(93, 125, 159, 0.8)',
        'rgba(239, 180, 3, 0.8)',
        'rgba(46, 204, 113, 0.8)',
        'rgba(142, 68, 173, 0.8)',
        'rgba(241, 196, 15, 0.8)',
      ],
      borderColor: [
        'rgba(229, 79, 127, 1)',
        'rgba(93, 125, 159, 1)',
        'rgba(239, 180, 3, 1)',
        'rgba(46, 204, 113, 1)',
        'rgba(142, 68, 173, 1)',
        'rgba(241, 196, 15, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

// Sample data for recent orders
const recentOrders = [
  {
    id: 'ORD-001234',
    customer: 'Jennifer Smith',
    date: '2025-04-01',
    amount: '$349.99',
    status: 'Completed',
    items: 2,
  },
  {
    id: 'ORD-001233',
    customer: 'Michael Johnson',
    date: '2025-04-01',
    amount: '$189.99',
    status: 'Processing',
    items: 1,
  },
  {
    id: 'ORD-001232',
    customer: 'Sarah Williams',
    date: '2025-03-31',
    amount: '$524.97',
    status: 'Completed',
    items: 3,
  },
  {
    id: 'ORD-001231',
    customer: 'David Brown',
    date: '2025-03-30',
    amount: '$279.99',
    status: 'Shipped',
    items: 1,
  },
  {
    id: 'ORD-001230',
    customer: 'Emily Davis',
    date: '2025-03-29',
    amount: '$159.99',
    status: 'Completed',
    items: 1,
  },
];

// Sample data for top products
const topProducts = [
  {
    id: 1,
    name: 'Brazilian Body Wave Wig',
    sales: 42,
    revenue: '$10,499.58',
    growth: '+15%',
  },
  {
    id: 2,
    name: 'Peruvian Straight Hair Extensions',
    sales: 38,
    revenue: '$6,839.62',
    growth: '+8%',
  },
  {
    id: 3,
    name: 'Malaysian Curly Lace Frontal',
    sales: 35,
    revenue: '$5,599.65',
    growth: '+12%',
  },
  {
    id: 4,
    name: 'Indian Remy Hair Bundles',
    sales: 30,
    revenue: '$3,899.70',
    growth: '+5%',
  },
];

// Sample data for monthly sales chart
const monthlySalesData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'This Year',
      data: [65, 78, 90, 85, 95, 110, 120, 130, 115, 125, 140, 150],
      backgroundColor: 'rgba(229, 79, 127, 0.8)',
    },
    {
      label: 'Last Year',
      data: [55, 65, 75, 70, 80, 90, 100, 110, 95, 105, 115, 125],
      backgroundColor: 'rgba(93, 125, 159, 0.8)',
    },
  ],
};

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Head>
        <title>Admin Dashboard | Luxe Hair Collection</title>
      </Head>

      <div className="py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your business performance and key metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <div className="flex items-center">
                  {stat.trend === 'up' ? (
                    <ArrowUpIcon className="flex-shrink-0 h-4 w-4 text-green-500" aria-hidden="true" />
                  ) : (
                    <ArrowDownIcon className="flex-shrink-0 h-4 w-4 text-red-500" aria-hidden="true" />
                  )}
                  <span
                    className={`ml-1 font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="ml-1 text-gray-500">from last month</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h2>
          <div className="h-80">
            <Line
              data={revenueData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `$${value.toLocaleString()}`,
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `Revenue: $${context.raw.toLocaleString()}`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sales by Category</h2>
          <div className="h-80 flex items-center justify-center">
            <Doughnut
              data={categoriesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.label}: ${context.raw}%`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Order ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'Processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <a
              href="/admin/orders"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all orders <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Top Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Sales
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Revenue
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Growth
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sales} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.revenue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {product.growth}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <a
              href="/admin/products"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all products <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Monthly Sales Comparison */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Sales Comparison</h2>
          <div className="h-80">
            <Bar
              data={monthlySalesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
