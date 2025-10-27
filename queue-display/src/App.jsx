import React, { useEffect, useMemo, useState } from 'react'

const API_BASE = 'http://localhost:8000/api'

function useQuery() {
  return useMemo(() => new URLSearchParams(window.location.search), [])
}

function DepartmentPicker() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    async function run() {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/departments`)
        const data = await res.json()
        if (!res.ok) throw new Error('Failed to load departments')
        setDepartments(Array.isArray(data) ? data : [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-200 w-full max-w-xl">
        <h1 className="text-3xl font-bold text-red-600 mb-2 tracking-tight">Queue Display</h1>
        <p className="text-gray-700 mb-6">Select a department to view the live queue.</p>
        {error && <div className="mb-4 bg-red-100 border border-red-300 text-red-700 rounded-lg p-3">{error}</div>}
        {loading ? (
          <div className="text-gray-600">Loading departments...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map(d => (
              <a key={d.id} href={`/?departmentId=${d.id}`} className="block border rounded-xl p-4 hover:shadow-md transition border-gray-200 hover:bg-gray-50">
                <div className="text-lg font-semibold text-gray-800">{d.name}</div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const query = useQuery()
  const departmentId = query.get('departmentId')
  const [department, setDepartment] = useState(null)
  const [currentlyServing, setCurrentlyServing] = useState(null)
  const [waitingList, setWaitingList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchData() {
    try {
      setError('')
      setLoading(true)
      // Department info
      const deptRes = await fetch(`${API_BASE}/departments/${departmentId}`)
      const dept = await deptRes.json()
      if (!deptRes.ok) throw new Error(dept?.message || 'Failed to load department')
      setDepartment(dept)

      // Currently serving
      const servingRes = await fetch(`${API_BASE}/queue/currently-serving`)
      const serving = await servingRes.json()
      const match = Array.isArray(serving) ? serving.find(s => String(s.department_id) === String(departmentId)) : null
      setCurrentlyServing(match?.queue_number || null)

      // Waiting list for today
      const queueRes = await fetch(`${API_BASE}/queue/status/${departmentId}`)
      const queue = await queueRes.json()
      if (!queueRes.ok) throw new Error('Failed to load queue status')
      setWaitingList(Array.isArray(queue) ? queue : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!departmentId) return
    fetchData()
    const id = setInterval(fetchData, 5000)
    return () => clearInterval(id)
  }, [departmentId])

  if (!departmentId) return <DepartmentPicker />

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-red-600 tracking-tight">{department?.name || 'Department'}</h1>
            <p className="text-gray-600">City Hall Queue Display</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Updated</div>
            <div className="font-semibold">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded-xl p-4 mb-4">{error}</div>
        )}

        {/* Now Serving */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-6">
          <div className="text-2xl font-bold text-gray-800 mb-4">NOW SERVING</div>
          <div className="flex items-center gap-8">
            <div className={`inline-block text-7xl font-black border-4 px-16 py-6 rounded-lg shadow-md ${currentlyServing ? 'bg-yellow-400 text-black border-yellow-600' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
              {currentlyServing || '--'}
            </div>
            <div className="flex-1">
              <div className="text-gray-600">Up Next</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {waitingList.slice(0, 6).map(item => (
                  <div key={item.id} className="border rounded-xl p-4 bg-gradient-to-b from-blue-50 to-white border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-extrabold text-blue-700">{item.full_queue_number || item.queue_number}</div>
                      <div className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-semibold ring-1 ring-yellow-200">{(item.status || '').toUpperCase()}</div>
                    </div>
                    <div className="mt-2 text-gray-800 font-semibold">{item.transaction_name}</div>
                    {item.is_senior_citizen ? (
                      <div className="mt-1 text-sm text-blue-700">Senior Citizen</div>
                    ) : null}
                    <div className="mt-1 text-xs text-gray-500">{new Date(item.created_at).toLocaleTimeString()}</div>
                  </div>
                ))}
                {waitingList.length === 0 && (
                  <div className="text-gray-500">No pending numbers.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="text-xl font-bold text-gray-800 mb-4">TODAY'S QUEUE</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {waitingList.map(item => (
              <div key={item.id} className="border rounded-xl p-4 bg-white hover:shadow-md transition border-gray-200 hover:bg-gray-50">
                <div className="text-2xl font-black text-gray-900">{item.full_queue_number || item.queue_number}</div>
                <div className="text-sm text-blue-700 font-semibold">{item.transaction_name}</div>
                <div className="text-xs text-gray-500 mt-1">{new Date(item.created_at).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


