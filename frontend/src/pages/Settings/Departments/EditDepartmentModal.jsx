import { useState, useEffect } from 'react';
import { XMarkIcon } from "@heroicons/react/24/solid";

const EditDepartmentModal = ({ showModal, setShowModal, department, onEditDepartment, existingDepartments = [] }) => {
  const [departmentName, setDepartmentName] = useState('');
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState({
    accessInventory: false,
    accessOverallInventory: false,
    accessInventoryHistory: false,
    accessPatients: false,
    accessSettings: false,
    accessBilling: false,
    accessLaboratory: false,
    accessAnalytics: false,
    accessMedicalCertificate: false,
    accessInventoryTransactions: false,
    accessTransferStocks: false,
    accessTeleconsultation: false,
    accessClinicManagement: false,
    // Mobile Features permissions
    accessDoctorScreen: false,
    accessLabScreen: false,
    accessAdminScreen: false,
    accessClinicStaffScreen: false,
    accessNurseScreen: false,
  });
  const [isLoading, setIsLoading] = useState(false); 

  useEffect(() => {
    if (department) {
      setDepartmentName(department.id || '');
      setPermissions({
        accessInventory: department.permissions?.accessInventory || false,
        accessOverallInventory: department.permissions?.accessOverallInventory || false,
        accessInventoryHistory: department.permissions?.accessInventoryHistory || false,
        accessPatients: department.permissions?.accessPatients || false,
        accessSettings: department.permissions?.accessSettings || false,
        accessBilling: department.permissions?.accessBilling || false,
        accessLaboratory: department.permissions?.accessLaboratory || false,
        accessAnalytics: department.permissions?.accessAnalytics || false,
        accessMedicalCertificate: department.permissions?.accessMedicalCertificate || false,
        accessInventoryTransactions: department.permissions?.accessInventoryTransactions || false,
        accessTransferStocks: department.permissions?.accessTransferStocks || false,
        accessTeleconsultation: department.permissions?.accessTeleconsultation || false,
        accessClinicManagement: department.permissions?.accessClinicManagement || false,
        // Mobile Features permissions
        accessDoctorScreen: department.permissions?.accessDoctorScreen || false,
        accessLabScreen: department.permissions?.accessLabScreen || false,
        accessAdminScreen: department.permissions?.accessAdminScreen || false,
        accessClinicStaffScreen: department.permissions?.accessClinicStaffScreen || false,
        accessNurseScreen: department.permissions?.accessNurseScreen || false,
      });
      setError('');
    }
  }, [department]);

  const handleDepartmentNameChange = (e) => {
    const value = e.target.value.toLowerCase();
    setDepartmentName(value);
    
    if (value && value !== department.id.toLowerCase() && existingDepartments.includes(value)) {
      setError('A department with this name already exists');
    } else {
      setError('');
    }
  };

  const handleChange = (e) => {
    const { name, type, checked } = e.target;

    if (name === 'accessClinicManagement' && department.id !== 'SuperAdmin') {
      return;
    }

    setPermissions((prevPermissions) => ({
      ...prevPermissions,
      [name]: type === 'checkbox' ? checked : prevPermissions[name],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!departmentName.trim()) {
      setError('Department name is required');
      return;
    }

    if (departmentName.toLowerCase() !== department.id.toLowerCase() && 
        existingDepartments.includes(departmentName.toLowerCase())) {
      setError('A department with this name already exists');
      return;
    }

    setIsLoading(true); 

    try {
      await onEditDepartment(department.id, { permissions });
      setShowModal(false); 
    } catch (error) {
      console.error("Failed to update department:", error);
      setError('Failed to update department. Please try again.');
    } finally {
      setIsLoading(false); 
    }
  };

  const handleClose = () => {
    setError('');
    setShowModal(false);
  };

  const formatPermissionLabel = (permission) => {
    return permission
      .replace(/access/g, '')
      .replace(/([A-Z])/g, ' $1')
      .replace(/screen/gi, 'Screen')
      .trim();
  };

  const webPermissions = [
    'accessInventory',
    'accessOverallInventory', 
    'accessInventoryHistory',
    'accessPatients',
    'accessBilling',
    'accessLaboratory',
    'accessAnalytics',
    'accessMedicalCertificate',
    'accessInventoryTransactions',
    'accessTransferStocks',
    'accessTeleconsultation',
    'accessSettings'
  ];

  const mobilePermissions = [
    'accessDoctorScreen',
    'accessLabScreen',
    'accessAdminScreen',
    'accessClinicStaffScreen',
    'accessNurseScreen'
  ];

  const superAdminPermissions = [
    'accessClinicManagement'
  ];

  if (!showModal) return null;

  const isFormValid = departmentName.trim() && !error;
  const isSystemDepartment = department?.id === 'Admin' || department?.id === 'SuperAdmin';
  const isSuperAdmin = department?.id === 'SuperAdmin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-md p-6 w-full max-w-lg shadow-lg relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Edit Department</h2>

        {isSystemDepartment && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This is a system department. Department name cannot be modified, but permissions can be updated.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-h-[500px] overflow-y-auto">
          <div className="mb-4">
            <label className="block text-gray-700">Department Name</label>
            <input
              type="text"
              placeholder="Department Name (will be converted to lowercase)"
              value={departmentName}
              onChange={handleDepartmentNameChange}
              className={`block w-full mt-2 p-2 border rounded-md ${
                isSystemDepartment 
                  ? 'bg-gray-100 cursor-not-allowed' 
                  : error 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
              }`}
              disabled={isSystemDepartment}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            {departmentName && !error && departmentName !== department?.id && !isSystemDepartment && (
              <p className="mt-1 text-sm text-gray-500">
                Department will be updated to: "{departmentName}"
              </p>
            )}
          </div>

          {/* Web Application Permissions */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Web Application Permissions</h3>
            {webPermissions.map((permission) => (
              <label key={permission} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name={permission}
                  checked={permissions[permission]}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">
                  Access {formatPermissionLabel(permission)}
                </span>
              </label>
            ))}
          </div>

          {/* Mobile Features Permissions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg shadow-md border-l-4 border-blue-400">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">Mobile Features Permissions</h3>
            {mobilePermissions.map((permission) => (
              <label key={permission} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name={permission}
                  checked={permissions[permission]}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">
                  Access {formatPermissionLabel(permission)}
                </span>
              </label>
            ))}
          </div>

          {/* SuperAdmin Exclusive Permissions */}
          {isSuperAdmin && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg shadow-md border-l-4 border-red-400">
              <h3 className="text-lg font-semibold mb-4 text-red-800">SuperAdmin Exclusive Permissions</h3>
              <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded">
                <p className="text-xs text-red-700">
                  <strong>Note:</strong> These permissions are exclusive to SuperAdmin and cannot be granted to other departments.
                </p>
              </div>
              {superAdminPermissions.map((permission) => (
                <label key={permission} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    name={permission}
                    checked={permissions[permission]}
                    onChange={handleChange}
                    className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="ml-2 text-gray-700">
                    Access {formatPermissionLabel(permission)}
                  </span>
                </label>
              ))}
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-white ${
                isFormValid && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`} 
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? 'Updating Department...' : 'Update Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDepartmentModal;