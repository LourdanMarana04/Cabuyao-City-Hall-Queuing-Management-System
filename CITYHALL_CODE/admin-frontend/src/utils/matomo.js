import React from 'react';

// Matomo Analytics Integration
class MatomoAnalytics {
  constructor() {
    this.initialized = false;
    this.matomoUrl = import.meta.env.VITE_MATOMO_URL;
    this.siteId = import.meta.env.VITE_MATOMO_SITE_ID || '1';
  }

  // Initialize Matomo tracking
  initialize() {
    if (this.initialized || !this.matomoUrl) {
      return;
    }

    // Add Matomo tracking script
    var _paq = window._paq = window._paq || [];
    
    // Track page views automatically
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    
    (function() {
      var u = this.matomoUrl.endsWith('/') ? this.matomoUrl : this.matomoUrl + '/';
      _paq.push(['setTrackerUrl', u + 'matomo.php']);
      _paq.push(['setSiteId', this.siteId]);
      
      var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
      g.type = 'text/javascript'; 
      g.async = true; 
      g.src = u + 'matomo.js';
      s.parentNode.insertBefore(g, s);
    }.bind(this))();

    this.initialized = true;
  }

  // Track custom events
  trackEvent(category, action, name = null, value = null) {
    if (!this.initialized || !window._paq) {
      return;
    }

    const eventParams = ['trackEvent', category, action];
    if (name) eventParams.push(name);
    if (value) eventParams.push(value);

    window._paq.push(eventParams);
  }

  // Track page view manually
  trackPageView(customTitle = null) {
    if (!this.initialized || !window._paq) {
      return;
    }

    if (customTitle) {
      window._paq.push(['setDocumentTitle', customTitle]);
    }
    window._paq.push(['trackPageView']);
  }

  // Track goals
  trackGoal(goalId, customRevenue = null) {
    if (!this.initialized || !window._paq) {
      return;
    }

    const goalParams = ['trackGoal', goalId];
    if (customRevenue) goalParams.push(customRevenue);

    window._paq.push(goalParams);
  }

  // Track site search
  trackSiteSearch(keyword, category = null, resultsCount = null) {
    if (!this.initialized || !window._paq) {
      return;
    }

    const searchParams = ['trackSiteSearch', keyword];
    if (category) searchParams.push(category);
    if (resultsCount) searchParams.push(resultsCount);

    window._paq.push(searchParams);
  }

  // Set custom variables
  setCustomVariable(index, name, value, scope = 'visit') {
    if (!this.initialized || !window._paq) {
      return;
    }

    window._paq.push(['setCustomVariable', index, name, value, scope]);
  }

  // Track user ID for authenticated users
  setUserId(userId) {
    if (!this.initialized || !window._paq) {
      return;
    }

    window._paq.push(['setUserId', userId]);
  }

  // Reset user ID (for logout)
  resetUserId() {
    if (!this.initialized || !window._paq) {
      return;
    }

    window._paq.push(['resetUserId']);
  }
}

// Create singleton instance
const matomo = new MatomoAnalytics();

// Higher-order component for tracking page views in React components
export const withMatomoTracking = (WrappedComponent, pageTitle = null) => {
  return function TrackedComponent(props) {
    React.useEffect(() => {
      matomo.trackPageView(pageTitle);
    }, []);

    return React.createElement(WrappedComponent, props);
  };
};

export default matomo;