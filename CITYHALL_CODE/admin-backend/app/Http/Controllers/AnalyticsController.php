<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Query the Matomo API for analytics data.
     */
    public function query(Request $request)
    {
        $matomoUrl = env('MATOMO_URL');
        $matomoToken = env('MATOMO_TOKEN');
        $matomoSiteId = env('MATOMO_SITE_ID', 1);

        if (!$matomoUrl || !$matomoToken) {
            Log::error('Matomo URL or Token is not configured.');
            return response()->json(['error' => 'Analytics service is not configured on the server.'], 500);
        }

        $metric = $request->input('metric', 'daily_users');
        $period = $request->input('period', 'last30');
        
        try {
            switch ($metric) {
                case 'daily_users':
                    return $this->getDailyUsers($matomoUrl, $matomoToken, $matomoSiteId, $period);
                
                case 'sessions':
                    return $this->getSessions($matomoUrl, $matomoToken, $matomoSiteId, $period);
                
                case 'avg_session_time':
                    return $this->getAvgSessionTime($matomoUrl, $matomoToken, $matomoSiteId, $period);
                
                case 'events':
                    $eventAction = $request->input('event_action', 'TransactionCanceled');
                    return $this->getEvents($matomoUrl, $matomoToken, $matomoSiteId, $period, $eventAction);
                
                default:
                    return response()->json(['error' => 'Unknown metric requested.'], 400);
            }
        } catch (\Exception $e) {
            Log::error('Matomo API query failed.', [
                'error' => $e->getMessage(),
                'metric' => $metric
            ]);
            return response()->json(['error' => 'Failed to retrieve analytics data.'], 500);
        }
    }

    private function getDailyUsers($matomoUrl, $matomoToken, $siteId, $period)
    {
        $date = $this->getPeriodDate($period);
        
        $response = Http::get($matomoUrl, [
            'module' => 'API',
            'method' => 'VisitsSummary.getUniqueVisitors',
            'idSite' => $siteId,
            'period' => 'day',
            'date' => $date,
            'format' => 'json',
            'token_auth' => $matomoToken
        ]);

        if ($response->failed()) {
            throw new \Exception('Failed to fetch daily users data from Matomo');
        }

        $data = $response->json();
        
        // Calculate average for the period
        if (is_array($data)) {
            $average = count($data) > 0 ? array_sum($data) / count($data) : 0;
            return response()->json(['value' => round($average)]);
        }
        
        return response()->json(['value' => $data ?? 0]);
    }

    private function getSessions($matomoUrl, $matomoToken, $siteId, $period)
    {
        $date = $this->getPeriodDate($period);
        
        $response = Http::get($matomoUrl, [
            'module' => 'API',
            'method' => 'VisitsSummary.getVisits',
            'idSite' => $siteId,
            'period' => $period === 'last1' ? 'day' : 'range',
            'date' => $date,
            'format' => 'json',
            'token_auth' => $matomoToken
        ]);

        if ($response->failed()) {
            throw new \Exception('Failed to fetch sessions data from Matomo');
        }

        $data = $response->json();
        $value = is_array($data) ? array_sum($data) : ($data ?? 0);
        
        return response()->json(['value' => $value . ' sessions']);
    }

    private function getAvgSessionTime($matomoUrl, $matomoToken, $siteId, $period)
    {
        $date = $this->getPeriodDate($period);
        
        $response = Http::get($matomoUrl, [
            'module' => 'API',
            'method' => 'VisitsSummary.getAvgTimeOnSite',
            'idSite' => $siteId,
            'period' => 'range',
            'date' => $date,
            'format' => 'json',
            'token_auth' => $matomoToken
        ]);

        if ($response->failed()) {
            throw new \Exception('Failed to fetch average session time from Matomo');
        }

        $data = $response->json();
        $seconds = is_array($data) ? array_sum($data) / count($data) : ($data ?? 0);
        
        return response()->json(['value' => round($seconds) . 's']);
    }

    private function getEvents($matomoUrl, $matomoToken, $siteId, $period, $eventAction)
    {
        $date = $this->getPeriodDate($period);
        
        $response = Http::get($matomoUrl, [
            'module' => 'API',
            'method' => 'Events.getAction',
            'idSite' => $siteId,
            'period' => 'range',
            'date' => $date,
            'format' => 'json',
            'token_auth' => $matomoToken
        ]);

        if ($response->failed()) {
            throw new \Exception('Failed to fetch events data from Matomo');
        }

        $data = $response->json();
        $count = 0;
        
        if (is_array($data)) {
            foreach ($data as $event) {
                if (isset($event['label']) && strpos($event['label'], $eventAction) !== false) {
                    $count += $event['nb_events'] ?? 0;
                }
            }
        }
        
        return response()->json(['value' => $count]);
    }

    private function getPeriodDate($period)
    {
        switch ($period) {
            case 'last1':
                return 'yesterday';
            case 'last7':
                return 'last7';
            case 'last30':
                return 'last30';
            default:
                return 'last30';
        }
    }
}
