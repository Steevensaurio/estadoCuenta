import { useState, useMemo, useEffect } from "react"
import { Search } from "lucide-react"
import { useSearch } from "../../hooks/useSearch"

const Table = ({data}) => {
    const cxc = data
    const {isLoading} = useSearch()
    
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

    
  const getStatusColor = (daysOverdue, residual) => {
    if (residual === 0) return "text-emerald-600 font-bold"
    if (daysOverdue < 0) return "text-red-600 font-bold"
    if (daysOverdue === 0) return "text-amber-600 font-bold"
    return "text-emerald-600 font-bold"
  }

  const getStatusText = (daysOverdue, residual) => {
    if (residual === 0) return "Pagada"
    if (daysOverdue < 0) return "Vencido"
    if (daysOverdue === 0) return "Vence Hoy"
    return "Al Día"
  }

  const getStatusBgColor = (daysOverdue, residual) => {
    if (residual === 0) return "bg-emerald-100 border-emerald-300"
    if (daysOverdue < 0) return "bg-red-100 border-red-300"
    if (daysOverdue === 0) return "bg-amber-100 border-amber-300"
    return "bg-emerald-100 border-emerald-300"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="h-96 flex flex-col items-center justify-center">
            <div className="relative mb-8">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-red-600 border-r-red-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cargando estado de cuenta...</h3>
            <p className="text-gray-600">Conectando con el servidor</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide w-40">Factura</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide w-32">Fecha de Emisión</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide w-20">Cuotas</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide w-24">Fecha máxima</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide w-24">Valor cuota</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide w-20">Abono</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide w-20">Saldo</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide w-20">Cheques custodia</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide w-20">Valor Cheque</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide w-16">Días</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide w-20">Estado</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200">
            {cxc.length > 0 ? (
              cxc.flatMap((clienteData) => {
                const clientRows = []

                clientRows.push(
                  <tr key={`client-${clienteData.cliente}`} className="bg-gray-50 hover:bg-red-50 transition-colors">
                    <td colSpan="11" className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900 uppercase">{clienteData.cliente}</span>
                      <span className="text-xs text-gray-500 font-semibold ml-3">
                        ({clienteData.facturas.length} factura
                        {clienteData.facturas.length !== 1 ? "s" : ""})
                      </span>
                    </td>
                  </tr>,
                )

                clienteData.facturas.forEach((factura) => {
                  // Calcular totales para la fila de total
                  const totalAbono = factura.cuotas.reduce((sum, cuota) => sum + (cuota.debit - cuota.residual), 0).toFixed(2)
                  const totalSaldo = factura.cuotas.reduce((sum, cuota) => sum + cuota.residual, 0).toFixed(2)
                  const totalFactura = factura.total.toFixed(2)
                  const totalCuotas = factura.cuotas.reduce((sum, cuota) => sum + cuota.debit, 0).toFixed(2)
                  const totalChequesValor = factura.cheques && factura.cheques.length > 0 
                    ? factura.cheques.reduce((sum, cheque) => {
                        const facturaEnCheque = cheque.facturas.find(f => f.move_name === factura.numero);
                        return sum + (facturaEnCheque ? facturaEnCheque.amount_reconcile : 0);
                      }, 0).toFixed(2)
                    : "0.00"

                  clientRows.push(
                    <tr key={`factura-${factura.id}`} className="bg-gray-100 hover:bg-red-100 transition-colors">
                      <td className="px-6 py-3 text-sm font-bold text-gray-600 truncate">{factura.numero}</td>
                      <td className="px-6 py-3 text-xs font-bold text-gray-700">{factura.fecha}</td>
                      <td className="px-6 py-3 text-xs text-gray-700"></td>
                      <td className="px-6 py-3 text-sm text-gray-700"></td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900"></td>
                      <td className="px-6 py-3 text-sm font-bold text-emerald-600"></td>
                      <td className="px-6 py-3 text-sm font-bold text-gray-900"></td>
                      <td className="px-6 py-3 text-sm"></td>
                      <td className="px-6 py-3 text-sm"></td>
                      <td className="px-6 py-3 text-sm"></td>
                      <td className="px-6 py-3 text-sm"></td>
                    </tr>,
                  )
                  factura.cuotas.forEach((cuota, index) => {
                    const daysOverdue = getDaysOverdue(cuota.vencimiento)
                    const statusText = getStatusText(daysOverdue, cuota.residual)
                    const statusBgColor = getStatusBgColor(daysOverdue, cuota.residual)
                    clientRows.push(
                      <tr key={`cuota-${factura.id}-${index}`} className="group">
                        <td className="px-6 py-3 text-sm font-medium text-gray-700"></td>
                        <td className="px-6 py-3 text-sm text-gray-600"></td>
                        <td className="px-5 py-3 text-sm text-gray-700">Cuota {index + 1}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">{cuota.vencimiento}</td>
                        <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                          ${cuota.debit?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-6 py-3 text-sm font-semibold text-emerald-600">
                          ${(cuota.debit - cuota.residual).toFixed(2)}
                        </td>
                        <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                          ${cuota.residual?.toFixed(2) || "0.00"}
                        </td>
                        {index === 0 && (
                          <>
                            <td className="px-6 py-3 text-sm font-semibold text-gray-900" rowSpan={factura.cuotas.length}>
                              {factura.cheques && factura.cheques.length > 0 ? (
                                factura.cheques.map((cheque) => {
                                  const facturaEnCheque = cheque.facturas.find(f => f.move_name === factura.numero);
                                  if (facturaEnCheque) {
                                    return (
                                      <div key={cheque.id} className="mb-1">
                                        {cheque.ncheque}
                                      </div>
                                    );
                                  }
                                  return null;
                                })
                              ) : (
                                <span>No hay cheques</span>
                              )}
                            </td>
                            <td className="px-6 py-3 text-sm font-semibold text-gray-900" rowSpan={factura.cuotas.length}>
                              {factura.cheques && factura.cheques.length > 0 ? (
                                factura.cheques.map((cheque) => {
                                  const facturaEnCheque = cheque.facturas.find(f => f.move_name === factura.numero);
                                  if (facturaEnCheque) {
                                    return (
                                      <div key={cheque.id} className="mb-1">
                                        ${facturaEnCheque.amount_reconcile.toFixed(2)}
                                      </div>
                                    );
                                  }
                                  return null;
                                })
                              ) : (
                                <span></span>
                              )}
                            </td>
                          </>
                        )}
                        <td className={`px-6 py-3 text-sm ${getStatusColor(daysOverdue, cuota.residual)}`}>
                          {cuota.residual === 0 ? "0 días" : `${daysOverdue} días`}
                        </td>
                        <td className="px-6 py-3 text-sm">
                          {cuota.residual === 0 ? (
                            <span className="inline-flex items-center justify-center px-3 py-1">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                                <linearGradient
                                  id="checkGradient"
                                  x1="9.858"
                                  x2="38.142"
                                  y1="9.858"
                                  y2="38.142"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop offset="0" stopColor="#9dffce" />
                                  <stop offset="1" stopColor="#50d18d" />
                                </linearGradient>
                                <path
                                  fill="url(#checkGradient)"
                                  d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"
                                />
                                <linearGradient
                                  id="checkGradient2"
                                  x1="13"
                                  x2="36"
                                  y1="24.793"
                                  y2="24.793"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop offset=".824" stopColor="#135d36" />
                                  <stop offset=".931" stopColor="#125933" />
                                  <stop offset="1" stopColor="#11522f" />
                                </linearGradient>
                                <path
                                  fill="url(#checkGradient2)"
                                  d="M21.293,32.707l-8-8c-0.391-0.391-0.391-1.024,0-1.414l1.414-1.414c0.391-0.391,1.024-0.391,1.414,0L22,27.758l10.879-10.879c0.391-0.391,1.024-0.391,1.414,0l1.414,1.414c0.391,0.391,0.391,1.024,0,1.414l-13,13C22.317,33.098,21.683,33.098,21.293,32.707z"
                                />
                              </svg>
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-bold border ${statusBgColor} ${getStatusColor(daysOverdue, cuota.residual)}`}
                            >
                              {statusText}
                            </span>
                          )}
                        </td>
                      </tr>,
                    )
                  })
                  // Nueva fila para totales después de las cuotas y cheques
                  clientRows.push(
                    <tr key={`total-${factura.id}`} className="bg-gray-200 font-bold">
                      <td colSpan="4" className="px-6 py-3 text-sm text-gray-900">Total</td>
                      <td className="px-6 py-3 text-sm font-bold text-gray-900">${totalCuotas}</td>
                      <td className="px-6 py-3 text-sm font-bold text-emerald-600">${totalAbono}</td>
                      <td className="px-6 py-3 text-sm font-bold text-gray-900">${totalSaldo}</td>
                      <td className="px-6 py-3 text-sm"></td>
                      <td className="px-6 py-3 text-sm font-bold text-gray-900">${totalChequesValor}</td>
                      <td className="px-6 py-3 text-sm"></td>
                      <td className="px-6 py-3 text-sm"></td>
                    </tr>,
                  )
                })

                return clientRows
              })
            ) : (
              <tr>
                <td colSpan="11" className="px-6 py-12 text-center">
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
