import axios from 'axios'
import { useState, useEffect } from 'react'


function App() {

  const [datos, setDatos] = useState([])
  const [facturas, setFacturas] = useState([])
  

  const obtenerDatos = () => {
    axios.get('http://127.0.0.1:8000/api/datos/')
      .then(response => {
        setDatos(response.data)
        console.log(response.data)
      })
  }

  const obtenerFacturas = () => {
    axios.get('http://127.0.0.1:8000/api/facturas/')
      .then(response => {
        setFacturas(response.data.mensaje)
      })
  }

  useEffect(() => {
    obtenerDatos()
    
  }, [])
  console.log('Datos obtenidos:', datos)
  
 

  return (
    
    <div className='font-bold'>
      {datos.map((dato, index) => (
        <div key={index}>{dato.mensaje}</div>
      ))
      }
    </div>
  )
}

export default App
