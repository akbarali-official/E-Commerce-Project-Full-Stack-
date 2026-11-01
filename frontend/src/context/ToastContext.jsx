import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastCtx = createContext(null)
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timer = useRef()
  const show = useCallback((message, type = 'ok') => {
    clearTimeout(timer.current)
    setToast({ message, type })
    timer.current = setTimeout(() => setToast(null), 2800)
  }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </ToastCtx.Provider>
  )
}
