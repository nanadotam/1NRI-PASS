"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"

export interface AttendeeData {
  id: string
  fullName: string
  phone: string
  email: string
  hearAbout: string
  timestamp: string
  passColor?: "green" | "dark-green" | "dark-purple"
}

interface TicketingState {
  currentAttendee: AttendeeData | null
  isLoading: boolean
}

type TicketingAction =
  | { type: "SET_CURRENT_ATTENDEE"; payload: AttendeeData }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "CLEAR_CURRENT_ATTENDEE" }

const initialState: TicketingState = {
  currentAttendee: null,
  isLoading: false,
}

const ticketingReducer = (state: TicketingState, action: TicketingAction): TicketingState => {
  switch (action.type) {
    case "SET_CURRENT_ATTENDEE":
      return { ...state, currentAttendee: action.payload }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "CLEAR_CURRENT_ATTENDEE":
      return { ...state, currentAttendee: null }
    default:
      return state
  }
}

const TicketingContext = createContext<{
  state: TicketingState
  dispatch: React.Dispatch<TicketingAction>
  submitToBackend: (data: AttendeeData) => Promise<void>
} | null>(null)

export const TicketingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(ticketingReducer, initialState)

  const submitToBackend = async (data: AttendeeData) => {
    try {
      // This is where you'll integrate with your backend
      const response = await fetch("/api/attendees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to submit data")
      }

      console.log("Data submitted successfully:", data)
    } catch (error) {
      console.error("Error submitting to backend:", error)
      // For now, we'll continue without backend
    }
  }

  return <TicketingContext.Provider value={{ state, dispatch, submitToBackend }}>{children}</TicketingContext.Provider>
}

export const useTicketing = () => {
  const context = useContext(TicketingContext)
  if (!context) {
    throw new Error("useTicketing must be used within a TicketingProvider")
  }
  return context
}
