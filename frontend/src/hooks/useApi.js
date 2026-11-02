// Custom hooks for API calls with loading/error state management
import { useState, useEffect, useCallback } from 'react'

export function useApi(apiCall, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiCall()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}

export function useMutation(apiCall) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const mutate = useCallback(async (payload) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiCall(payload)
      setData(result)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  const reset = () => { setData(null); setError(null) }

  return { mutate, loading, error, data, reset }
}
