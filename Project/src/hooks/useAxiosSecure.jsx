import axios from 'axios'
import React from 'react'
import useAuth from './useAuth'
import { useNavigate } from 'react-router'
import { getToken } from '../Context/AuthContext/AuthProvider'


const axiosSecure = axios.create({
    baseURL: `https://parcel-server-navy.vercel.app/`,
    withCredentials: true
})

const useAxiosSecure = () => {
  const {logOut} = useAuth();
  const navigate = useNavigate()
  const token = getToken();
  axiosSecure.interceptors.request.use(config => {
    config.headers.Authorization = `Bearer ${token}`
    return config
  }, error => {
    return Promise.reject(error)
  })

  axiosSecure.interceptors.response.use(res => {
    return res;
  }, error => {
    console.log("inside res interceptor",error);
    const status = error.status;
    if(status === 403){
      navigate('/forbidden')
    }
    else if(status === 401){
      logOut()
      .then(() => {
        navigate("/")
      })
    }
    return Promise.reject(error)
  })
  return axiosSecure
}

export default useAxiosSecure
