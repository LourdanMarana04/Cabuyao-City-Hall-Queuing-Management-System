# Matomo Analytics Integration Setup

This guide explains how to configure Matomo analytics for the City Hall application's super admin dashboard.

## Prerequisites

1. A running Matomo instance (self-hosted or cloud)
2. Matomo authentication token with API access
3. A configured site in Matomo

## Backend Configuration

### 1. Environment Variables

Add the following variables to your `.env` file in the `admin-backend` directory:

```env
MATOMO_URL=https://your-matomo-instance.com
MATOMO_TOKEN=your_matomo_auth_token_here
MATOMO_SITE_ID=1
```

### 2. Get Matomo Authentication Token

1. Log into your Matomo dashboard
2. Go to **Administration** → **Platform** → **API**
3. Click on **User Authentication** 
4. Generate a new token or use an existing one
5. Copy the token and add it to your `.env` file

### 3. Get Site ID

1. In Matomo, go to **Administration** → **Websites** → **Manage**
2. Find your website and note the ID number
3. Add this ID to your `.env` file as `MATOMO_SITE_ID`

## Frontend Configuration

### 1. Environment Variables

Add the following variables to your `.env` file in the `admin-frontend` directory:

```env
VITE_MATOMO_URL=https://your-matomo-instance.com
VITE_MATOMO_SITE_ID=1
```

### 2. Tracking Code Integration

The Matomo tracking code is automatically initialized in `src/main.jsx`. Make sure your environment variables are properly set.

## Analytics Metrics

The super admin dashboard displays the following metrics from Matomo:

1. **Average Users Per Day (30d)**: Daily unique visitors averaged over 30 days
2. **Sessions (24h)**: Total visits in the last 24 hours
3. **Average Session Time (30d)**: Average time spent on site over 30 days
4. **Canceled Transactions (30d)**: Custom events tracked as "TransactionCanceled"

## Custom Event Tracking

To track canceled transactions or other custom events, use the Matomo utility:

```javascript
import matomo from './utils/matomo.js';

// Track a canceled transaction
matomo.trackEvent('Transaction', 'TransactionCanceled', 'Order #12345');

// Track other custom events
matomo.trackEvent('User', 'Login', 'AdminUser');
matomo.trackEvent('Form', 'Submit', 'ContactForm');
```

## Troubleshooting

### Common Issues

1. **No data appearing**: Check that your Matomo URL and token are correct
2. **CORS errors**: Ensure your Matomo instance allows requests from your frontend domain
3. **API errors**: Verify that your token has API access permissions

### Testing the Integration

1. Check the browser console for any JavaScript errors
2. Verify API calls to `/api/analytics` return data
3. Check Matomo's real-time visitor log to confirm tracking is working

### Required Matomo Permissions

Your API token needs the following permissions:
- View access to the website
- API access enabled
- Access to the following API methods:
  - `VisitsSummary.getUniqueVisitors`
  - `VisitsSummary.getVisits`
  - `VisitsSummary.getAvgTimeOnSite`
  - `Events.getAction`

## API Endpoints

The backend provides the following analytics endpoints:

- `GET /api/analytics?metric=daily_users&period=last30`
- `GET /api/analytics?metric=sessions&period=last1`
- `GET /api/analytics?metric=avg_session_time&period=last30`
- `GET /api/analytics?metric=events&period=last30&event_action=TransactionCanceled`

## Security Notes

- Keep your Matomo authentication token secure
- Use environment variables for configuration
- Consider IP restrictions in Matomo for additional security
- Regularly review and rotate your API tokens