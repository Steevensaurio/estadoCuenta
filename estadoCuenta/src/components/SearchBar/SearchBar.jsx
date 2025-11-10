import { Search} from "lucide-react"
import { useSearch } from "../../hooks/useSearch"

const SearchBar = () => {

    const { searchTerm, setSearchTerm } = useSearch()

    return(
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Busca por número de factura o nombre del cliente..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-600 transition-all text-gray-900 placeholder-gray-500 shadow-sm hover:border-gray-300"
            />
          </div>
        </div>
    )
}

export default SearchBar