import { useState, useEffect } from "react";
import { ref, get, set, push } from "firebase/database";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  CheckIcon,
  XMarkIcon as XIcon,
} from "@heroicons/react/24/solid";
import { auth, database } from "../../../firebase/firebase";
import UserAddRoleModal from "./userAddModal";
import AddDepartmentModal from "../Departments/AddDepartmentModal";
import DoctorsAgreementModal from "../Doctors/DoctorsAgreementModal";
import DoctorForm from "./DoctorForm";
import PatientForm from "./PatientForm";

const AddUserModal = ({ showModal, setShowModal }) => {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedClinic, setSelectedClinic] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState("");

  // Email sending states
  const [emailStatus, setEmailStatus] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  // Patient-specific states
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [address, setAddress] = useState("");
  const [prcId, setPrcId] = useState("");
  const [prcIdFile, setPrcIdFile] = useState(null);
  const [prcIdFileUrl, setPrcIdFileUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [birNumber, setBirNumber] = useState("");
  const [prcExpiry, setPrcExpiry] = useState("");
  const [showAgreement, setShowAgreement] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);

  // Password validation checklist
  const getPasswordValidation = (password) => {
    return {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    };
  };

  const passwordChecks = getPasswordValidation(password);
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  // Filter roles based on current user's role
  const getFilteredRoles = () => {
    let filteredRoles = roles.filter((role) => role !== "superadmin");

    if (currentUserRole === "admin") {
      filteredRoles = filteredRoles.filter((role) => role !== "admin");
    }

    return filteredRoles;
  };

  // Filter departments based on current user's role
  const getFilteredDepartments = () => {
    let filteredDepartments = departments.filter(
      (dept) => dept !== "SuperAdmin"
    );

    if (currentUserRole === "admin") {
      filteredDepartments = filteredDepartments.filter(
        (dept) => dept !== "admin"
      );
    }

    return filteredDepartments;
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userRef = ref(database, `users/${currentUser.uid}`);
        const userSnap = await get(userRef);
        const userData = userSnap.val();

        if (userData?.clinicAffiliation) {
          setSelectedClinic(userData.clinicAffiliation);
        }

        if (userData?.role) {
          setCurrentUserRole(userData.role);
        }

        // Set current user role for filtering
        if (userData?.role) {
          setCurrentUserRole(userData.role);
        }
      }

      // Load all clinics
      const clinicSnap = await get(ref(database, "clinics"));
      if (clinicSnap.exists()) {
        const clinicList = Object.entries(clinicSnap.val()).map(
          ([id, data]) => ({
            id,
            name: data.name || id,
          })
        );
        setClinics(clinicList);
      }

      // Load roles
      const rolesSnap = await get(ref(database, "roles"));
      if (rolesSnap.exists()) setRoles(Object.keys(rolesSnap.val()));

      // Load departments
      const deptSnap = await get(ref(database, "departments"));
      if (deptSnap.exists()) setDepartments(Object.keys(deptSnap.val()));
    };

    fetchInitialData();
  }, []);

  const resetForm = () => {
    setFirstName("");
    setAddress("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setSelectedDepartment("");
    setSelectedClinic("");
    setSelectedRole("");
    setContactNumber("");
    setDateOfBirth("");
    setGender("");
    setBloodType("");
    setAllergies("");
    setMedicalConditions("");
    setEmergencyContactName("");
    setEmergencyRelationship("");
    setEmergencyPhone("");
    setPrcId("");
    setPrcExpiry("");
    setError("");
    setBirNumber("");
    setEmailStatus("");
  };

  const validatePassword = (password) => {
    return (
      password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    );
  };

  // Email sending configuration for Mailjet
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  // Function to send welcome email via Mailjet
  const sendWelcomeEmail = async (userEmail, userPassword, userName) => {
    setIsEmailLoading(true);
    setEmailStatus("Connecting to Mailjet email service...");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout

      console.log("Sending email request to:", `${API_URL}/add-user`);

      const response = await fetch(`${API_URL}/add-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: userName,
          email: userEmail,
          password: userPassword,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log("Mailjet email sent successfully:", result);
        setEmailStatus("✅ Welcome email sent successfully!");
        return { success: true, data: result };
      } else {
        let errorMessage = "Unknown error";
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.error || errorData.details || "Unknown error";
          console.error("Mailjet email error response:", errorData);
        } catch (jsonError) {
          errorMessage = `Server error (${response.status})`;
        }
        setEmailStatus(`⚠️ Email sending failed: ${errorMessage}`);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error("Email sending error:", error);

      if (error.name === "AbortError") {
        setEmailStatus(
          "⏱️ Request timeout. Server may be starting up (free tier cold start). Account created successfully."
        );
        return { success: false, error: "timeout" };
      } else if (
        error.name === "TypeError" &&
        error.message.includes("fetch")
      ) {
        setEmailStatus(
          "⚠️ Email service unavailable. Account created successfully without email notification."
        );
        return { success: false, error: "network" };
      } else {
        setEmailStatus(
          "⚠️ Failed to send welcome email. Account was created successfully."
        );
        return { success: false, error: error.message };
      }
    } finally {
      setIsEmailLoading(false);
    }
  };

  const closeSuccessModal = () => {
    setSuccess(false);
    setShowModal(false);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailStatus("");

    if (selectedRole === "doctor" && !hasAgreed) {
      setShowAgreement(true);
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 6 characters long, contain an uppercase letter, a lowercase letter, and a number."
      );
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      // Create user account in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;

      // Create user record in database using the same UID
      const userRef = ref(database, `users/${userId}`);
      await set(userRef, {
        department: selectedRole === "patient" ? null : selectedDepartment,
        clinicAffiliation: selectedRole === "patient" ? null : selectedClinic,
        firstName,
        lastName,
        contactNumber,
        email,
        role: selectedRole,
        createdAt: new Date().toISOString(),
      });

      // If role is doctor, create doctor record using the SAME UID
      if (selectedRole === "doctor") {
        const doctorRef = ref(database, `doctors/${userId}`);
        await set(doctorRef, {
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          department: selectedDepartment,
          specialty: "Generalist",
          isGeneralist: true,
          clinicAffiliations: [selectedClinic],
          contactNumber,
          prcId,
          prcExpiry,
          birNumber,
          createdAt: new Date().toISOString(),
        });
      }

      // If role is patient, create patient record using the SAME UID
      if (selectedRole === "patient") {
        const patientRef = ref(database, `patients/${userId}`);
        await set(patientRef, {
          firstName,
          lastName,
          dateOfBirth,
          gender,
          address,
          bloodType,
          contactNumber,
          allergies: allergies
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          medicalConditions: medicalConditions
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          emergencyContact: {
            name: emergencyContactName,
            relationship: emergencyRelationship,
            phone: emergencyPhone,
          },
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        });
      }

      // Send welcome email after successful account creation
      sendWelcomeEmail(email, password, firstName).catch((emailError) => {
        console.warn(
          "Email sending failed, but account was created successfully:",
          emailError
        );
        setEmailStatus(
          "Account created successfully, but welcome email could not be sent."
        );
      });

      setSuccess(true);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showModal) return null;

  // Updated handleAddRole function to auto-fill the role field
  const handleAddRole = async (newRole, roleKey) => {
    const roleData = newRole[roleKey];

    try {
      await set(ref(database, `roles/${roleKey}`), roleData);
      setRoles((prevRoles) => [...new Set([...prevRoles, roleKey])]);
      // Auto-fill the newly created role
      setSelectedRole(roleKey);
    } catch (err) {
      console.error("Error adding role:", err);
    }
  };

  // Updated handleAddDepartment function to auto-fill the department field
  const handleAddDepartment = async (newDepartment, departmentKey) => {
    const deptData = newDepartment[departmentKey];

    try {
      await set(
        ref(database, `departments/${departmentKey}`),
        deptData.permissions
      );
      setDepartments((prev) => [...new Set([...prev, departmentKey])]);
      // Auto-fill the newly created department
      setSelectedDepartment(departmentKey);
    } catch (err) {
      console.error("Error adding department:", err);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold text-white">
              Create User Account
            </h2>
            <p className="text-blue-100 mt-1">Add a new user to the system</p>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <form onSubmit={handleCreateAccount} className="p-8 space-y-8">
              {/* User Information Section */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <div className="w-2 h-6 bg-blue-600 rounded-full mr-3"></div>
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="Enter last name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="Enter contact number"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                {/* Password Section with Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {/* Password Checklist */}
                    {password && (
                      <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Password Requirements:
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            {passwordChecks.length ? (
                              <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <XIcon className="h-4 w-4 text-red-500 mr-2" />
                            )}
                            <span
                              className={
                                passwordChecks.length
                                  ? "text-green-700"
                                  : "text-red-700"
                              }
                            >
                              At least 6 characters
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            {passwordChecks.uppercase ? (
                              <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <XIcon className="h-4 w-4 text-red-500 mr-2" />
                            )}
                            <span
                              className={
                                passwordChecks.uppercase
                                  ? "text-green-700"
                                  : "text-red-700"
                              }
                            >
                              One uppercase letter
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            {passwordChecks.lowercase ? (
                              <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <XIcon className="h-4 w-4 text-red-500 mr-2" />
                            )}
                            <span
                              className={
                                passwordChecks.lowercase
                                  ? "text-green-700"
                                  : "text-red-700"
                              }
                            >
                              One lowercase letter
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            {passwordChecks.number ? (
                              <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <XIcon className="h-4 w-4 text-red-500 mr-2" />
                            )}
                            <span
                              className={
                                passwordChecks.number
                                  ? "text-green-700"
                                  : "text-red-700"
                              }
                            >
                              One number
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Role Selection Section */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <div className="w-2 h-6 bg-purple-600 rounded-full mr-3"></div>
                  User Role
                </h3>

                <div className="space-y-2">
                  <label className="flex justify-between items-center text-sm font-medium text-gray-700">
                    <span>
                      Select Role <span className="text-red-500">*</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddRoleModal(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-xs rounded-full transition-colors duration-200"
                    >
                      + Add Role
                    </button>
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="" disabled>
                      Select a role
                    </option>
                    {getFilteredRoles().map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Doctor Form */}
              {selectedRole === "doctor" && (
                <DoctorForm
                  prcId={prcId}
                  setPrcId={setPrcId}
                  prcExpiry={prcExpiry}
                  setPrcExpiry={setPrcExpiry}
                  birNumber={birNumber}
                  setBirNumber={setBirNumber}
                  prcIdFile={prcIdFile}
                  setPrcIdFile={setPrcIdFile}
                  prcIdFileUrl={prcIdFileUrl}
                  setPrcIdFileUrl={setPrcIdFileUrl}
                  selectedDepartment={selectedDepartment}
                  setSelectedDepartment={setSelectedDepartment}
                  selectedClinic={selectedClinic}
                  setSelectedClinic={setSelectedClinic}
                  departments={departments}
                  clinics={clinics}
                  getFilteredDepartments={getFilteredDepartments}
                  setShowAddDepartmentModal={setShowAddDepartmentModal}
                />
              )}

              {/* Patient Form */}
              {selectedRole === "patient" && (
                <PatientForm
                  address={address}
                  setAddress={setAddress}
                  dateOfBirth={dateOfBirth}
                  setDateOfBirth={setDateOfBirth}
                  gender={gender}
                  setGender={setGender}
                  bloodType={bloodType}
                  setBloodType={setBloodType}
                  allergies={allergies}
                  setAllergies={setAllergies}
                  medicalConditions={medicalConditions}
                  setMedicalConditions={setMedicalConditions}
                  emergencyContactName={emergencyContactName}
                  setEmergencyContactName={setEmergencyContactName}
                  emergencyRelationship={emergencyRelationship}
                  setEmergencyRelationship={setEmergencyRelationship}
                  emergencyPhone={emergencyPhone}
                  setEmergencyPhone={setEmergencyPhone}
                />
              )}

              {/* Other roles (non-doctor, non-patient) */}
              {selectedRole &&
                selectedRole !== "patient" &&
                selectedRole !== "doctor" && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                      <div className="w-2 h-6 bg-indigo-600 rounded-full mr-3"></div>
                      Role & Affiliation
                    </h3>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Clinic Affiliation{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <select
                        value={selectedClinic}
                        onChange={(e) => setSelectedClinic(e.target.value)}
                        required
                        disabled={currentUserRole !== "superadmin"} // 👈 disables dropdown for non-superadmins
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
      focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white 
      ${
        currentUserRole !== "superadmin" ? "opacity-60 cursor-not-allowed" : ""
      }`}
                      >
                        <option value="" disabled>
                          {currentUserRole !== "superadmin"
                            ? "You are restricted to your assigned clinic"
                            : "Select a clinic"}
                        </option>

                        {clinics.map((clinic) => (
                          <option key={clinic.id} value={clinic.id}>
                            {clinic.name}
                          </option>
                        ))}
                      </select>

                      {/* Info note for clarity */}
                      {currentUserRole !== "superadmin" && (
                        <p className="text-xs text-gray-500 italic mt-1">
                          Only superadmins can change clinic affiliation.
                        </p>
                      )}

                      <div className="space-y-2">
                        <label className="flex justify-between items-center text-sm font-medium text-gray-700">
                          <span>
                            Select Department{" "}
                            <span className="text-red-500">*</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowAddDepartmentModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs rounded-full transition-colors duration-200"
                          >
                            + Add Department
                          </button>
                        </label>
                        <select
                          value={selectedDepartment}
                          onChange={(e) =>
                            setSelectedDepartment(e.target.value)
                          }
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        >
                          <option value="" disabled>
                            Select a department
                          </option>
                          {getFilteredDepartments().map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <XIcon className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Email Status Display */}
              {emailStatus && (
                <div
                  className={`rounded-lg p-4 border ${
                    emailStatus.includes("successfully")
                      ? "bg-green-50 text-green-700 border-green-200"
                      : emailStatus.includes("Failed") ||
                        emailStatus.includes("failed")
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {isEmailLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>
                      <span className="text-sm">{emailStatus}</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {emailStatus.includes("successfully") ? (
                        <CheckIcon className="h-5 w-5 mr-2" />
                      ) : (
                        <XIcon className="h-5 w-5 mr-2" />
                      )}
                      <span className="text-sm">{emailStatus}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    disabled={isLoading || isEmailLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserAddRoleModal
        showModal={showAddRoleModal}
        setShowModal={setShowAddRoleModal}
        onAddRole={handleAddRole}
      />

      <AddDepartmentModal
        showModal={showAddDepartmentModal}
        setShowModal={setShowAddDepartmentModal}
        onAddDepartment={handleAddDepartment}
      />

      <DoctorsAgreementModal
        show={showAgreement}
        onClose={() => setShowAgreement(false)}
        onAgree={() => setHasAgreed(true)}
      />

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckIcon className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Success!
              </h2>
              <p className="text-gray-600 mb-4">
                The user account has been created successfully.
              </p>
              {emailStatus && (
                <div
                  className={`text-sm mb-6 p-3 rounded-lg ${
                    emailStatus.includes("successfully")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-orange-50 text-orange-700 border border-orange-200"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <span className="mr-2">📧</span>
                    <span>{emailStatus}</span>
                  </div>
                </div>
              )}
              <button
                onClick={closeSuccessModal}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddUserModal;
