import { createContext, useState } from "react"

export const SearchContext = createContext()

export function SearchProvider({ children }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm, isLoading, setIsLoading }}>
      {children}
    </SearchContext.Provider>
  )
}

