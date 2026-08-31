import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const UIContext = createContext(null)

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTask, setModalTask] = useState(null)
  const [focusTask, setFocusTask] = useState(null)
  const [forgotOpen, setForgotOpen] = useState(false)

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 6)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2600)
  }, [])

  const openTaskModal = useCallback((task = null) => {
    setModalTask(task)
    setModalOpen(true)
  }, [])

  const closeTaskModal = useCallback(() => {
    setModalOpen(false)
    setModalTask(null)
  }, [])

  const openForgot = useCallback(() => setForgotOpen(true), [])
  const closeForgot = useCallback(() => setForgotOpen(false), [])

  const value = useMemo(
    () => ({
      toasts,
      toast,
      modalOpen,
      modalTask,
      openTaskModal,
      closeTaskModal,
      focusTask,
      setFocusTask,
      forgotOpen,
      openForgot,
      closeForgot,
    }),
    [toasts, toast, modalOpen, modalTask, focusTask, forgotOpen]
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
  return useContext(UIContext)
}
