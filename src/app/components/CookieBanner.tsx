'use client';
import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const saveCookieConsent = () => {
    const consentData = {
      essential: true,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    // Save to localStorage
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));

    setShowBanner(false);
  };

  const handleAccept = () => {
    saveCookieConsent();
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0 sm:mr-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🍪 We value your privacy
            </h3>
            <p className="text-sm text-gray-600">
              We use essential cookies to keep you logged in and ensure the site works properly.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          <a 
            href="/legal/cookies.html" 
            target="_blank"
            className="underline hover:text-gray-700"
          >
            Read our Cookie Policy
          </a>
        </div>
      </div>
    </div>
  );
}