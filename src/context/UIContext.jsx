import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const UIContext = createContext(null)

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTask, setModalTask] = useState(null)
  const [focusTask, setFocusTask] = useState(null)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [eventModalDate, setEventModalDate] = useState(null)
  const [eventModalEvent, setEventModalEvent] = useState(null)

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

  const openEventModal = useCallback((dateISO = null, event = null) => {
    setEventModalDate(dateISO)
    setEventModalEvent(event)
    setEventModalOpen(true)
  }, [])

  const closeEventModal = useCallback(() => {
    setEventModalOpen(false)
    setEventModalDate(null)
    setEventModalEvent(null)
  }, [])

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
      eventModalOpen,
      eventModalDate,
      eventModalEvent,
      openEventModal,
      closeEventModal,
    }),
    [toasts, toast, modalOpen, modalTask, focusTask, forgotOpen, eventModalOpen, eventModalDate, eventModalEvent]
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
  return useContext(UIContext)
}
