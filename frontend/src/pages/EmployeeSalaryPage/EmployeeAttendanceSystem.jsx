import React, { useState, useEffect } from 'react';
import { ref, get, update } from 'firebase/database';
import { database } from '../../firebase/firebase';
import { DollarSign, Database, Loader, Search, Users } from 'lucide-react';
import { useAuth } from '../../context/authContext/authContext'; // Import useAuth

// Import components
import SalaryCard from './SalaryCard';
import PayrollSummary from './PayrollSummary';
import SetRateModal from './SetRateModal';
import Pagination from './Pagination';

const EmployeeSalarySystem = () => {
  const { currentUser } = useAuth(); // Get current user from auth context
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [userClinicAffiliation, setUserClinicAffiliation] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [viewMode, setViewMode] = useState('salary');
  
  // Search and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  
  // Modal states
  const [showSetRateModal, setShowSetRateModal] = useState(false);
  const [selectedEmployeeForRate, setSelectedEmployeeForRate] = useState(null);
  const [newHourlyRate, setNewHourlyRate] = useState('');
  const [savingRates, setSavingRates] = useState({});
  
  const excludedRoles = ['patient', 'specialist', 'superadmin', 'admin'];

  // Fetch current user's clinic affiliation
  useEffect(() => {
    const fetchUserClinic = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        const userRef = ref(database, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserClinicAffiliation(userData.clinicAffiliation || null);
        } else {
          console.log("No user data found");
          setUserClinicAffiliation(null);
        }
      } catch (error) {
        console.error("Error fetching user clinic:", error);
        setUserClinicAffiliation(null);
      }
    };

    fetchUserClinic();
  }, [currentUser]);

  // Fetch data from Firebase - filtered by clinic
  useEffect(() => {
    const fetchDataFromFirebase = async () => {
      if (!userClinicAffiliation) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        const usersData = usersSnapshot.exists() ? usersSnapshot.val() : {};
        
        // Filter employees by clinic affiliation
        const employeesList = Object.entries(usersData).map(([id, user]) => ({
          id,
          name: user.name || user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
          email: user.email,
          role: user.role,
          department: user.department,
          clinicAffiliation: user.clinicAffiliation,
          hourlyRate: user.hourlyRate || 0,
          isActive: user.isActive !== false,
        })).filter(emp => 
          emp.isActive && 
          !excludedRoles.includes(emp.role?.toLowerCase()) &&
          emp.clinicAffiliation === userClinicAffiliation // Filter by same clinic
        );

        const attendanceRef = ref(database, 'attendance');
        const attendanceSnapshot = await get(attendanceRef);
        const attendanceRecords = attendanceSnapshot.exists() ? attendanceSnapshot.val() : {};

        setEmployees(employeesList);
        setAttendanceData(attendanceRecords);
      } catch (error) {
        console.error('Error fetching data from Firebase:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataFromFirebase();
  }, [userClinicAffiliation]);

  const updateHourlyRateInFirebase = async (userId, newRate) => {
    try {
      const userRef = ref(database, `users/${userId}`);
      await update(userRef, { hourlyRate: parseFloat(newRate) });
      
      setEmployees(prev => prev.map(emp => 
        emp.id === userId ? { ...emp, hourlyRate: parseFloat(newRate) } : emp
      ));
      
      return true;
    } catch (error) {
      console.error('Error updating hourly rate in Firebase:', error);
      throw error;
    }
  };

  const calculateMonthlySummary = (employeeId, month) => {
    const employeeAttendance = attendanceData[employeeId];
    if (!employeeAttendance) return {
      totalHours: 0,
      regularHours: 0,
      overtimeHours: 0,
      daysWorked: 0,
      presentDays: 0
    };

    let totalHours = 0;
    let overtimeHours = 0;
    let daysWorked = 0;
    let presentDays = 0;

    const monthPrefix = month ? month : selectedMonth;
    
    Object.entries(employeeAttendance).forEach(([date, dayData]) => {
      if (date.startsWith(monthPrefix) && dayData.dailySummary) {
        const summary = dayData.dailySummary;
        totalHours += summary.totalHours || 0;
        overtimeHours += summary.overtimeHours || 0;
        daysWorked++;
        
        if (summary.status === 'Present') {
          presentDays++;
        }
      }
    });

    const regularHours = totalHours - overtimeHours;

    return { totalHours, regularHours, overtimeHours, daysWorked, presentDays };
  };

  const calculateSalary = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    const hourlyRate = employee?.hourlyRate || 0;
    const monthlySummary = calculateMonthlySummary(employeeId);
    
    const regularPay = monthlySummary.regularHours * hourlyRate;
    const overtimePay = monthlySummary.overtimeHours * hourlyRate * 1.5;
    
    return {
      ...monthlySummary,
      hourlyRate,
      regularPay,
      overtimePay,
      totalPay: regularPay + overtimePay
    };
  };

  const openSetRateModal = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setSelectedEmployeeForRate(employee);
    setNewHourlyRate(employee.hourlyRate.toString());
    setShowSetRateModal(true);
  };

  const handleSetHourlyRate = async () => {
    if (!selectedEmployeeForRate || !newHourlyRate) return;

    setSavingRates(prev => ({ ...prev, [selectedEmployeeForRate.id]: true }));
    
    try {
      await updateHourlyRateInFirebase(selectedEmployeeForRate.id, parseFloat(newHourlyRate));
      setShowSetRateModal(false);
      setSelectedEmployeeForRate(null);
      setNewHourlyRate('');
    } catch (error) {
      console.error('Failed to set hourly rate:', error);
    } finally {
      setSavingRates(prev => ({ ...prev, [selectedEmployeeForRate.id]: false }));
    }
  };

  // Search and pagination
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading employee data...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to Firebase Database</p>
        </div>
      </div>
    );
  }

  // No clinic affiliation state
  if (!userClinicAffiliation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Clinic Associated</h2>
          <p className="text-gray-600 mb-1">Your account is not associated with any clinic.</p>
          <p className="text-gray-500 text-sm">Please contact your administrator to assign a clinic.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Employee Salary System</h1>
              <p className="text-gray-600">Modern payroll calculation and management - Your Clinic</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search employees by name, email, role, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Payroll Summary */}
        <div className="mb-6">
          <PayrollSummary employees={employees} calculateSalary={calculateSalary} />
        </div>

        {/* Employee Salary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentEmployees.map(employee => {
            const salary = calculateSalary(employee.id);
            return (
              <SalaryCard
                key={employee.id}
                employee={employee}
                salary={salary}
                onSetRate={openSetRateModal}
                isSearchView={!!searchTerm}
              />
            );
          })}
        </div>

        {/* Pagination */}
        {filteredEmployees.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredEmployees.length}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Empty State */}
        {currentEmployees.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search criteria' 
                : 'No employees in your clinic yet'}
            </p>
          </div>
        )}

        {/* Set Rate Modal */}
        <SetRateModal
          isOpen={showSetRateModal}
          onClose={() => {
            setShowSetRateModal(false);
            setSelectedEmployeeForRate(null);
            setNewHourlyRate('');
          }}
          employee={selectedEmployeeForRate}
          newRate={newHourlyRate}
          setNewRate={setNewHourlyRate}
          onSave={handleSetHourlyRate}
          isSaving={savingRates[selectedEmployeeForRate?.id]}
        />
      </div>
    </div>
  );
};

export default EmployeeSalarySystem;