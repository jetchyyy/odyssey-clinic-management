import { useState, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database";
import { database } from "../../../firebase/firebase";
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  Building,
  Mail,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import EditUserModal from "./EditUserModal";
import AddUserModal from "./AddUserModal";
import { useAuth } from "../../../context/authContext/authContext";

const UsersTable = () => {
  const { currentUser: authUser, role } = useAuth();
  const [currentUserData, setCurrentUserData] = useState(null);
  const [users, setUsers] = useState([]);
  const [clinics, setClinics] = useState({});
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editedData, setEditedData] = useState({
    email: "",
    department: "",
    role: "",
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedClinic, setSelectedClinic] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 15;

  // Fetch current user's full data from database
  useEffect(() => {
    if (authUser) {
      const userRef = ref(database, `users/${authUser.uid}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          setCurrentUserData({ id: authUser.uid, ...snapshot.val() });
        }
      });
      return () => unsubscribe();
    }
  }, [authUser]);

  // Fetch clinics data
  useEffect(() => {
    const clinicsRef = ref(database, "clinics");
    const unsubscribe = onValue(clinicsRef, (snapshot) => {
      const clinicsData = snapshot.val() || {};
      setClinics(clinicsData);
    });

    return () => unsubscribe();
  }, []);

  // Fetch users data
  useEffect(() => {
    const usersRef = ref(database, "users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const usersList = [];
      snapshot.forEach((childSnapshot) => {
        usersList.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      setUsers(usersList);
      setCurrentPage(1);
    });

    return () => unsubscribe();
  }, []);

  // Filter users based on role, clinic, and search
  useEffect(() => {
    let filtered = users.filter((user) => {
      // Filter out users with 'specialist' and 'superadmin' roles from the list
      if (
        user?.role?.toLowerCase() === "specialist" ||
        user?.role?.toLowerCase() === "superadmin"
      ) {
        return false;
      }

      // Filter out patients
      if (user?.role?.toLowerCase() === "patient") {
        return false;
      }

      return true;
    });

    // Apply clinic filtering based on current user's role
    if (currentUserData && role) {
      if (role?.toLowerCase() === "admin") {
        // Admin: Only show users from their clinic
        filtered = filtered.filter(
          (user) => user.clinicAffiliation === currentUserData.clinicAffiliation
        );
      } else if (role?.toLowerCase() === "superadmin") {
        // Superadmin: Apply clinic filter dropdown
        if (selectedClinic !== "all") {
          filtered = filtered.filter(
            (user) => user.clinicAffiliation === selectedClinic
          );
        }
      }
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((user) => {
        const fullName = `${user?.firstName || ""} ${
          user?.lastName || ""
        }`.toLowerCase();

        // Get clinic name for search
        const clinicName = user.clinicAffiliation
          ? (clinics[user.clinicAffiliation]?.name || "").toLowerCase()
          : "";

        return (
          (user?.email || "").toLowerCase().includes(searchLower) ||
          (user?.firstName || "").toLowerCase().includes(searchLower) ||
          (user?.lastName || "").toLowerCase().includes(searchLower) ||
          fullName.includes(searchLower) ||
          (user?.role || "").toLowerCase().includes(searchLower) ||
          (user?.department || "").toLowerCase().includes(searchLower) ||
          clinicName.includes(searchLower)
        );
      });
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, users, clinics, currentUserData, role, selectedClinic]);

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        const userRef = ref(database, `users/${userToDelete.id}`);
        await remove(userRef);
        setUserToDelete(null);
        setShowDeleteConfirm(false);
      } catch (error) {
        console.error("Error deleting user: ", error.message);
      }
    }
  };

  const handleEditClick = (user) => {
    setSelectedUserId(user.id);
    setEditedData(user);
    setShowEditModal(true);
  };

  const confirmDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const getUserStats = () => {
    const totalUsers = filteredUsers.length;
    const adminUsers = filteredUsers.filter(
      (user) => user.role === "admin"
    ).length;
    const activeUsers = filteredUsers.filter(
      (user) => user.status !== "inactive"
    ).length;

    return {
      total: totalUsers,
      admin: adminUsers,
      active: activeUsers,
    };
  };

  const getDepartmentIcon = (department) => {
    const icons = {
      Admin: <UserCheck size={20} />,
      IT: <Users size={20} />,
      HR: <Users size={20} />,
      Finance: <Building size={20} />,
      Operations: <Building size={20} />,
    };
    return icons[department] || <Users size={20} />;
  };

  const getClinicName = (clinicId) => {
    return clinics[clinicId]?.name || "N/A";
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const stats = getUserStats();
  const isSuperAdmin = role?.toLowerCase() === "superadmin";

  return (
    <div className="w-full bg-white rounded-lg shadow-md">
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Users size={24} />
              <span>Users Management</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Manage user accounts and access
              {!isSuperAdmin && currentUserData?.clinicAffiliation && (
                <span className="ml-2 text-sm font-medium text-blue-600">
                  ({getClinicName(currentUserData.clinicAffiliation)})
                </span>
              )}
            </p>
          </div>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md flex items-center space-x-2 transition-colors"
            onClick={() => setShowAddUserModal(true)}
          >
            <Plus size={20} />
            <span>Add User</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <h3 className="text-sm font-semibold text-blue-800">Total Users</h3>
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            <p className="text-xs text-blue-600">Registered accounts</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
            <h3 className="text-sm font-semibold text-purple-800">
              Admin Users
            </h3>
            <p className="text-2xl font-bold text-purple-900">{stats.admin}</p>
            <p className="text-xs text-purple-600">Administrative access</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
            <h3 className="text-sm font-semibold text-green-800">
              Active Users
            </h3>
            <p className="text-2xl font-bold text-green-900">{stats.active}</p>
            <p className="text-xs text-green-600">Currently active</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Clinic Filter (Only for Superadmin) */}
          {isSuperAdmin && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={20} className="text-gray-400" />
              </div>
              <select
                value={selectedClinic}
                onChange={(e) => setSelectedClinic(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Clinics</option>
                {Object.entries(clinics).map(([id, clinic]) => (
                  <option key={id} value={id}>
                    {clinic.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Pagination Info */}
        {filteredUsers.length > 0 && (
          <div className="mb-4 flex justify-between items-center text-sm text-gray-600">
            <div>
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </div>
            <div>
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="relative overflow-x-auto rounded-md shadow-sm">
          <table className="w-full text-sm text-gray-900 text-center border border-gray-200">
            <thead className="text-sm bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Clinic</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="bg-white border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-left">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.role === "admin"
                            ? "bg-purple-100"
                            : "bg-blue-100"
                        }`}
                      >
                        <Users
                          size={20}
                          className={
                            user.role === "admin"
                              ? "text-purple-600"
                              : "text-blue-600"
                          }
                        />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center space-x-2">
                          <span>{`${user.firstName} ${user.lastName}`}</span>
                          {user.role === "admin" && (
                            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          User ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-1">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-1">
                      <Building size={14} className="text-gray-400" />
                      <span className="text-sm">
                        {getClinicName(user.clinicAffiliation)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-1">
                      {getDepartmentIcon(user.department)}
                      <span className="text-sm">{user.department || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {(user?.role || "N/A").charAt(0).toUpperCase() +
                        (user?.role || "N/A").slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col space-y-1">
                      <button
                        className="px-3 py-1 rounded-md text-xs bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        onClick={() => handleEditClick(user)}
                      >
                        Edit
                      </button>
                      <button
                        className={`px-3 py-1 rounded-md text-xs transition-colors ${
                          user.role === "admin" && user.department === "Admin"
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                        disabled={
                          user.role === "admin" && user.department === "Admin"
                        }
                        onClick={() => confirmDeleteUser(user)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <Users size={32} className="text-gray-300" />
                      <span>No users found.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > usersPerPage && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChevronLeft size={16} className="mr-1" />
                Previous
              </button>
            </div>

            <div className="flex items-center space-x-1">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() =>
                    typeof page === "number" && handlePageChange(page)
                  }
                  disabled={page === "..."}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : page === "..."
                      ? "text-gray-400 cursor-default"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        showModal={showEditModal}
        setShowModal={setShowEditModal}
        userId={selectedUserId}
        onClose={() => setShowEditModal(false)}
      />

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          showModal={showAddUserModal}
          setShowModal={setShowAddUserModal}
          onUserAdded={() => {
            /* leave blank */
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Users size={24} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-gray-900">
                Delete User
              </h2>
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {userToDelete?.firstName} {userToDelete?.lastName}
                </span>
                ?
              </p>
              <p className="mb-6 text-sm text-red-600">
                Delete function is not complete yet and will not delete a user
                from Firebase Authentication.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleDeleteUser}
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;