'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Live API Integration & Page Editor
            </h1>
            <p className="text-xl text-gray-600">
              Connect real platforms and edit websites in real-time
            </p>
          </div>

          {/* Main Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* API Integrations Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                API Integrations
              </h2>
              <p className="text-gray-600 mb-6">
                Connect to live data sources using Nango.dev OAuth integrations
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  HubSpot (Contacts, Deals, Companies)
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Google Ads (Campaigns, Ads, Metrics)
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Shopify (Products, Orders, Customers)
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  LinkedIn Ads (Campaigns, Analytics)
                </li>
              </ul>
              <button
                onClick={() => router.push('/integrations')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Manage Integrations
              </button>
            </div>

            {/* Page Editor Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Visual Page Editor
              </h2>
              <p className="text-gray-600 mb-6">
                Edit website content live with real-time DOM manipulation
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Edit headlines & sub-headlines
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Modify body copy & content
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Update CTA buttons & links
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Change colors & styles
                </li>
              </ul>
              <button
                onClick={() => router.push('/editor')}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Open Page Editor
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Key Features
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Real OAuth</h4>
                <p className="text-sm text-gray-600">Secure authentication via Nango.dev</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Live Data</h4>
                <p className="text-sm text-gray-600">Real-time API data fetching</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Live Editing</h4>
                <p className="text-sm text-gray-600">Instant visual updates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

