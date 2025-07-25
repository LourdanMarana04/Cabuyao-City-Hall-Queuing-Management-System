<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Transaction;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Department::with('transactions')->get();
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $department = Department::create($request->only(['name', 'description', 'active']));
        // Create transactions if provided
        if ($request->has('transactions') && is_array($request->transactions)) {
            foreach ($request->transactions as $txName) {
                if (trim($txName) !== '') {
                    $department->transactions()->create([
                        'name' => $txName,
                        'archived' => false,
                        'requirements' => [],
                        'procedures' => [],
                    ]);
                }
            }
        }
        // Return department with transactions
        return response()->json($department->load('transactions'), 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Department::with('transactions')->findOrFail($id);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Http\Response
     */
    public function edit(Department $department)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $department = Department::findOrFail($id);
        $department->update($request->only(['name', 'description', 'active']));
        return response()->json($department);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $department = Department::findOrFail($id);
        $department->delete();
        return response()->json(null, 204);
    }

    public function storeTransaction(Request $request, $departmentId)
    {
        $department = Department::findOrFail($departmentId);
        $transaction = $department->transactions()->create($request->only(['name', 'archived', 'requirements', 'procedures']));
        return response()->json($transaction, 201);
    }

    public function updateTransaction(Request $request, $departmentId, $transactionId)
    {
        $department = Department::findOrFail($departmentId);
        $transaction = $department->transactions()->findOrFail($transactionId);
        $transaction->update($request->only(['name', 'requirements', 'procedures']));
        return response()->json($transaction);
    }
}
