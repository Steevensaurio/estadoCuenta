import { useState, useMemo, useEffect } from "react"
import { Search} from "lucide-react"
import { useSearch } from "../../hooks/useSearch"


const Table = ({data}) => {

    const cxc = data
    const { searchTerm, setSearchTerm, isLoading, setIsLoading } = useSearch()
    
    const groupedData = useMemo(() => {
        if (searchTerm === "") {
        return cxc
        }
        return cxc.filter(
        (item) =>
            item.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.facturas.some((f) => f.numero.toLowerCase().includes(searchTerm.toLowerCase())),
        )
    }, [searchTerm])

    const stats = useMemo(() => {
        let totalBalance = 0
        let totalPaid = 0
        let overdueCount = 0
        let totalInvoices = 0

        cxc.forEach((item) => {
        item.facturas.forEach((factura) => {
            totalInvoices++
            totalBalance += factura.pendiente || 0
            factura.cuotas.forEach((cuota) => {
            totalPaid += cuota.credit || 0
            const vencimiento = new Date(cuota.vencimiento)
            const hoy = new Date()
            const diasDiferencia = Math.floor((vencimiento - hoy) / (1000 * 60 * 60 * 24))
            if (diasDiferencia < 0) overdueCount++
            })
        })
        })

        return {
        totalBalance: totalBalance.toFixed(2),
        totalPaid: totalPaid.toFixed(2),
        overdueCount,
        totalInvoices,
        }
    }, [cxc])

    const getDaysOverdue = (vencimiento) => {
        const vencimientoDate = new Date(vencimiento)
        const hoy = new Date()
        return Math.floor((vencimientoDate - hoy) / (1000 * 60 * 60 * 24))
    }

    const getStatusColor = (daysOverdue) => {
        if (daysOverdue < 0) return "text-red-600 font-bold"
        if (daysOverdue === 0) return "text-amber-600 font-bold"
        return "text-emerald-600 font-bold"
    }

    const getStatusText = (daysOverdue) => {
        if (daysOverdue < 0) return "Vencido"
        if (daysOverdue === 0) return "Vence Hoy"
        return "Al Día"
    }

    const getStatusBgColor = (daysOverdue) => {
        if (daysOverdue < 0) return "bg-red-100 border-red-300"
        if (daysOverdue === 0) return "bg-amber-100 border-amber-300"
        return "bg-emerald-100 border-emerald-300"
    }


    if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="sticky top-0 z-50 bg-black border-b-2 border-red-600">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-red-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Gestión de Facturas</h1>
                <p className="text-xs text-red-400">Control de Invoices</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-white">Dashboard</p>
              <p className="text-xs text-red-400">v1.0</p>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="h-96 flex flex-col items-center justify-center">
            <div className="relative mb-8">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-red-600 border-r-red-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cargando facturas...</h3>
            <p className="text-gray-600">Conectando con el servidor</p>
          </div>
        </main>
      </div>
    )
  }

    

    return(
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                    # Factura
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Fecha de Emisión
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Nombre del Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Cuotas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Fecha máxima
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Valor cuota
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Abono</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Saldo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Estado
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
                <tbody className="divide-y divide-gray-200">
                    {groupedData.length > 0 ? (
                    groupedData.flatMap((clienteData) => {
                        const clientRows = []

                        // Add cliente header row
                        clientRows.push(
                        <tr
                            key={`client-${clienteData.cliente}`}
                            className="bg-gray-50 hover:bg-red-50 transition-colors"
                        >
                            <td colSpan="9" className="px-6 py-4">
                            <span className="text-sm font-bold text-gray-900 uppercase">{clienteData.cliente}</span>
                            <span className="text-xs text-gray-500 font-semibold ml-3">
                                ({clienteData.facturas.length} factura
                                {clienteData.facturas.length !== 1 ? "s" : ""})
                            </span>
                            </td>
                        </tr>,
                        )

                        // Add factura and cuota rows always visible
                        clienteData.facturas.forEach((factura) => {
                        // Factura row
                        clientRows.push(
                            <tr key={`factura-${factura.id}`} className="bg-gray-100 hover:bg-red-100 transition-colors">
                            <td className="px-6 py-3 pl-16">
                                <span className="text-sm font-semibold text-red-600">#{factura.numero}</span>
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-700">{factura.fecha}</td>
                            <td colSpan="7" className="px-6 py-3 text-sm text-gray-600">
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-semibold border border-red-200">
                                Total: ${factura.total.toFixed(2)} • Cuotas: {factura.cuotas.length}
                                </span>
                            </td>
                            </tr>,
                        )

                        // Cuota rows
                        factura.cuotas.forEach((cuota, index) => {
                            const daysOverdue = getDaysOverdue(cuota.vencimiento)
                            const statusText = getStatusText(daysOverdue)
                            const statusBgColor = getStatusBgColor(daysOverdue)
                            clientRows.push(
                            <tr key={`cuota-${factura.id}-${index}`} className="hover:bg-red-50 transition-colors group">
                                <td className="px-6 py-3 pl-32 text-sm font-medium text-gray-700">Cuota {index + 1}</td>
                                <td className="px-6 py-3 text-sm text-gray-700">-</td>
                                <td className="px-6 py-3 text-sm text-gray-600">{cuota.descripcion}</td>
                                <td className="px-6 py-3 text-sm text-gray-700">{cuota.vencimiento}</td>
                                <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                                ${cuota.debit?.toFixed(2) || "0.00"}
                                </td>
                                <td className="px-6 py-3 text-sm font-bold text-emerald-600">
                                ${cuota.credit?.toFixed(2) || "0.00"}
                                </td>
                                <td className="px-6 py-3 text-sm font-bold text-gray-900">
                                ${cuota.residual?.toFixed(2) || "0.00"}
                                </td>
                                <td className={`px-6 py-3 text-sm ${getStatusColor(daysOverdue)}`}>{daysOverdue} días</td>
                                <td className="px-6 py-3 text-sm">
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${statusBgColor} ${getStatusColor(daysOverdue)}`}
                                >
                                    {statusText}
                                </span>
                                </td>
                            </tr>,
                            )
                        })
                        })

                        return clientRows
                    })
                    ) : (
                    <tr>
                        <td colSpan="9" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <Search className="w-8 h-8 text-gray-300" />
                            <p className="text-gray-600 font-semibold">No se encontraron facturas</p>
                            <p className="text-gray-400 text-sm">Intenta otro término de búsqueda</p>
                        </div>
                        </td>
                    </tr>
                    )}
                </tbody>
            </table>
          </div>
        </div>

    )
}

export default Table