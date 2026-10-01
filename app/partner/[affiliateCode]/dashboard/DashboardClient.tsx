"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Upload, User, Users, CheckCircle, FileText } from "lucide-react";
import StudentForm from "./StudentForm";

export default function DashboardClient({ affiliate }: { affiliate: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);

  // Profile Form State
  const [businessName, setBusinessName] = useState(affiliate.businessName || "");
  const [bankAccountNo, setBankAccountNo] = useState(affiliate.bankAccountNo || "");
  const [ifscCode, setIfscCode] = useState(affiliate.ifscCode || "");

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/partner/${affiliate.affiliateCode}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, bankAccountNo, ifscCode }),
      });
      if (res.ok) {
        alert("Profile updated successfully!");
        router.refresh();
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating profile");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-blue-950 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="font-bold text-lg leading-tight">Partner Panel</h1>
              <p className="text-xs text-blue-200">Prathvi Group of College</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">{affiliate.name}</p>
            <p className="text-xs text-yellow-400">Code: {affiliate.affiliateCode}</p>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                activeTab === "profile" ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <User className="w-5 h-5" /> My Profile
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                activeTab === "students" ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Users className="w-5 h-5" /> My Students
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">Complete Your Profile</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Name (Optional)</label>
                      <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bank Account No.</label>
                      <input type="text" value={bankAccountNo} onChange={e => setBankAccountNo(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                      <input type="text" value={ifscCode} onChange={e => setIfscCode(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  {/* File Upload placeholders - would integrate Cloudinary here */}
                  <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                    <strong>Note:</strong> Document upload feature (Aadhar, PAN, Cancel check) will be enabled shortly.
                  </div>
                  <button type="submit" disabled={isUpdating} className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50">
                    {isUpdating ? "Saving..." : "Save Profile Details"}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "students" && (
              <div className="space-y-6">
                {showStudentForm ? (
                  <StudentForm 
                    affiliateId={affiliate.id} 
                    affiliateCode={affiliate.affiliateCode} 
                    onCancel={() => setShowStudentForm(false)} 
                  />
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center border-b pb-4 mb-6">
                      <h2 className="text-xl font-bold text-gray-800">My Students</h2>
                      <button 
                        onClick={() => setShowStudentForm(true)}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-blue-950 font-bold rounded-lg shadow-sm hover:shadow-md transition"
                      >
                        + Add New Student
                      </button>
                    </div>
                    
                    {affiliate.students.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No students added yet</h3>
                    <p className="text-gray-500 mt-1">Start adding students to track their admission status.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission Paid</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {affiliate.students.map((student: any) => (
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.courseInterested}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                student.admissionStatus === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {student.admissionStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.commissionPaid ? 'Yes' : 'No'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
