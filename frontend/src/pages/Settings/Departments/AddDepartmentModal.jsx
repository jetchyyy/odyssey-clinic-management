import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import SuccessModal from "../../../components/reusable/SuccessModal";

const AddDepartmentModal = ({ showModal, setShowModal, onAddDepartment, existingDepartments = [] }) => {
  const [departmentName, setDepartmentName] = useState("");
  const [error, setError] = useState('');
  const [accessInventory, setAccessInventory] = useState(false);
  const [accessOverallInventory, setAccessOverallInventory] = useState(false);
  const [accessInventoryHistory, setAccessInventoryHistory] = useState(false);
  const [accessPatients, setAccessPatients] = useState(false);
  const [accessSettings, setAccessSettings] = useState(false);
  const [accessBilling, setAccessBilling] = useState(false);
  const [accessLaboratory, setAccessLaboratory] = useState(false);
  const [accessAnalytics, setAccessAnalytics] = useState(false);
  const [accessMedicalCertificate, setAccessMedicalCertificate] = useState(false);
  const [accessInventoryTransactions, setAccessInventoryTransactions] = useState(false);
  const [accessTransferStocks, setAccessTransferStocks] = useState(false);
  const [accessTeleconsultation, setAccessTeleconsultation] = useState(false);

  // Mobile Features permissions
  const [accessDoctorScreen, setAccessDoctorScreen] = useState(false);
  const [accessLabScreen, setAccessLabScreen] = useState(false);
  const [accessAdminScreen, setAccessAdminScreen] = useState(false);
  const [accessClinicStaffScreen, setAccessClinicStaffScreen] = useState(false);
  const [accessNurseScreen, setAccessNurseScreen] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

  const handleDepartmentNameChange = (e) => {
    const value = e.target.value.toLowerCase();
    setDepartmentName(value);
    
    // Check for duplicates
    if (value && existingDepartments.includes(value)) {
      setError('A department with this name already exists');
    } else {
      setError('');
    }
  };

  const resetForm = () => {
    setDepartmentName("");
    setError('');
    setAccessInventory(false);
    setAccessOverallInventory(false);
    setAccessInventoryHistory(false);
    setAccessPatients(false);
    setAccessSettings(false);
    setAccessBilling(false);
    setAccessLaboratory(false);
    setAccessAnalytics(false);
    setAccessMedicalCertificate(false);
    setAccessInventoryTransactions(false);
    setAccessTransferStocks(false);
    setAccessTeleconsultation(false);
    setAccessDoctorScreen(false);
    setAccessLabScreen(false);
    setAccessAdminScreen(false);
    setAccessClinicStaffScreen(false);
    setAccessNurseScreen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Final validation
    if (existingDepartments.includes(departmentName.toLowerCase())) {
      setError('A department with this name already exists');
      return;
    }

    if (!departmentName.trim()) {
      setError('Department name is required');
      return;
    }

    const newDepartment = {
      [departmentName]: {
        permissions: {
          accessInventory,
          accessOverallInventory,
          accessInventoryHistory,
          accessPatients,
          accessSettings,
          accessBilling,
          accessLaboratory,
          accessAnalytics,
          accessMedicalCertificate,
          accessInventoryTransactions,
          accessTransferStocks,
          accessTeleconsultation,
          // Mobile Features permissions
          accessDoctorScreen,
          accessLabScreen,
          accessAdminScreen,
          accessClinicStaffScreen,
          accessNurseScreen,
        },
      },
    };

    onAddDepartment(newDepartment, departmentName);

    resetForm();
    setShowModal(false);
    setShowSuccessModal(true);
  };

  const handleClose = () => {
    resetForm();
    setShowModal(false);
  };

  if (!showModal) return null;

  const isFormValid = departmentName.trim() && !error;

  return (
    <>
     <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Department Created!"
        message="The department was added successfully."
      />

      {/* Add Department Modal */}
      {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-md p-6 w-full max-w-lg shadow-lg relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          <h2 className="text-2xl font-bold mb-6">Add Department</h2>

          <form onSubmit={handleSubmit} className="max-h-[500px] overflow-y-auto">
            <div className="mb-4">
              <label className="block text-gray-700">Department Name</label>
              <input
                type="text"
                placeholder="Department Name (will be converted to lowercase)"
                value={departmentName}
                onChange={handleDepartmentNameChange}
                required
                className={`block w-full mt-2 p-2 border rounded-md ${
                  error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
              {departmentName && !error && (
                <p className="mt-1 text-sm text-gray-500">
                  Department will be created as: "{departmentName}"
                </p>
              )}
            </div>

            {/* Web Application Permissions */}
            <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">
                Web Application Permissions
              </h3>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={accessInventory}
                  onChange={() => setAccessInventory(!accessInventory)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Access Inventory</span>
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={accessOverallInventory}
                  onChange={() => setAccessOverallInventory(!accessOverallInventory)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Access Overall Inventory</span>
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={accessInventoryHistory}
                  onChange={() => setAccessInventoryHistory(!accessInventoryHistory)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Access Inventory History</span>
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={accessPatients}
                  onChange={() => setAccessPatients(!accessPatients)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Access Patients</span>
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={accessBilling}
                  onChange={() => setAccessBilling(!accessBilling)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Access Billing</span>
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={accessLaboratory}
                  onChange={() => setAccessLaboratory(!accessLaboratory)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Access Laboratory</span>
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={accessAnalytics}
                  onChange={() => setAccessAnalytics(!accessAnalytics)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Access Analytics</span>
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={accessMedicalCertificate}
                  onChange={() => setAccessMedicalCertificate(!accessMedicalCertificate)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Access Medical Certificate</span>
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={accessInventoryTransactions}
                  onChange={() => setAccessInventoryTransactions(!accessInventoryTransactions)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Access Inventory Transactions</span>
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={accessTransferStocks}
                  onChange={() => setAccessTransferStocks(!accessTransferStocks)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Access Transfer Stocks</span>
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={accessTeleconsultation}
                  onChange={() => setAccessTeleconsultation(!accessTeleconsultation)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Access Teleconsultation</span>
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={accessSettings}
                  onChange={() => setAccessSettings(!accessSettings)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Access Settings</span>
              </label>
            </div>

            {/* Mobile Features Permissions */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg shadow-md border-l-4 border-blue-400">
              <h3 className="text-lg font-semibold mb-4 text-blue-800">
                Mobile Features Permissions
              </h3>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={accessDoctorScreen}
                  onChange={() => setAccessDoctorScreen(!accessDoctorScreen)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Access Doctor Screen</span>
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={accessLabScreen}
                  onChange={() => setAccessLabScreen(!accessLabScreen)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Access Lab Screen</span>
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={accessAdminScreen}
                  onChange={() => setAccessAdminScreen(!accessAdminScreen)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Access Admin Screen</span>
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={accessClinicStaffScreen}
                  onChange={() => setAccessClinicStaffScreen(!accessClinicStaffScreen)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Access Clinic Staff Screen</span>
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={accessNurseScreen}
                  onChange={() => setAccessNurseScreen(!accessNurseScreen)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Access Nurse Screen</span>
              </label>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={!isFormValid}
                className={`px-4 py-2 rounded-md text-white ${
                  isFormValid
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Create Department
              </button>
            </div>
          </form>
        </div>
      </div>
      )}
    </>
  );
};

export default AddDepartmentModal;