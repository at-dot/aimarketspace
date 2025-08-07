'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const saveCookieConsent = async (essential: boolean, analytics: boolean) => {
    const consentData = {
      essential,
      analytics,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    // Save to localStorage
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));

    // Save to Supabase if user is logged in
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from('cookie_consent_logs').insert({
          user_id: user.id,
          consent_given: true,
          essential_cookies: essential,
          analytics_cookies: analytics,
          consent_version: '1.0'
        });
      } else {
        // For non-logged in users, save with session ID
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('sessionId', sessionId);
     }
        
        await supabase.from('cookie_consent_logs').insert({
          session_id: sessionId,
          consent_given: true,
          essential_cookies: essential,
          analytics_cookies: analytics,
          consent_version: '1.0'
        });
      }
    } catch (error) {
      console.error('Error saving consent:', error);
    }

    setShowBanner(false);
  };

  const handleAcceptAll = () => {
    setAnalyticsEnabled(true);
    saveCookieConsent(true, true);
  };

  const handleRejectOptional = () => {
    setAnalyticsEnabled(false);
    saveCookieConsent(true, false);
  };

  const handleSaveSettings = () => {
    saveCookieConsent(true, analyticsEnabled);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
      {!showSettings ? (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0 sm:mr-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🍪 We value your privacy
              </h3>
              <p className="text-sm text-gray-600">
                We use cookies to enhance your experience and keep you logged in. 
                Analytics cookies help us understand how to improve our platform.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cookie Settings
              </button>
              <button
                onClick={handleRejectOptional}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reject Optional
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Accept All
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
      ) : (
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cookie Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={true}
                disabled
                className="mt-1 h-4 w-4 text-purple-600 rounded border-gray-300"
              />
              <div className="ml-3">
                <label className="text-sm font-medium text-gray-900">
                  Essential Cookies (Always On)
                </label>
                <p className="text-sm text-gray-500">
                  Required for authentication and basic site functionality
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                className="mt-1 h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
              <div className="ml-3">
                <label className="text-sm font-medium text-gray-900">
                  Analytics Cookies (Optional)
                </label>
                <p className="text-sm text-gray-500">
                  Help us understand how to improve the platform
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}