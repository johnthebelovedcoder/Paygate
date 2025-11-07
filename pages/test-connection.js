import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function TestConnection() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('users');

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable]);

  const fetchTables = async () => {
    try {
      const { data: tablesData, error } = await supabase
        .rpc('get_tables')
        .select('*');

      if (error) throw error;
      
      if (tablesData && tablesData.length > 0) {
        setTables(tablesData);
        if (tablesData.includes('users')) {
          setSelectedTable('users');
        }
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError('Failed to fetch tables. Check console for details.');
    }
  };

  const fetchTableData = async (tableName) => {
    setLoading(true);
    setError(null);
    try {
      const { data: tableData, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(5);

      if (error) throw error;
      
      setData(tableData || []);
    } catch (err) {
      console.error(`Error fetching data from ${tableName}:`, err);
      setError(`Failed to fetch data from ${tableName}. Check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Supabase Connection Test</h1>
      
      {tables.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3>Select a table:</h3>
          <select 
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            style={{ padding: '0.5rem', minWidth: '200px' }}
          >
            {tables.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div style={{ color: 'red', margin: '1rem 0', padding: '1rem', background: '#ffeeee', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflowX: 'auto' }}>
        <h3>Data from {selectedTable}:</h3>
        {loading ? (
          <p>Loading...</p>
        ) : data.length > 0 ? (
          <pre>{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <p>No data found in {selectedTable} table.</p>
        )}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#e8f4f8', borderRadius: '4px' }}>
        <h3>Connection Status:</h3>
        <p>Connected to: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        <p>Tables found: {tables.length}</p>
      </div>
    </div>
  );
}
