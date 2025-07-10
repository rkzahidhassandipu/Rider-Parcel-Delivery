import { createBrowserRouter } from "react-router";
import Home from "../pages/Home/Home";
import { Component } from "react";
import MainLayout from "../Layout/MainLayout/MainLayout";
import About from "../pages/About/About";
import AuthLayout from "../Layout/MainLayout/AuthLayout/AuthLayout";
import Login from "../pages/Authentication/Login/Login";
import Register from "../pages/Authentication/Register/Register";
import Coverage from "../pages/Coverage/Coverage/Coverage";
import SendParcel from "../pages/sendParcel/SendParcel";
import PrivateRouter from "./PrivateRouter";
import DashboardLayout from "../Layout/DashboardLayout/DashboardLayout";
import MyParcels from "../pages/Dashboard/MyParcels/MyParcels";
import Payment from "../pages/Dashboard/Payment/Payment";
import PaymentHistory from "../pages/Dashboard/PaymentHistory/PaymentHistory";
import BeARider from "../pages/Dashboard/BeARider/BeARider";
import RidersActive from "../pages/Dashboard/RidersActive/RidersActive";
import PendingRiders from "../pages/Dashboard/BeARider/PendingRiders";
import ManageAdmins from "../pages/Dashboard/ManageAdmins/ManageAdmins";
import Forbidden from "../pages/Forbidden/Forbidden";
import AdminRoute from "./AdminRoute";
import AssignRider from "../pages/Dashboard/AssignRider/AssignRider";
import RiderRoute from "./RiderRoute";
import PendingDelivery from "../pages/Dashboard/PendingDelivery/PendingDelivery";
import CompleteDelivered from "../pages/Dashboard/CompleteDelivered/CompleteDelivered";
import Wallet from "../pages/Dashboard/wallet/Wallet";
import ParcelStatusTimeline from "../pages/Dashboard/ParcelStatusTimeline/ParcelStatusTimeline";
import DashboardHome from "../pages/Dashboard/DashboardHome/DashboardHome";
import StatusSummary from "../pages/Dashboard/StatusSummary/StatusSummary";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Home },
      { path: "/about", Component: About },
      { path: "/coverage", Component: Coverage },
      {
        path: "beARider",
        element: <PrivateRouter><BeARider /></PrivateRouter>,
        loader: () => fetch('/warehouses.json')
      },
      {
        path: "/sendparcel",
        element: (
          <PrivateRouter>
            <SendParcel />
          </PrivateRouter>
        ),
      },
    ],
  },
  {
    path: "/",
    element: <AuthLayout />, // ✅ use JSX
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
     
      {
        path: "forbidden",
        element: <Forbidden />
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRouter>
        <DashboardLayout />
      </PrivateRouter>
    ),
    children: [
      {
        index: true,
        Component: DashboardHome,
      },
      {
        path: "myparcels",
        Component: MyParcels,
      },
      {
        path: "payment/:parcelId",
        Component: Payment,
      },
      {
        path: "paymentHistory",
        Component: PaymentHistory,
      },
       {
        path: "StatusSummary",
        element: <StatusSummary />
      },
      {
        path: "track",
        Component: Payment,
      },
      {
        path: "profile",
        Component: Payment,
      },
      {
        path: "parcelTracking",
        Component: ParcelStatusTimeline,
      },
      {
        path: 'assign-rider',
        element: <AdminRoute>
          <AssignRider />
        </AdminRoute>
      },
      {
        path: "riders/active",
        element: <AdminRoute>
          <RidersActive />
        </AdminRoute>
      },
      {
        path: "pendingDelivery",
        element: <RiderRoute>
          <PendingDelivery />
        </RiderRoute>
      },
      {
        path: "CompleteDelivered",
        element: <RiderRoute>
          <CompleteDelivered />
        </RiderRoute>
      },
      {
        path: "wallet",
        element: <RiderRoute>
          <Wallet />
        </RiderRoute>
      },
      {
        path: "riders/pending",
        element: <AdminRoute>
          <PendingRiders />
        </AdminRoute>
      },
      {
        path: "manageAdmins",
        element: <AdminRoute>
          <ManageAdmins />
        </AdminRoute>
      },
    ],
  },
]);
