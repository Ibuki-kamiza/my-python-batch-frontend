import { useEffect, useRef, useState } from 'react'
import './App.css'

const API_BASE = 'http://127.0.0.1:8000'
const POLL_INTERVAL_MS = 5000

function App() {
  const [currentView, setCurrentView] = useState('home')

  const [records, setRecords] = useState([])
  const [resultsLoading, setResultsLoading] = useState(true)
  const [resultsError, setResultsError] = useState(null)

  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState(null)

  const [runs, setRuns] = useState([])
  const [runsLoading, setRunsLoading] = useState(true)
  const [runsError, setRunsError] = useState(null)
  const [searchDate, setSearchDate] = useState('')
  const searchDateRef = useRef('')

  const [errors, setErrors] = useState([])
  const [errorsLoading, setErrorsLoading] = useState(true)

  useEffect(() => {
    searchDateRef.current = searchDate
  }, [searchDate])

  const fetchResults = () => {
    fetch(`${API_BASE}/api/results`)
      .then((res) => {
        if (!res.ok) throw new Error(`APIエラー: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setRecords(data.records)
        setResultsLoading(false)
      })
      .catch((err) => {
        setResultsError(err.message)
        setResultsLoading(false)
      })
  }

  const fetchSummary = () => {
    fetch(`${API_BASE}/api/summary`)
      .then((res) => {
        if (!res.ok) throw new Error(`APIエラー: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setSummary(data)
        setSummaryLoading(false)
      })
      .catch((err) => {
        setSummaryError(err.message)
        setSummaryLoading(false)
      })
  }

  const fetchRuns = (date = '') => {
    const url = date
      ? `${API_BASE}/api/runs?date=${date}`
      : `${API_BASE}/api/runs`
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`APIエラー: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setRuns(data.runs)
        setRunsLoading(false)
      })
      .catch((err) => {
        setRunsError(err.message)
        setRunsLoading(false)
      })
  }

  const fetchErrors = () => {
    fetch(`${API_BASE}/api/errors`)
      .then((res) => {
        if (!res.ok) throw new Error(`APIエラー: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setErrors(data.errors)
        setErrorsLoading(false)
      })
      .catch(() => {
        setErrorsLoading(false)
      })
  }

  const refreshAll = () => {
    fetchResults()
    fetchSummary()
    fetchRuns(searchDateRef.current)
    fetchErrors()
  }

  // 初回読み込み + 5秒ごとの自動更新
  useEffect(() => {
    refreshAll()
    const timer = setInterval(refreshAll, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  const handleSearch = () => {
    fetchRuns(searchDate)
  }

  const handleReset = () => {
    setSearchDate('')
    fetchRuns()
  }

  const categoryCount = summary ? summary.by_category.length : 0
  const dailyCount = summary ? summary.by_date.length : 0
  const historyCount = runs.length
  const errorCount = errors.length

  return (
    <div className="app">
      <h1 className="app-title">バッチ処理ダッシュボード</h1>

      <div className="layout">
        <aside className="sidebar">
          <div
            className={`nav-card ${currentView === 'category' ? 'active' : ''}`}
            onClick={() => setCurrentView('category')}
          >
            <h2>
              カテゴリー別 <span className="count">({categoryCount})</span>
            </h2>
            <span className="arrow">›</span>
          </div>

          <div
            className={`nav-card ${currentView === 'daily' ? 'active' : ''}`}
            onClick={() => setCurrentView('daily')}
          >
            <h2>
              日別 <span className="count">({dailyCount})</span>
            </h2>
            <span className="arrow">›</span>
          </div>

          <div
            className={`nav-card ${currentView === 'history' ? 'active' : ''}`}
            onClick={() => setCurrentView('history')}
          >
            <h2>
              実行履歴 <span className="count">({historyCount})</span>
            </h2>
            <span className="arrow">›</span>
          </div>

          <div
            className={`nav-card ${currentView === 'errors' ? 'active' : ''}`}
            onClick={() => setCurrentView('errors')}
          >
            <h2>
              エラー <span className="count">({errorCount})</span>
            </h2>
            <span className="arrow">›</span>
          </div>
        </aside>

        <main className="main">
          {currentView === 'home' && (
            <div className="view">
              <h1>バッチ処理結果</h1>
              {resultsLoading && <p>読み込み中...</p>}
              {resultsError && <p className="error">エラー: {resultsError}</p>}
              {!resultsLoading && !resultsError && (
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>date</th>
                      <th>name</th>
                      <th>category</th>
                      <th>amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <tr key={index}>
                        <td>{record.date}</td>
                        <td>{record.name}</td>
                        <td>{record.category}</td>
                        <td>{record.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {currentView === 'category' && (
            <div className="view">
              <span className="back-link" onClick={() => setCurrentView('home')}>
                ← バッチ処理結果に戻る
              </span>
              <h1>カテゴリー別 一覧</h1>
              {summaryLoading && <p>読み込み中...</p>}
              {summaryError && <p className="error">エラー: {summaryError}</p>}
              {!summaryLoading && !summaryError && summary && (
                <ul className="num-list">
                  {summary.by_category.map((row, index) => (
                    <li key={row.category}>
                      <span className="idx">{index + 1}.</span>
                      {row.category} ¥{row.total_amount}({row.count}件)
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {currentView === 'daily' && (
            <div className="view">
              <span className="back-link" onClick={() => setCurrentView('home')}>
                ← バッチ処理結果に戻る
              </span>
              <h1>日別 一覧</h1>
              {summaryLoading && <p>読み込み中...</p>}
              {summaryError && <p className="error">エラー: {summaryError}</p>}
              {!summaryLoading && !summaryError && summary && (
                <ul className="num-list">
                  {summary.by_date.map((row, index) => (
                    <li key={row.date}>
                      <span className="idx">{index + 1}.</span>
                      {row.date} ¥{row.total_amount}({row.count}件)
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {currentView === 'history' && (
            <div className="view">
              <span className="back-link" onClick={() => setCurrentView('home')}>
                ← バッチ処理結果に戻る
              </span>
              <h1>実行履歴 一覧</h1>

              <div className="search-bar">
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
                <button onClick={handleSearch}>検索</button>
                <button onClick={handleReset}>リセット</button>
              </div>

              {runsLoading && <p>読み込み中...</p>}
              {runsError && <p className="error">エラー: {runsError}</p>}
              {!runsLoading &&
                !runsError &&
                runs.map((run, index) => (
                  <details className="row" key={run.id}>
                    <summary>
                      <span className="idx">{index + 1}.</span>
                      {run.run_at}
                      <span className={`badge ${run.status === 'success' ? '' : 'err'}`}>
                        {run.status === 'success' ? '正常' : '一部エラー'}
                      </span>
                    </summary>
                    <div className="detail-body">
                      成功{run.success_count}件 / エラー{run.error_count}件
                    </div>
                  </details>
                ))}
            </div>
          )}

          {currentView === 'errors' && (
            <div className="view">
              <span className="back-link" onClick={() => setCurrentView('home')}>
                ← バッチ処理結果に戻る
              </span>
              <h1>エラー 一覧</h1>

              {errorsLoading && <p>読み込み中...</p>}
              {!errorsLoading && errors.length === 0 && <p>エラーはありません</p>}
              {!errorsLoading &&
                errors.map((err, index) => (
                  <details className="row" key={index}>
                    <summary>
                      <span className="idx">{index + 1}.</span>
                      {err.run_at}
                    </summary>
                    <div className="detail-body">
                      理由: {err.reason}
                      <br />
                      データ: {JSON.stringify(err.record)}
                    </div>
                  </details>
                ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
