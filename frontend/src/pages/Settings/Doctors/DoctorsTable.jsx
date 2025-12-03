import { useState, useEffect } from "react";
import { ref, onValue, remove, update } from "firebase/database";
import { database } from "../../../firebase/firebase";
import { useAuth } from "../../../context/authContext/authContext";
import { Users, MessageSquare, Star,  Mail, Phone, MapPin } from "lucide-react";
import AddDoctorsModal from "./AddDoctorsModal";
import ProfessionalFeeModal from "./ProfessionalFeeModal";
import AvailabilityModal from "./AvailabilityModal";
import DoctorFeedbacks from "./DoctorFeedBacks";
import EditDoctorsAgreement from "./EditDoctorsAgreement";

const DoctorsTable = () => {
  const { currentUser, role } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [users, setUsers] = useState({});
  const [userClinicId, setUserClinicId] = useState(null);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [clinicsMap, setClinicsMap] = useState({});
  const [activeTab, setActiveTab] = useState('doctors');
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  const isSuperAdmin = role === 'superadmin';

  // Get user's clinic affiliation
  useEffect(() => {
    const fetchUserClinic = async () => {
      if (currentUser?.uid) {
        const userRef = ref(database, `users/${currentUser.uid}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserClinicId(userData.clinicAffiliation);
          }
        });
      }
    };
    fetchUserClinic();
  }, [currentUser]);

  useEffect(() => {
    const doctorsRef = ref(database, "doctors");
    const clinicsRef = ref(database, "clinics");
    const usersRef = ref(database, "users");

    const unsubscribeDoctors = onValue(doctorsRef, (snapshot) => {
      const doctorsList = [];
      snapshot.forEach((childSnapshot) => {
        doctorsList.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      setDoctors(doctorsList);
    });

    const unsubscribeClinics = onValue(clinicsRef, (snapshot) => {
      const clinicsData = snapshot.val() || {};
      const map = {};
      Object.entries(clinicsData).forEach(([id, clinic]) => {
        map[id] = clinic.name || id;
      });
      setClinicsMap(map);
    });

    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val() || {};
      setUsers(usersData);
    });

    return () => {
      unsubscribeDoctors();
      unsubscribeClinics();
      unsubscribeUsers();
    };
  }, []);

  // Filter doctors based on role and clinic affiliation
  useEffect(() => {
    if (isSuperAdmin) {
      // SuperAdmin sees all doctors
      setFilteredDoctors(doctors);
    } else if (userClinicId) {
      // Admin sees only doctors affiliated with their clinic
      const clinicDoctors = doctors.filter(doctor => 
        doctor.clinicAffiliations && 
        doctor.clinicAffiliations.includes(userClinicId)
      );
      setFilteredDoctors(clinicDoctors);
    } else {
      setFilteredDoctors([]);
    }
  }, [doctors, userClinicId, isSuperAdmin]);

  const getDoctorEmail = (doctor) => {
    const user = Object.values(users).find(user => 
      user.role === "doctor" &&
      user.firstName === doctor.firstName &&
      user.lastName === doctor.lastName &&
      user.contactNumber === doctor.contactNumber
    );
    return user?.email || 'No email';
  };

  const confirmDeleteDoctor = (doctor) => {
    setDoctorToDelete(doctor);
    setShowDeleteConfirm(true);
  };

  const handleDeleteDoctor = async () => {
    if (doctorToDelete) {
      try {
        const docRef = ref(database, `doctors/${doctorToDelete.id}`);
        await remove(docRef);
        setShowDeleteConfirm(false);
        setDoctorToDelete(null);
      } catch (error) {
        console.error("Error deleting doctor:", error);
      }
    }
  };

  const openFeeModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowFeeModal(true);
  };

  const openAvailabilityModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowAvailabilityModal(true);
  };

  const renderStarRating = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  const getDoctorStats = (doctorId) => {
    return {
      averageRating: 4.5,
      totalFeedbacks: 12,
      recentFeedbacks: 3
    };
  };

  // Calculate stats for filtered doctors only
  const generalistCount = filteredDoctors.filter(doc => doc.specialty === "Generalist").length;
  const specialistCount = filteredDoctors.filter(doc => doc.specialty !== "Generalist").length;

  return (
    <div className="w-full bg-white rounded-lg shadow-md">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('doctors')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'doctors'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users size={20} />
              <span>Doctors Management</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'feedbacks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <MessageSquare size={20} />
              <span>Patient Feedbacks</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'doctors' && (
        <div className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <Users size={24} />
                <span>Doctors Management</span>
              </h2>
              <p className="text-gray-600 mt-1">
                {isSuperAdmin 
                  ? 'Manage all doctors across all clinics' 
                  : `Manage doctors for ${clinicsMap[userClinicId] || 'your clinic'}`
                }
              </p>
            </div>
              
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex items-center space-x-2 transition-colors"
              onClick={() => setShowAgreementModal(true)}
            >
              <Users size={20} />
              <span>Edit Doctor's Agreement</span>
            </button>
          </div>

          {/* Info Banner for Admin */}
          {!isSuperAdmin && userClinicId && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-blue-600" />
                <p className="text-sm text-blue-800">
                  <strong>Viewing doctors for:</strong> {clinicsMap[userClinicId] || userClinicId}
                </p>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <h3 className="text-sm font-semibold text-blue-800">
                {isSuperAdmin ? 'Total Doctors (All Clinics)' : 'Total Doctors (Your Clinic)'}
              </h3>
              <p className="text-2xl font-bold text-blue-900">{filteredDoctors.length}</p>
              <p className="text-xs text-blue-600">Active practitioners</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
              <h3 className="text-sm font-semibold text-green-800">Generalists</h3>
              <p className="text-2xl font-bold text-green-900">{generalistCount}</p>
              <p className="text-xs text-green-600">General practitioners</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
              <h3 className="text-sm font-semibold text-purple-800">Specialists</h3>
              <p className="text-2xl font-bold text-purple-900">{specialistCount}</p>
              <p className="text-xs text-purple-600">Specialized doctors</p>
            </div>
          </div>

          {/* Doctors Table */}
          <div className="relative overflow-x-auto rounded-md shadow-sm">
            <table className="w-full text-sm text-gray-900 text-center border border-gray-200">
              <thead className="text-sm bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Doctor Info</th>
                  <th className="px-4 py-3">Specialty</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Professional Fees</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Affiliated Clinics</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors
                  .filter((doc) => doc.specialty === "Generalist")
                  .map((doc) => {
                    const stats = getDoctorStats(doc.id);
                    const doctorEmail = getDoctorEmail(doc);
                    return (
                      <tr
                        key={doc.id}
                        className="bg-white border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-left">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{doc.fullName}</div>
                              <div className="text-xs text-gray-500 flex items-center space-x-1">
                                <Mail size={12} />
                                <span className={doctorEmail === 'No email' ? 'text-red-500' : ''}>
                                  {doctorEmail}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            {doc.specialty}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {doc.isGeneralist && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded block">
                                Generalist
                              </span>
                            )}
                            {doc.isSpecialist && (
                              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded block">
                                Specialist
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center space-x-1">
                            <Phone size={12} className="text-gray-400" />
                            <span className="text-sm">{doc.contactNumber}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-left">
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="font-medium">Consultation:</span>{" "}
                              <span className="text-green-600">
                                {doc.professionalFees?.consultationFee
                                  ? `₱${doc.professionalFees.consultationFee}`
                                  : "—"}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Follow-up:</span>{" "}
                              <span className="text-green-600">
                                {doc.professionalFees?.followUpFee
                                  ? `₱${doc.professionalFees.followUpFee}`
                                  : "—"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col items-center space-y-1">
                            {renderStarRating(stats.averageRating)}
                            <div className="text-xs text-gray-500">
                              {stats.totalFeedbacks} reviews
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-left">
                          <div className="space-y-1">
                            {(doc.clinicAffiliations || []).map((clinicId) => (
                              <div key={clinicId} className="flex items-center space-x-1">
                                <MapPin size={12} className="text-gray-400" />
                                <span className={`text-xs ${
                                  clinicId === userClinicId && !isSuperAdmin 
                                    ? 'font-semibold text-blue-600' 
                                    : ''
                                }`}>
                                  {clinicsMap[clinicId] || clinicId}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col space-y-1">
                            <button
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs transition-colors"
                              onClick={() =>
                                alert("Edit functionality is under construction.")
                              }
                            >
                              Edit
                            </button>
                            <button
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-xs transition-colors"
                              onClick={() => openFeeModal(doc)}
                            >
                              Set Fees
                            </button>
                            <button
                              className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-md text-xs transition-colors"
                              onClick={() => openAvailabilityModal(doc)}
                            >
                              Availability
                            </button>
                            <button
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs transition-colors"
                              onClick={() => confirmDeleteDoctor(doc)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                {filteredDoctors.filter((doc) => doc.specialty === "Generalist").length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-gray-500">
                      <div className="flex flex-col items-center space-y-2">
                        <Users size={32} className="text-gray-300" />
                        <span>
                          {isSuperAdmin 
                            ? 'No doctors found.' 
                            : 'No doctors found for your clinic.'
                          }
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feedbacks Tab */}
      {activeTab === 'feedbacks' && (
        <div className="p-6">
          <DoctorFeedbacks doctors={filteredDoctors} clinicsMap={clinicsMap} />
        </div>
      )}

      {/* Modals */}
      <AddDoctorsModal
        showModal={showAddDoctorModal}
        setShowModal={setShowAddDoctorModal}
      />

      {showFeeModal && selectedDoctor && (
        <ProfessionalFeeModal
          doctor={selectedDoctor}
          onClose={() => setShowFeeModal(false)}
        />
      )}

      {showAvailabilityModal && selectedDoctor && (
        <AvailabilityModal
          doctor={selectedDoctor}
          onClose={() => setShowAvailabilityModal(false)}
        />
      )}

      {showAgreementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Doctor's Agreement</h2>
              <button
                onClick={() => setShowAgreementModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <EditDoctorsAgreement />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Users size={24} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-gray-900">Delete Doctor</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{doctorToDelete?.fullName}</span>?
                This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleDeleteDoctor}
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

export default DoctorsTable;