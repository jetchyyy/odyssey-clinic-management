import { XMarkIcon } from "@heroicons/react/24/solid";
import { 
  Shield, 
  Eye, 
  History, 
  Users, 
  CreditCard, 
  Settings, 
  Stethoscope,
  FlaskConical,
  UserCog,
  BarChart3,
  FileText,
  ArrowRightLeft,
  UserCheck,
  UserPlus,
  Package,
  Building2,
  Video
} from 'lucide-react';

const ViewDepartmentPermissionsModal = ({ showModal, setShowModal, department }) => {
  if (!showModal || !department) return null;

  const getPermissionIcon = (permissionType) => {
    const icons = {
      accessInventory: <Shield size={16} />,
      accessOverallInventory: <Eye size={16} />,
      accessInventoryHistory: <History size={16} />,
      accessPatients: <Users size={16} />,
      accessBilling: <CreditCard size={16} />,
      accessSettings: <Settings size={16} />,
      accessLaboratory: <FlaskConical size={16} />,
      accessAnalytics: <BarChart3 size={16} />,
      accessMedicalCertificate: <FileText size={16} />,
      accessInventoryTransactions: <ArrowRightLeft size={16} />,
      accessTransferStocks: <Package size={16} />,
      accessTeleconsultation: <Video size={16} />,
      accessClinicManagement: <Building2 size={16} />,
      // Mobile Features icons
      accessDoctorScreen: <Stethoscope size={16} />,
      accessLabScreen: <FlaskConical size={16} />,
      accessAdminScreen: <UserCog size={16} />,
      accessClinicStaffScreen: <UserCheck size={16} />,
      accessNurseScreen: <UserPlus size={16} />
    };
    return icons[permissionType] || <Shield size={16} />;
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

  const getPermissionCount = (permissions) => {
    return permissions.filter(permission => department.permissions?.[permission]).length;
  };

  const webPermissionCount = getPermissionCount(webPermissions);
  const mobilePermissionCount = getPermissionCount(mobilePermissions);
  const superAdminPermissionCount = getPermissionCount(superAdminPermissions);
  const totalPermissions = webPermissions.length + mobilePermissions.length + superAdminPermissions.length;
  const totalGranted = webPermissionCount + mobilePermissionCount + superAdminPermissionCount;

  const isSuperAdmin = department.id === 'SuperAdmin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Department Permissions</h2>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{department.id}</h3>
              <p className="text-gray-600">
                {totalGranted} of {totalPermissions} permissions granted
              </p>
            </div>
          </div>
        </div>

        {/* Permission Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Web Application</h4>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">{webPermissionCount}</span>
              <span className="text-sm text-gray-600">/ {webPermissions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(webPermissionCount / webPermissions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-700 mb-2">Mobile Features</h4>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-900">{mobilePermissionCount}</span>
              <span className="text-sm text-blue-600">/ {mobilePermissions.length}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(mobilePermissionCount / mobilePermissions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          {isSuperAdmin && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-red-700 mb-2">SuperAdmin Only</h4>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-red-900">{superAdminPermissionCount}</span>
                <span className="text-sm text-red-600">/ {superAdminPermissions.length}</span>
              </div>
              <div className="w-full bg-red-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(superAdminPermissionCount / superAdminPermissions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Web Application Permissions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center space-x-2">
            <Shield size={20} />
            <span>Web Application Permissions</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {webPermissions.map((permission) => (
              <div 
                key={permission} 
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                  department.permissions?.[permission] 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  department.permissions?.[permission] 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {getPermissionIcon(permission)}
                </div>
                <div className="flex-1">
                  <span className={`font-medium ${
                    department.permissions?.[permission] 
                      ? 'text-green-800' 
                      : 'text-red-800'
                  }`}>
                    Access {formatPermissionLabel(permission)}
                  </span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  department.permissions?.[permission] 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {department.permissions?.[permission] ? 'Granted' : 'Denied'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Features Permissions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-800 flex items-center space-x-2">
            <Stethoscope size={20} />
            <span>Mobile Features Permissions</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mobilePermissions.map((permission) => (
              <div 
                key={permission} 
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                  department.permissions?.[permission] 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  department.permissions?.[permission] 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {getPermissionIcon(permission)}
                </div>
                <div className="flex-1">
                  <span className={`font-medium ${
                    department.permissions?.[permission] 
                      ? 'text-green-800' 
                      : 'text-red-800'
                  }`}>
                    Access {formatPermissionLabel(permission)}
                  </span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  department.permissions?.[permission] 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {department.permissions?.[permission] ? 'Granted' : 'Denied'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SuperAdmin Exclusive Permissions */}
        {isSuperAdmin && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-red-800 flex items-center space-x-2">
              <Building2 size={20} />
              <span>SuperAdmin Exclusive Permissions</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {superAdminPermissions.map((permission) => (
                <div 
                  key={permission} 
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                    department.permissions?.[permission] 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    department.permissions?.[permission] 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {getPermissionIcon(permission)}
                  </div>
                  <div className="flex-1">
                    <span className={`font-medium ${
                      department.permissions?.[permission] 
                        ? 'text-green-800' 
                        : 'text-red-800'
                    }`}>
                      Access {formatPermissionLabel(permission)}
                    </span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    department.permissions?.[permission] 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {department.permissions?.[permission] ? 'Granted' : 'Denied'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={() => setShowModal(false)}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDepartmentPermissionsModal;