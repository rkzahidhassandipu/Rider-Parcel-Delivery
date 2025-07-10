import React from 'react'
import useUserRole from '../../../hooks/useUserRole'
import Loading from '../../../Component/Loading/Loading'
import DashboardUser from './DashboardUser'
import DashboardRider from './DashboardRider'
import DashboardAdmin from './DashboardAdmin'

const DashboardHome = () => {
    const {role, roleLoading} = useUserRole()
  if(roleLoading){
    return <Loading />
  }
  if(role === 'user'){
    return <DashboardUser />
  }
  if(role === 'rider'){
    return <DashboardRider/>
  }
  if(role === 'admin'){
    return <DashboardAdmin />
  }
}

export default DashboardHome
