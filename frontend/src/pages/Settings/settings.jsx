import { useState } from "react";
import { useAuth } from "../../context/authContext/authContext"; // Import useAuth
import RolesTable from "./Roles/RolesTable";
import AccessDenied from "../ErrorPages/AccessDenied";
import { useAccessControl } from "../../components/roles/accessControl";
import DepartmentsTable from "./Departments/DepartmentsTable";
import ClinicsTable from "./Clinics/ClinicTable";
import DoctorsTable from "./Doctors/DoctorsTable";
import SuccessModal from "../../components/reusable/SuccessModal"; 

const Settings = () => {
  const [tableView, setTableView] = useState("Role Management");
  const permissions = useAccessControl();
  const { role } = useAuth(); // Get the user's role from AuthContext
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successTitle, setSuccessTitle] = useState("");

  // Only show Clinic Management if user is superadmin AND has permission
  const shouldShowClinicManagement = 
    role === "superadmin" && permissions?.accessClinicManagement === true;

  const handleShowSuccess = (title, message) => {
    setSuccessTitle(title);
    setSuccessMessage(message);
    setShowSuccessModal(true);
  };

  const handleClick = (view) => {
    setTableView(view);
  };

  if (!permissions?.accessSettings) {
    return <AccessDenied />;
  }

  return (
    <div className="w-full">
      {/* ✅ Success Modal Global */}
      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successTitle}
        message={successMessage}
      />

      {/* Tabs */}
      <div className="mb-4 flex justify-start items-center flex-wrap gap-2">
        {shouldShowClinicManagement && (
          <button
            onClick={() => handleClick("Clinic Management")}
            className={`px-6 py-2 rounded-md transition duration-200 ${
              tableView === "Clinic Management"
                ? "bg-slate-900 text-white font-bold"
                : "bg-slate-200 text-gray-900"
            }`}
          >
            Clinic Management
          </button>
        )}
        <button
          onClick={() => handleClick("Role Management")}
          className={`px-6 py-2 rounded-md transition duration-200 ${
            tableView === "Role Management"
              ? "bg-slate-900 text-white font-bold"
              : "bg-slate-200 text-gray-900"
          }`}
        >
          Role Management
        </button>
        <button
          onClick={() => handleClick("Department Management")}
          className={`px-6 py-2 rounded-md transition duration-200 ${
            tableView === "Department Management"
              ? "bg-slate-900 text-white font-bold"
              : "bg-slate-200 text-gray-900"
          }`}
        >
          Department Management
        </button>
        <button
          onClick={() => handleClick("Doctor Management")}
          className={`px-6 py-2 rounded-md transition duration-200 ${
            tableView === "Doctor Management"
              ? "bg-slate-900 text-white font-bold"
              : "bg-slate-200 text-gray-900"
          }`}
        >
          Doctor Management
        </button>
      </div>

      {/* Tables */}
      {tableView === "Role Management" && (
        <RolesTable onSuccess={handleShowSuccess} />
      )}
      {tableView === "Department Management" && (
        <DepartmentsTable onSuccess={handleShowSuccess} />
      )}
      {shouldShowClinicManagement && tableView === "Clinic Management" && (
        <ClinicsTable onSuccess={handleShowSuccess} />
      )}
      {tableView === "Doctor Management" && (
        <DoctorsTable onSuccess={handleShowSuccess} />
      )}
    </div>
  );
};

export default Settings;