import React from "react";
import { Link, NavLink, Outlet } from "react-router";
import Logo from "../../Component/Logo/Logo";
import {
  FaHome,
  FaBox,
  FaHistory,
  FaUserEdit,
  FaUserCheck,
  FaUserClock,
  FaTasks,
  FaCheckCircle,
  FaWallet,
} from "react-icons/fa";
import { MdAssignmentInd, MdOutlineTrackChanges } from "react-icons/md";
import useAuth from "../../hooks/useAuth";
import useUserRole from "../../hooks/useUserRole";

const DashboardLayout = () => {
  const { user } = useAuth();
  const { role, roleLoading } = useUserRole(user?.email);
  console.log(user.accessToken)

  if (roleLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

      {/* Page content */}
      <div className="drawer-content flex flex-col">
        <div className="flex-none lg:hidden">
          <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost m-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-6 h-6 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
        </div>
        <div className="p-4">
          <Outlet />
        </div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay" />
        <ul className="menu text-base-content font-medium min-h-full w-80 p-4 bg-gray-300 mt-10 lg:mt-0">
          <div className="bg-gray-400 rounded-xl px-4 py-2 mb-2">
            <Logo />
          </div>
          <li>
            <NavLink to="/dashboard" className="flex items-center gap-2">
              <FaHome /> Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/StatusSummary" className="flex items-center gap-2">
              <FaHome /> Status Summary
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/myparcels"
              className="flex items-center gap-2"
            >
              <FaBox /> My Parcels
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/parcelTracking"
              className="flex items-center gap-2"
            >
              <FaBox /> Parcel Tracking
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/paymentHistory"
              className="flex items-center gap-2"
            >
              <FaHistory /> Payment History
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/track" className="flex items-center gap-2">
              <MdOutlineTrackChanges /> Track a Package
            </NavLink>
          </li>
          {/* <li>
            <NavLink
              to="/dashboard/PendingDelivery"
              className="flex items-center gap-2"
            >
              <FaUserEdit /> Pending Delivery
            </NavLink>
          </li> */}

          {role === "rider" && !roleLoading && (
            <>
              <li>
                <NavLink
                  to="/dashboard/pendingDelivery"
                  className="flex items-center gap-2"
                >
                  <FaTasks /> Rider Pending Delivery
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/dashboard/CompleteDelivered"
                  className="flex items-center gap-2"
                >
                  <FaCheckCircle /> Complete-Delivered
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/dashboard/wallet"
                  className="flex items-center gap-2"
                >
                  <FaWallet /> Wallet
                </NavLink>
              </li>
            </>
          )}

          {/* 🚴 Admin Section - only show if role === 'admin' */}
          {role === "admin" && !roleLoading && (
            <>
              <li className="mt-4 border-t pt-4">
                <NavLink
                  to="/dashboard/riders/active"
                  className="flex items-center gap-2"
                >
                  <FaUserCheck /> Rider Active
                </NavLink>
              </li>
              <li className="mt-4 border-t pt-4">
                <NavLink
                  to="/dashboard/assign-rider"
                  className="flex items-center gap-2"
                >
                  <MdAssignmentInd /> Assign Riders
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/dashboard/riders/pending"
                  className="flex items-center gap-2"
                >
                  <FaUserClock /> Rider Pending
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/dashboard/manageAdmins"
                  className="flex items-center gap-2"
                >
                  Manage Admins
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DashboardLayout;
