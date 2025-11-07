import axios from 'axios'
import React, { useState, useEffect } from 'react'


function App() {

  const [datos, setDatos] = useState([])
  const [facturas, setFacturas] = useState([])
  const [cliente, setCliente] = useState([])
  

  const obtenerDatos = () => {
    axios.get('http://127.0.0.1:8000/api/datos/')
      .then(response => {
        setDatos(response.data)
        console.log(response.data)
      })
  }

  const obtenerApuntes = () => {
    axios.get('http://127.0.0.1:8000/api/apuntes/')
      .then(response => {
        setFacturas(response.data)
      })
  }

  const facturasAgrupadas = facturas.reduce((acc, factura) => {
    const key = factura.move_name; // número de factura
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(factura);
    return acc;
  }, {});

  useEffect(() => {
    obtenerDatos()
    obtenerApuntes()
    
  }, [])
  

 

  return (
    
    <div className='flex font-bold'>
      <nav className="fixed top-0 left-0 right-0 bg-slate-900 shadow-md z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="text-lg sm:text-xl font-bold text-white">
              <span className='text-blue-500'>Estado de  </span>Cuenta
            </div>

          </div>
        </div>
      </nav>

      <div className="pt-24 flex justify-center">
        <div className="relative">
          <input
            placeholder="Buscar factura..."
            className="shadow-lg border border-gray-300 px-5 py-3 rounded-xl w-56 transition-all focus:w-64 focus:border-blue-400 outline-none"
            name="search"
            type="search"
            onChange={(e) => setCliente(e.target.value)}
          />
          <svg
            className="w-6 h-6 absolute top-3 right-3 text-gray-500"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              strokeLinejoin="round"
              strokeLinecap="round"
            ></path>
          </svg>
        </div>
      </div>

      <div className="pt-24 flex justify-center">{cliente}</div>
  

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-10">
        <table className="min-w-full border-collapse border border-gray-400 bg-white shadow-md rounded-2xl">
          <thead>
            <tr>
              <td># Factura</td>
              <td>Fecha de Emisión</td>
              <td>Nombre del Cliente</td>
              <td>Cuotas</td>
              <td>Fecha máxima de pago</td>
              <td>Valor de cuota</td>
              <td>Abono</td>
              <td>Saldo</td>
              <td>Dias de Vencimiento</td>
            </tr>
          </thead> 
          <tbody>
          {Object.entries(facturasAgrupadas).map(([numeroFactura, registros]) => {
            // Calcular total por factura
            const total = registros.reduce((suma, f) => {
              // limpiar el valor por si viene como texto "$ 123,45"
              const valor = parseFloat(
                String(f.balance).replace(/[^\d.-]/g, "")
              );
              return suma + (isNaN(valor) ? 0 : valor);
            }, 0);

            return (
              <React.Fragment key={numeroFactura}>
                <tr className="bg-blue-100 font-semibold">
                  <td className="border border-gray-400 px-2 py-1" colSpan="9">
                    Factura: {numeroFactura}
                  </td>
                </tr>
                {registros.map((dato, index) => (
                  <tr key={index}>
                    <td className="border border-gray-400 px-2 py-1">{dato.move_name}</td>
                    <td className="border border-gray-400 px-2 py-1">{dato.date}</td>
                    <td className="border border-gray-400 px-2 py-1">
                      {dato.partner_id[1]}
                    </td>
                    <td className="border border-gray-400 px-2 py-1 text-right">
                      {index+1}
                    </td>
                    <td className="border border-gray-400 px-2 py-1 text-right">
                      {dato.date_maturity}
                    </td>
                    <td className="border border-gray-400 px-2 py-1 text-right">
                      {dato.balance}
                    </td>
                    <td className="border border-gray-400 px-2 py-1 text-right">
                    
                    </td>
                    <td className="border border-gray-400 px-2 py-1 text-right">
                    
                    </td>
                    <td className="border border-gray-400 px-2 py-1 text-right">
                      {(() => {
                        const fechaDato = new Date(dato.date_maturity)
                        const hoy = new Date()

                        // Quitar horas para que el cálculo sea exacto al día
                        fechaDato.setHours(0, 0, 0, 0)
                        hoy.setHours(0, 0, 0, 0)

                        // Diferencia en milisegundos -> convertir a días
                        const diffMs = hoy - fechaDato
                        const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

                        return diffDias < 0 ? 0 : diffDias
                      })()}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td className="border border-gray-400 px-2 py-1 text-right" colSpan="5">
                    Total:
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-right">
                    ${total.toFixed(2)}
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
          {/* <tbody>
            {facturas.map((dato, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">
                  {Array.isArray(dato.partner_id) ? dato.partner_id[1] : dato.partner_id}
                </td>
                <td className="px-4 py-2">{dato.name}</td>
                <td className="px-4 py-2">{dato.date_maturity}</td>
                <td className="px-4 py-2 text-right">{dato.balance}</td>
              </tr>
            ))}

          </tbody> */}
        </table>
      </div>
    </div>
  )
}

export default App
