import React, { createContext, useContext, useState, useEffect } from 'react';

const QueueContext = createContext();

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};

export const QueueProvider = ({ children }) => {
  const [queueUpdates, setQueueUpdates] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchLatestQueueUpdates = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/queue/latest-updates');
      if (response.ok) {
        const updates = await response.json();
        const updatesMap = {};
        updates.forEach(update => {
          updatesMap[update.department_id] = update;
        });
        setQueueUpdates(updatesMap);
      }
    } catch (error) {
      console.error('Error fetching queue updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentQueueUpdate = async (departmentId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/queue/latest-update/${departmentId}`);
      if (response.ok) {
        const update = await response.json();
        if (update) {
          setQueueUpdates(prev => ({
            ...prev,
            [departmentId]: update
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching department queue update:', error);
    }
  };

  // Poll for updates every 5 seconds
  useEffect(() => {
    fetchLatestQueueUpdates();
    
    const interval = setInterval(() => {
      fetchLatestQueueUpdates();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getLatestQueueNumber = (departmentId) => {
    return queueUpdates[departmentId]?.queue_number || null;
  };

  const getLatestQueueTransaction = (departmentId) => {
    return queueUpdates[departmentId]?.transaction_name || null;
  };

  const getLatestQueueTimestamp = (departmentId) => {
    return queueUpdates[departmentId]?.timestamp || null;
  };

  const value = {
    queueUpdates,
    loading,
    getLatestQueueNumber,
    getLatestQueueTransaction,
    getLatestQueueTimestamp,
    fetchDepartmentQueueUpdate,
    fetchLatestQueueUpdates
  };

  return (
    <QueueContext.Provider value={value}>
      {children}
    </QueueContext.Provider>
  );
}; 