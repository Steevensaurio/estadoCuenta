import axios from 'axios'
import React, { useState, useEffect } from 'react'
import NavBar from './components/NavBar/NavBar'
import Table from './components/Table/Table'
import Footer from './components/Footer/Footer'
import SearchBar from './components/SearchBar/SearchBar'
import { useSearch } from './hooks/useSearch'


function App() {

  const apiUrl = import.meta.env.VITE_API_URL;
  const {setIsLoading, clientes, setClientes} = useSearch()

  const obtener_estado_cuenta = async () => {
    try {
      setIsLoading(true) // empieza el loading
      const response = await axios.get(`${apiUrl}obtener-cxc/`)
      setClientes(response.data)
      console.log(response.data)
    } catch (error) {
      console.error("Error al obtener datos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const consultar = async (term, termVendedor, emisionDesde, emisionHasta, venciDesde, venciHasta) => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${apiUrl}obtener-cxc/?cliente=${term}&comercial=${termVendedor}&emision_desde=${emisionDesde}&emision_hasta=${emisionHasta}&vencimiento_desde=${venciDesde}&vencimiento_hasta=${venciHasta}`, {})
      setClientes(response.data)
      console.log(response.data)
    } catch (error) {
      console.error("Error al obtener datos:", error)
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    obtener_estado_cuenta()
  }, [])


  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

        <NavBar/>
        <main className="max-w-full mx-auto px-6 py-8">
          <SearchBar consultar={consultar}/>
          <Table data={clientes} />
          <Footer/>
        </main>
        

    </div>
    
  )
}

export default App
