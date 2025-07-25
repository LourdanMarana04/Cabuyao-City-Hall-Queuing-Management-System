<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Event;

class QueueController extends Controller
{
    /**
     * Generate a new queue number for a department and transaction
     */
    public function generateQueueNumber(Request $request)
    {
        $request->validate([
            'department_id' => 'required|exists:departments,id',
            'transaction_id' => 'required|exists:transactions,id',
        ]);

        $department = Department::findOrFail($request->department_id);
        $transaction = Transaction::findOrFail($request->transaction_id);

        // Get department prefix (first 3 letters)
        $prefix = strtoupper(substr($department->name, 0, 3));
        
        // Get current date for daily reset
        $today = Carbon::today()->format('Y-m-d');
        
        // Get the last queue number for today (only waiting/pending)
        $lastQueue = DB::table('queue_numbers')
            ->where('department_id', $department->id)
            ->whereDate('created_at', $today)
            ->whereIn('status', ['waiting', 'pending'])
            ->orderBy('queue_number', 'desc')
            ->first();

        // Generate new queue number
        $nextNumber = $lastQueue ? intval($lastQueue->queue_number) + 1 : 1;
        $queueNumber = $prefix . '#' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        // Store the queue number
        $priority = $request->boolean('priority', false);
        $source = $request->input('source', 'kiosk'); // Default to 'kiosk' if not provided
        $queueId = DB::table('queue_numbers')->insertGetId([
            'department_id' => $department->id,
            'transaction_id' => $transaction->id,
            'queue_number' => $nextNumber,
            'full_queue_number' => $queueNumber,
            'status' => 'waiting',
            'priority' => $priority,
            'source' => $source,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Calculate estimated wait time
        $estimatedWaitTime = $this->calculateEstimatedWaitTime($department->id, $transaction->id);

        $response = [
            'queue_id' => $queueId,
            'queue_number' => $queueNumber,
            'department' => $department,
            'transaction' => $transaction,
            'estimated_wait_time' => $estimatedWaitTime,
            'timestamp' => now()->format('Y-m-d H:i:s'),
            'priority' => $priority,
            'source' => $source,
        ];

        // Broadcast the queue update for real-time display
        $this->broadcastQueueUpdate($department->id, $queueNumber, $transaction->name, $priority);

        return response()->json($response);
    }

    /**
     * Broadcast queue update for real-time display
     */
    private function broadcastQueueUpdate($departmentId, $queueNumber, $transactionName, $priority = false)
    {
        // For now, we'll use a simple approach with a custom endpoint
        // In a production environment, you might want to use Laravel Echo or Pusher
        $queueData = [
            'department_id' => $departmentId,
            'queue_number' => $queueNumber,
            'transaction_name' => $transactionName,
            'timestamp' => now()->format('Y-m-d H:i:s'),
            'status' => 'waiting',
            'priority' => $priority,
        ];

        // Store the latest queue update in cache for real-time access
        cache()->put("queue_update_{$departmentId}", $queueData, 300); // 5 minutes
    }

    /**
     * Calculate estimated wait time based on current queue length and average processing time
     */
    private function calculateEstimatedWaitTime($departmentId, $transactionId)
    {
        // Get current queue length (waiting status)
        $queueLength = DB::table('queue_numbers')
            ->where('department_id', $departmentId)
            ->where('transaction_id', $transactionId)
            ->where('status', 'waiting')
            ->whereDate('created_at', Carbon::today())
            ->count();

        // Get average processing time from recent completed transactions (last 7 days)
        $avgProcessingTime = DB::table('queue_numbers')
            ->where('department_id', $departmentId)
            ->where('transaction_id', $transactionId)
            ->where('status', 'completed')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->whereNotNull('completed_at')
            ->avg(DB::raw('TIMESTAMPDIFF(MINUTE, created_at, completed_at)'));

        // Default average processing time if no data available (10 minutes)
        $avgProcessingTime = $avgProcessingTime ?: 10;

        // Calculate estimated wait time
        $estimatedMinutes = $queueLength * $avgProcessingTime;

        return [
            'minutes' => $estimatedMinutes,
            'formatted' => $this->formatWaitTime($estimatedMinutes),
        ];
    }

    /**
     * Format wait time in a human-readable format
     */
    private function formatWaitTime($minutes)
    {
        if ($minutes < 60) {
            return round($minutes) . ' minutes';
        } else {
            $hours = floor($minutes / 60);
            $remainingMinutes = round($minutes % 60);
            if ($remainingMinutes === 0) {
                return $hours . ' hour' . ($hours > 1 ? 's' : '');
            } else {
                return $hours . ' hour' . ($hours > 1 ? 's' : '') . ' ' . $remainingMinutes . ' minutes';
            }
        }
    }

    /**
     * Get all queue numbers for a department
     */
    public function getQueueStatus($departmentId)
    {
        $queueNumbers = DB::table('queue_numbers')
            ->join('transactions', 'queue_numbers.transaction_id', '=', 'transactions.id')
            ->select('queue_numbers.*', 'transactions.name as transaction_name')
            ->where('queue_numbers.department_id', $departmentId)
            ->orderBy('queue_numbers.queue_number', 'asc')
            ->get();

        return response()->json($queueNumbers);
    }

    /**
     * Get latest queue updates for real-time display
     */
    public function getLatestQueueUpdates()
    {
        $departments = Department::all();
        $latestUpdates = [];

        foreach ($departments as $department) {
            $cacheKey = "queue_update_{$department->id}";
            $latestUpdate = cache()->get($cacheKey);
            
            if ($latestUpdate) {
                $latestUpdates[] = $latestUpdate;
            }
        }

        return response()->json($latestUpdates);
    }

    /**
     * Get latest queue update for a specific department
     */
    public function getLatestQueueUpdate($departmentId)
    {
        $cacheKey = "queue_update_{$departmentId}";
        $latestUpdate = cache()->get($cacheKey);
        
        return response()->json($latestUpdate ?: null);
    }

    /**
     * Mark queue number as completed
     */
    public function completeQueue(Request $request)
    {
        $request->validate([
            'queue_id' => 'required|exists:queue_numbers,id',
        ]);

        DB::table('queue_numbers')
            ->where('id', $request->queue_id)
            ->update([
                'status' => 'completed',
                'completed_at' => now(),
                'updated_at' => now(),
            ]);

        return response()->json(['message' => 'Queue completed successfully']);
    }

    /**
     * Update queue status (successful/failed)
     */
    public function updateQueueStatus(Request $request)
    {
        $request->validate([
            'queue_id' => 'required|exists:queue_numbers,id',
            'status' => 'required|in:successful,failed',
        ]);

        DB::table('queue_numbers')
            ->where('id', $request->queue_id)
            ->update([
                'status' => $request->status,
                'completed_at' => now(),
                'updated_at' => now(),
            ]);

        return response()->json(['message' => 'Queue status updated successfully']);
    }

    /**
     * Reset all queue numbers for a department
     */
    public function resetQueue($departmentId)
    {
        // Delete only today's queue numbers for this department that are still 'waiting' or 'pending'
        DB::table('queue_numbers')
            ->where('department_id', $departmentId)
            ->whereDate('created_at', Carbon::today())
            ->where(function ($query) {
                $query->where('status', 'waiting')
                      ->orWhere('status', 'pending');
            })
            ->delete();

        return response()->json(['message' => 'Queue has been reset successfully.']);
    }

    /**
     * Get transaction history (successful/failed) for a department
     */
    public function getTransactionHistory($departmentId)
    {
        $history = DB::table('queue_numbers')
            ->join('transactions', 'queue_numbers.transaction_id', '=', 'transactions.id')
            ->select(
                'queue_numbers.id',
                'queue_numbers.queue_number',
                'queue_numbers.full_queue_number',
                'queue_numbers.status',
                'queue_numbers.completed_at',
                'queue_numbers.source',
                'transactions.name as transaction_name'
            )
            ->where('queue_numbers.department_id', $departmentId)
            ->whereIn('queue_numbers.status', ['successful', 'failed'])
            ->orderBy('queue_numbers.completed_at', 'desc')
            ->get();

        return response()->json($history);
    }

    /**
     * Set the currently serving queue number for a department
     */
    public function setCurrentlyServing(Request $request)
    {
        $request->validate([
            'department_id' => 'required|exists:departments,id',
            'queue_number' => 'required|string',
        ]);
        $departmentId = $request->department_id;
        $queueNumber = $request->queue_number;
        cache()->put("currently_serving_{$departmentId}", $queueNumber, 300); // 5 minutes
        return response()->json(['message' => 'Currently serving number set successfully']);
    }

    /**
     * Get the currently serving queue number for all departments
     */
    public function getCurrentlyServingAll()
    {
        $departments = Department::all();
        $currentlyServing = [];
        foreach ($departments as $department) {
            $queueNumber = cache()->get("currently_serving_{$department->id}");
            $currentlyServing[] = [
                'department_id' => $department->id,
                'department_name' => $department->name,
                'queue_number' => $queueNumber,
            ];
        }
        return response()->json($currentlyServing);
    }
} 