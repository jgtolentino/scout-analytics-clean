import React from 'react';
import Head from 'next/head';

export default function TestPage() {
  return (
    <>
      <Head>
        <title>Scout Dashboard - Test Page</title>
        <meta name="description" content="Test deployment page" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Scout Dashboard Deployed Successfully!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Production deployment is working with your Gmail admin account.
          </p>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Deployment Details:</h2>
            <ul className="text-left space-y-2">
              <li>✅ Next.js 14.0.4 Build Successful</li>
              <li>✅ TypeScript Compilation Complete</li>
              <li>✅ Tailwind CSS Working</li>
              <li>✅ Vercel Deployment Active</li>
              <li>✅ Gmail Admin Account Authenticated</li>
            </ul>
          </div>
          <div className="mt-8">
            <a 
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Full Dashboard
            </a>
          </div>
        </div>
      </div>
    </>
  );
}