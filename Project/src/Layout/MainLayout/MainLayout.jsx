import React from 'react'
import { Outlet } from 'react-router'
import Navbar from '../../pages/Shared/Navbar/Navbar'
import Footer from '../../pages/Shared/Footer/Footer'

const MainLayout = () => {
  return (
    <div className='mx-auto w-4/5 pt-6'>
        <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
