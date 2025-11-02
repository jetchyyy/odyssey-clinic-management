import { useState, useEffect } from "react";
import { 
  VideoCameraIcon, 
  CalendarDaysIcon, 
  ClockIcon, 
  UserIcon,
  PlusIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import { database } from "../../firebase/firebase";
import { ref, push, onValue, update, remove } from "firebase/database";
import { useAuth } from "../../context/authContext/authContext";
import CreateConsultationModal from "./CreateConsultationModal";
import JoinConsultationModal from "./JoinConsultationModal";

const Teleconsultation = () => {
  const { currentUser, userLoggedIn, department, role } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!userLoggedIn) return;

    const consultationsRef = ref(database, 'teleconsultations');
    const unsubscribe = onValue(consultationsRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Raw Firebase data:", data);
      
      if (data) {
        const consultationsList = Object.entries(data).map(([id, consultation]) => ({
          id,
          ...consultation
        }));
        
        console.log("Consultations list:", consultationsList);
        console.log("Current user role:", role);
        console.log("Current user department:", department);
        console.log("Current user ID:", currentUser?.uid);
        
        // FIXED: More flexible role/department checking
        const filteredConsultations = consultationsList.filter(consultation => {
          // Check if user is admin, doctor, or superadmin by role
          const isAdmin = role === 'admin' || role === 'superadmin';
          const isDoctor = role === 'doctor';
          
          // Check if user is in doctor or admin department (more flexible matching)
          const isDoctorDept = department && (
            department.toLowerCase().includes('doctor') || 
            department.toLowerCase().includes('admin')
          );
          
          console.log(`User permissions - isAdmin: ${isAdmin}, isDoctor: ${isDoctor}, isDoctorDept: ${isDoctorDept}`);
          
          if (isAdmin || isDoctor || isDoctorDept) {
            console.log(`User can see all consultations`);
            return true; // Doctors, Admins, and Superadmins can see all consultations
          } else {
            console.log(`User is patient, checking if consultation belongs to them`);
            const belongsToUser = consultation.patientId === currentUser?.uid;
            console.log(`Consultation ${consultation.id} belongs to user: ${belongsToUser}`);
            return belongsToUser; // Patients only see their own
          }
        });

        console.log("Filtered consultations:", filteredConsultations);
        setConsultations(filteredConsultations);
      } else {
        setConsultations([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userLoggedIn, currentUser, department, role]);

  const handleCreateConsultation = async (consultationData) => {
    try {
      const consultationsRef = ref(database, 'teleconsultations');
      await push(consultationsRef, {
        ...consultationData,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.uid,
        status: 'scheduled'
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating consultation:', error);
    }
  };

  const handleJoinConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setShowJoinModal(true);
  };

  const handleUpdateStatus = async (consultationId, status) => {
    try {
      const consultationRef = ref(database, `teleconsultations/${consultationId}`);
      await update(consultationRef, {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating consultation status:', error);
    }
  };

  const handleDeleteConsultation = async (consultationId) => {
    try {
      const consultationRef = ref(database, `teleconsultations/${consultationId}`);
      await remove(consultationRef);
    } catch (error) {
      console.error('Error deleting consultation:', error);
    }
  };

  const getFilteredConsultations = () => {
    const now = new Date();
    console.log("Filtering consultations - Current time:", now);
    console.log("Active tab:", activeTab);
    console.log("All consultations:", consultations);
    
    switch (activeTab) {
      case 'all':
        // Sort by date and time, most recent first
        return consultations.sort((a, b) => {
          const dateA = new Date(a.scheduledDate + 'T' + a.scheduledTime);
          const dateB = new Date(b.scheduledDate + 'T' + b.scheduledTime);
          return dateB - dateA;
        });
      case 'upcoming':
        const upcoming = consultations.filter(c => {
          const consultationDateTime = new Date(c.scheduledDate + 'T' + c.scheduledTime);
          const isUpcoming = consultationDateTime > now && c.status === 'scheduled';
          console.log(`${c.title}: ${consultationDateTime} > ${now} = ${consultationDateTime > now}, status: ${c.status}, isUpcoming: ${isUpcoming}`);
          return isUpcoming;
        });
        console.log("Upcoming consultations:", upcoming);
        return upcoming;
      case 'past':
        const past = consultations.filter(c => {
          const consultationDateTime = new Date(c.scheduledDate + 'T' + c.scheduledTime);
          return consultationDateTime < now;
        }).sort((a, b) => {
          const dateA = new Date(a.scheduledDate + 'T' + a.scheduledTime);
          const dateB = new Date(b.scheduledDate + 'T' + b.scheduledTime);
          return dateB - dateA; // Most recent first
        });
        return past;
      case 'completed':
        return consultations.filter(c => c.status === 'completed');
      case 'cancelled':
        return consultations.filter(c => c.status === 'cancelled');
      default:
        return consultations;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // FIXED: Check permissions more flexibly
  const canCreateConsultations = () => {
    const isAdmin = role === 'admin' || role === 'superadmin';
    const isDoctor = role === 'doctor';
    const isDoctorDept = department && (
      department.toLowerCase().includes('doctor') || 
      department.toLowerCase().includes('admin')
    );
    
    return isAdmin || isDoctor || isDoctorDept;
  };

  // FIXED: Check if user can manage consultations (complete/cancel)
  const canManageConsultations = () => {
    const isDoctorDept = department && department.toLowerCase().includes('doctor');
    const isAdminDept = department && department.toLowerCase().includes('admin');
    const isAdmin = role === 'admin' || role === 'superadmin';
    const isDoctor = role === 'doctor';
    
    return isDoctorDept || isAdminDept || isAdmin || isDoctor;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teleconsultation</h1>
          <p className="text-gray-600 mt-1">Manage your online consultations</p>
        </div>
        
        {canCreateConsultations() && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Schedule Consultation
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['all', 'upcoming', 'past', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab} {tab !== 'all' && 'Consultations'}
            </button>
          ))}
        </nav>
      </div>

      {/* Consultations List */}
      <div className="grid gap-6">
        {getFilteredConsultations().length === 0 ? (
          <div className="text-center py-12">
            <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No consultations</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'all' && 'No consultations found.'}
              {activeTab === 'upcoming' && 'No upcoming consultations scheduled.'}
              {activeTab === 'past' && 'No past consultations.'}
              {activeTab === 'completed' && 'No completed consultations.'}
              {activeTab === 'cancelled' && 'No cancelled consultations.'}
            </p>
          </div>
        ) : (
          getFilteredConsultations().map((consultation) => (
            <div
              key={consultation.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-full ${
                      consultation.status === 'scheduled' ? 'bg-blue-100' :
                      consultation.status === 'completed' ? 'bg-green-100' :
                      'bg-red-100'
                    }`}>
                      <VideoCameraIcon className={`w-5 h-5 ${
                        consultation.status === 'scheduled' ? 'text-blue-600' :
                        consultation.status === 'completed' ? 'text-green-600' :
                        'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {consultation.title}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        Status: <span className={`font-medium ${
                          consultation.status === 'scheduled' ? 'text-blue-600' :
                          consultation.status === 'completed' ? 'text-green-600' :
                          'text-red-600'
                        }`}>{consultation.status}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <CalendarDaysIcon className="w-4 h-4" />
                      <span className="text-sm">{formatDate(consultation.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <ClockIcon className="w-4 h-4" />
                      <span className="text-sm">{formatTime(consultation.scheduledTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <UserIcon className="w-4 h-4" />
                      <span className="text-sm">Dr. {consultation.doctorName}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <UserIcon className="w-4 h-4" />
                      <span className="text-sm">Patient: {consultation.patientName}</span>
                    </div>
                  </div>

                  {consultation.description && (
                    <p className="text-gray-700 text-sm mb-4">{consultation.description}</p>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  {consultation.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => handleJoinConsultation(consultation)}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        <PhoneIcon className="w-4 h-4 mr-1" />
                        Join
                      </button>
                      
                      {canManageConsultations() && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(consultation.id, 'completed')}
                            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                          >
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Complete
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(consultation.id, 'cancelled')}
                            className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                          >
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            Cancel
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateConsultationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateConsultation}
        />
      )}

      {showJoinModal && selectedConsultation && (
        <JoinConsultationModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          consultation={selectedConsultation}
        />
      )}
    </div>
  );
};

export default Teleconsultation;