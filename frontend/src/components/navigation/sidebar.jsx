import { useState } from "react";
import logoSidebar from "../../assets/logoHeader.png";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { doSignOut } from "../../firebase/auth";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  PowerIcon,
  Bars3Icon,
  Cog8ToothIcon,
  UserGroupIcon,
  CreditCardIcon,
  ArchiveBoxIcon,
  ChevronDownIcon,
  CubeIcon,
  ClipboardDocumentIcon,
  ArchiveBoxArrowDownIcon,
  ArrowPathRoundedSquareIcon,
  PaperAirplaneIcon,
  ClipboardDocumentCheckIcon,
  BeakerIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  InboxStackIcon,
  ClockIcon,
  BuildingOffice2Icon,
  UsersIcon,
  VideoCameraIcon,
  TruckIcon,
  CpuChipIcon, // Added for Teleconsultation
  HeartIcon,
} from "@heroicons/react/24/outline";
import { Outlet } from "react-router-dom";
import { useAccessControl } from "../roles/accessControl";
import LogoutConfirmationModal from "./LogoutConfirmationModal";
import UserProfileDropdown from "./UserProfile";
import { useAuth } from "../../context/authContext/authContext";

const Sidebar = () => {
  const { department } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inventoryDropdownOpen, setInventoryDropdownOpen] = useState(false);
  const [historyDropdownOpen, setHistoryDropdownOpen] = useState(false);
  const [appoinmentsDropdownOpen, setAppointmentsDropdownOpen] =
    useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = useAccessControl();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [billingDropdownOpen, setBillingDropdownOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    doSignOut().then(() => {
      navigate("/signin");
    });
  };

  const closeModal = () => {
    setIsLogoutModalOpen(false);
  };

  const toggleInventoryDropdown = () => {
    setInventoryDropdownOpen(!inventoryDropdownOpen);
  };
  const toggleAppointmentsDropdown = () => {
    setAppointmentsDropdownOpen(!appoinmentsDropdownOpen);
  };

  const toggleHistoryDropdown = () => {
    setHistoryDropdownOpen(!historyDropdownOpen);
  };

  // Titles based on route paths
  const titles = {
    "/dashboard": "Overview",
    "/patients": "Patient Management",
    "/inventory": "Inventory Management",
    "/settings": "Settings",
    "/analytics": "Analytics",
    "/billing": "Billing List",
    "/inventory-history": "Inventory History",
    "/OverAllInventory": "Overall Inventory",
    "/stockTransfer": "CSR Department",
    "/requestStock": "ICU Department",
    "/med": "Pharmacy Department",
    "/ViewMedReq": "View Medicine Request",
    "/ViewRequest": "View Supply Request",
    "/Transfer": "Transfer Items",
    "/Transfer": "Transfer Items",
    "/transferMed": "Transfer Medicine",
    "/requestS": "Request Stock",
    "/PharmacyTransferHistory": "Transfer History",
    "/CsrTransferHistory": "Transfer History",
    "/InvetoryTransaction": "Transactions",
    "/PaidSection": "PaidSection",
    "/AdminConsult": "Consultation Appointments",
    "/AdminLab": "Laboratory",
    "/RequestLabTest": "Lab Test Request",
    "/SpecialistAppointments": "Specialist Referral",
    "/LabTestReport": "Lab Test Report",
    "/clinicInventory": "Clinic Inventory",
    "/InventoryTransaction": "Inventory Transactions",
    "/generate-medical-certificate": "Medical Certificate",
    "/change-password": "Change Password",
    "/doctor-profile": "Doctor Profile",
    "/user-profile": "User Profile",
    "/employee-attendance": "Employee Attendance & Salary",
    "/teleconsultation": "Teleconsultation", 
    "/user-management": "Users",
    "/supplier-management": "Suppliers",
    "/import-signature": "Create Doctor Signature",
    "/ai-assistant": "AI Assistant", // Added title for AI Assistant
    "/medical-services": "Medical Services Management",
  };

  let currentTitle = "Overview";

  if (titles[location.pathname]) {
    currentTitle = titles[location.pathname];
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-20 transition-opacity bg-black/50 backdrop-blur-sm lg:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-72 overflow-y-auto transition-all duration-300 transform bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-r border-slate-700/50 ${
          sidebarOpen ? "translate-x-0 ease-out" : "-translate-x-full ease-in"
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center py-6 px-4 border-b border-slate-700/50">
          <div className="relative">
            <img
              src={logoSidebar}
              alt="OdysSys"
              className="h-12 w-auto filter brightness-110"
            />
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-60" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-4 space-y-1">
          {/* Overview */}
          <Link
            to="/dashboard"
            className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
              isActive("/dashboard")
                ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
            }`}
          >
            <HomeIcon
              className={`w-5 h-5 mr-3 transition-colors ${
                isActive("/dashboard")
                  ? "text-blue-400"
                  : "text-slate-400 group-hover:text-blue-400"
              }`}
            />
            <span>Overview</span>
            {isActive("/dashboard") && (
              <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            )}
          </Link>

          <Link
            to="/ai-assistant"
            className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
              isActive("/ai-assistant")
                ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
            }`}
          >
            <CpuChipIcon
              className={`w-5 h-5 mr-3 transition-colors ${
                isActive("/ai-assistant")
                  ? "text-indigo-400"
                  : "text-slate-400 group-hover:text-indigo-400"
              }`}
            />
            <span>AI Assistant</span>
            {/* Add a "NEW" badge */}
            <span className="ml-auto bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              NEW
            </span>
            {isActive("/ai-assistant") && (
              <div className="ml-auto w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            )}
          </Link>

          {(department === "Doctor" ||
            department === "Admin" ||
            permissions?.accessPatients) && (
            <Link
              to="/teleconsultation"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive("/teleconsultation")
                  ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <VideoCameraIcon
                className={`w-5 h-5 mr-3 transition-colors ${
                  isActive("/teleconsultation")
                    ? "text-purple-400"
                    : "text-slate-400 group-hover:text-purple-400"
                }`}
              />
              <span>Teleconsultation</span>
              {isActive("/teleconsultation") && (
                <div className="ml-auto w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              )}
            </Link>
          )}

          {/* Inventory Dropdown */}
          {permissions?.accessInventory && (
            <div className="space-y-1">
              <div
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl cursor-pointer transition-all duration-200 ${
                  inventoryDropdownOpen
                    ? "bg-slate-800/60 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                } border border-transparent hover:border-slate-600/30`}
                onClick={toggleInventoryDropdown}
              >
                <CubeIcon className="w-5 h-5 mr-3 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                <span>Inventory</span>
                <ChevronDownIcon
                  className={`w-4 h-4 ml-auto transform transition-all duration-300 ${
                    inventoryDropdownOpen
                      ? "rotate-180 text-emerald-400"
                      : "text-slate-500"
                  }`}
                />
              </div>

              <div
                className={`ml-4 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
                  inventoryDropdownOpen
                    ? "max-h-96 opacity-100 mb-2"
                    : "max-h-0 opacity-0"
                }`}
              >
                <Link
                  to="/inventory"
                  className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                    isActive("/inventory")
                      ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="w-1.5 h-1.5 bg-current rounded-full mr-3" />
                  Referrence Items Referrence Items
                </Link>

                {permissions?.accessInventory && (
                  <Link
                    to="/clinicInventory"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                      isActive("/clinicInventory")
                        ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="w-1.5 h-1.5 bg-current rounded-full mr-3" />
                    Clinic Inventory
                  </Link>
                )}

                {permissions?.accessInventoryHistory && (
                  <Link
                    to="/InventoryTransaction"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                      isActive("/InventoryTransaction")
                        ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="w-1.5 h-1.5 bg-current rounded-full mr-3" />
                    Inventory Transactions
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Appointment Scheduling Dropdown */}
          {/* Transfer Supply */}
          {permissions?.accessTransferStocks && (
            <Link
              to="/Transfer"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive("/Transfer")
                  ? "bg-gradient-to-r from-orange-600/20 to-red-600/20 text-white border border-orange-500/30 shadow-lg shadow-orange-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <ArrowsRightLeftIcon
                className={`w-5 h-5 mr-3 transition-colors ${
                  isActive("/Transfer")
                    ? "text-orange-400"
                    : "text-slate-400 group-hover:text-orange-400"
                }`}
              />
              <span>Transfer Supply</span>
            </Link>
          )}

          {/* Patients */}
          {permissions?.accessPatients && (
            <Link
              to="/patients"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive("/patients")
                  ? "bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-white border border-violet-500/30 shadow-lg shadow-violet-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <UserGroupIcon
                className={`w-5 h-5 mr-3 transition-colors ${
                  isActive("/patients")
                    ? "text-violet-400"
                    : "text-slate-400 group-hover:text-violet-400"
                }`}
              />
              <span>Patient Management</span>
            </Link>
          )}


          {/* Pending Supply Request */}
          {/* {(department === "CSR" || department === "Admin") && (
            <Link
              to="ViewRequest"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive("/ViewRequest")
                  ? "bg-gradient-to-r from-amber-600/20 to-orange-600/20 text-white border border-amber-500/30 shadow-lg shadow-amber-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <ClockIcon
                className={`w-5 h-5 mr-3 transition-colors ${
                  isActive("/ViewRequest")
                    ? "text-amber-400"
                    : "text-slate-400 group-hover:text-amber-400"
                }`}
              />
              <span>Pending Supply Requests</span>
            </Link>
          )} */}

          {/* Employee Attendance & Salary System */}
           {(department === "Admin" || department === "HR" || permissions?.accessSettings) && (
            <Link
              to="/employee-attendance"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive("/employee-attendance")
                  ? "bg-gradient-to-r from-indigo-600/20 to-blue-600/20 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <UsersIcon
                className={`w-5 h-5 mr-3 transition-colors ${
                  isActive("/employee-attendance")
                    ? "text-indigo-400"
                    : "text-slate-400 group-hover:text-indigo-400"
                }`}
              />
              <span>Employee Attendance</span>
              {isActive("/employee-attendance") && (
                <div className="ml-auto w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
              )}
            </Link>
          )} 

          {permissions?.accessLaboratory && (
            <div className="space-y-1">
              <div
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl cursor-pointer transition-all duration-200 ${
                  appoinmentsDropdownOpen
                    ? "bg-slate-800/60 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                } border border-transparent hover:border-slate-600/30`}
                onClick={toggleAppointmentsDropdown}
              >
                <CalendarDaysIcon className="w-5 h-5 mr-3 text-slate-400 group-hover:text-purple-400 transition-colors" />
                <span>Appointments</span>
                <ChevronDownIcon
                  className={`w-4 h-4 ml-auto transform transition-all duration-300 ${
                    appoinmentsDropdownOpen
                      ? "rotate-180 text-purple-400"
                      : "text-slate-500"
                  }`}
                />
              </div>

              <div
                className={`ml-4 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
                  appoinmentsDropdownOpen
                    ? "max-h-96 opacity-100 mb-2"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                  <Link
                    to="/AdminLab"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                      isActive("/AdminLab")
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="w-1.5 h-1.5 bg-current rounded-full mr-3" />
                    Lab Appointment Request
                  </Link>

                  <Link
                    to="/RequestLabTest"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                      isActive("/RequestLabTest")
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="w-1.5 h-1.5 bg-current rounded-full mr-3" />
                    Lab Doctor Request
                  </Link>

                  <Link
                    to="/LabTestReport"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                      isActive("/LabTestReport")
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="w-1.5 h-1.5 bg-current rounded-full mr-3" />
                    Lab Test Reports
                  </Link>

                  <Link
                    to="/SpecialistAppointments"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                      isActive("/SpecialistAppointments")
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="w-1.5 h-1.5 bg-current rounded-full mr-3" />
                    Specialist Referral
                  </Link>

                  <Link
                    to="/AdminConsult"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                      isActive("/AdminConsult")
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="w-1.5 h-1.5 bg-current rounded-full mr-3" />
                    Consultation Appoinment Requests
                  </Link>

                  <Link
                    to="/AdminSpecialist"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                      isActive("/AdminSpecialist")
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="w-1.5 h-1.5 bg-current rounded-full mr-3" />
                    Specialist Appoinment History
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Billing Management Dropdown */}
          {permissions?.accessBilling && (
            <div>
              <button
                onClick={() => setBillingDropdownOpen(!billingDropdownOpen)}
                className={`group w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive("/billing") || isActive("/PaidSection")
                    ? "bg-gradient-to-r from-emerald-600/20 to-green-600/20 text-white border border-emerald-500/30 shadow-lg shadow-emerald-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
                }`}
              >
                <div className="flex items-center">
                  <CreditCardIcon
                    className={`w-5 h-5 mr-3 transition-colors ${
                      isActive("/billing") || isActive("/PaidSection")
                        ? "text-emerald-400"
                        : "text-slate-400 group-hover:text-emerald-400"
                    }`}
                  />
                  <span>Billing Management</span>
                </div>
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform duration-200 ${
                    billingDropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {/* Dropdown Items */}
              <div
                className={`ml-4 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
                  billingDropdownOpen
                    ? "max-h-96 opacity-100 mb-2"
                    : "max-h-0 opacity-0"
                }`}
              >
                <Link
                  to="/billing"
                  className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                    isActive("/billing")
                      ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="w-1.5 h-1.5 bg-current rounded-full mr-3" />
                  Billing
                </Link>

                <Link
                  to="/PaidSection"
                  className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                    isActive("/PaidSection")
                      ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="w-1.5 h-1.5 bg-current rounded-full mr-3" />
                  Billing Paid Section
                </Link>
              </div>
            </div>
          )}

          {/* Medical Certificate */}
          {permissions?.accessMedicalCertificate && (
            <Link
              to="/generate-medical-certificate"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive("/generate-medical-certificate")
                  ? "bg-gradient-to-r from-teal-600/20 to-cyan-600/20 text-white border border-teal-500/30 shadow-lg shadow-teal-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <ClipboardDocumentCheckIcon
                className={`w-5 h-5 mr-3 transition-colors ${
                  isActive("/generate-medical-certificate")
                    ? "text-teal-400"
                    : "text-slate-400 group-hover:text-teal-400"
                }`}
              />
              <span>Medical Certificate</span>
              {isActive("/generate-medical-certificate") && (
                <div className="ml-auto w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
              )}
            </Link>
          )}
          {permissions?.accessSettings && (
            <Link
              to="/user-management"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive("/user-management")
                  ? "bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-white border border-cyan-500/30 shadow-lg shadow-cyan-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <UsersIcon
                className={`w-5 h-5 mr-3 transition-colors ${
                  isActive("/user-management")
                    ? "text-cyan-400"
                    : "text-slate-400 group-hover:text-cyan-400"
                }`}
              />
              <span>User Management</span>
            </Link>
          )}

          {permissions?.accessSettings && (
            <Link
              to="/supplier-management"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive("/supplier-management")
                  ? "bg-gradient-to-r from-orange-600/20 to-red-600/20 text-white border border-orange-500/30 shadow-lg shadow-orange-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <TruckIcon
                className={`w-5 h-5 mr-3 transition-colors ${
                  isActive("/supplier-management")
                    ? "text-orange-400"
                    : "text-slate-400 group-hover:text-orange-400"
                }`}
              />
              <span>Supplier Management</span>
            </Link>
          )}

          {permissions?.accessSettings && (
            <Link
              to="/medical-services"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive("/medical-services")
                  ? "bg-gradient-to-r from-orange-600/20 to-red-600/20 text-white border border-orange-500/30 shadow-lg shadow-orange-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <HeartIcon
                className={`w-5 h-5 mr-3 transition-colors ${
                  isActive("/medical-services")
                    ? "text-red-400"
                    : "text-slate-400 group-hover:text-red-400"
                }`}
              />
              <span>Medical Services Management</span>
            </Link>
          )}

          {permissions?.accessAnalytics && (
            <Link
              to="/analytics"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive("/analytics")
                  ? "bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-white border border-cyan-500/30 shadow-lg shadow-cyan-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <ChartBarIcon
                className={`w-5 h-5 mr-3 transition-colors ${
                  isActive("/analytics")
                    ? "text-cyan-400"
                    : "text-slate-400 group-hover:text-cyan-400"
                }`}
              />
              <span>Analytics</span>
            </Link>
          )}

          {/* Settings */}
          {permissions?.accessSettings && (
            <Link
              to="/settings"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive("/settings")
                  ? "bg-gradient-to-r from-gray-600/20 to-slate-600/20 text-white border border-gray-500/30 shadow-lg shadow-gray-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <Cog8ToothIcon
                className={`w-5 h-5 mr-3 transition-colors ${
                  isActive("/settings")
                    ? "text-gray-400"
                    : "text-slate-400 group-hover:text-gray-400"
                }`}
              />
              <span>Settings</span>
            </Link>
          )}

          {/* Divider */}
          <div className="py-4">
            <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="group w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-red-600/20 transition-all duration-200 border border-transparent hover:border-red-500/30"
          >
            <PowerIcon className="w-5 h-5 mr-3 text-slate-400 group-hover:text-red-400 transition-colors" />
            <span>Logout</span>
          </button>
        </nav>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex justify-between items-center p-6 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">
                {currentTitle}
              </h1>
              <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-1" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <UserProfileDropdown onLogout={handleLogout} />
          </div>
        </header>

        {/* Pages Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="p-6">
            <Outlet />
          </div>
          <LogoutConfirmationModal
            isOpen={isLogoutModalOpen}
            onClose={closeModal}
            onConfirm={confirmLogout}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
