import { useContext } from "react"
import { SearchContext } from "../context/SearchContext"

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error("useSearch debe usarse dentro de SearchProvider")
  }
  return context
}