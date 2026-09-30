import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://127.0.0.1:8000/api/results'

function App() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`APIエラー: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        setRecords(data.records)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="app">
      <h1>バッチ処理結果</h1>

      {loading && <p>読み込み中...</p>}
      {error && <p className="error">エラー: {error}</p>}

      {!loading && !error && (
        <table className="results-table">
          <thead>
            <tr>
              <th>name</th>
              <th>amount</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={index}>
                <td>{record.name}</td>
                <td>{record.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App
