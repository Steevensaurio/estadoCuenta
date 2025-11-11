import React from "react";

const NavBar = () =>{
    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg italic">A</span>
                </div>
                <div>
                <h1 className="text-xl font-bold text-gray-900">Estados de Cuenta</h1>
                <p className="text-xs text-gray-500">Impor Export Aromotor Cia Ltda</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Dashboard</p>
                <p className="text-xs text-gray-500">Control total</p>
            </div>
            </div>
        </nav>
    )
}

export default NavBar
