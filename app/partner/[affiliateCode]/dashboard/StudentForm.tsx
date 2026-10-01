"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentForm({ affiliateId, affiliateCode, onCancel }: { affiliateId: string, affiliateCode: string, onCancel: () => void }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Core details
  const [name, setName] = useState("");
  const [courseInterested, setCourseInterested] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [whatsappNo, setWhatsappNo] = useState("");

  // We are skipping the actual Cloudinary upload logic here for brevity, 
  // but normally you would use the uploadToCloudinary function 
  // similar to what exists in AboutClient.tsx
  const [docUrls, setDocUrls] = useState<Record<string, string>>({});

  const handleSimulatedUpload = (key: string) => {
    // Simulated upload for demonstration purposes
    setDocUrls(prev => ({ ...prev, [key]: "https://res.cloudinary.com/demo/image/upload/sample.jpg" }));
    alert(`File uploaded successfully for ${key}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = {
      name,
      courseInterested,
      mobileNo,
      whatsappNo,
      affiliateId,
      ...docUrls
    };

    try {
      const res = await fetch(`/api/partner/${affiliateCode}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        alert("Student added successfully");
        router.refresh();
        onCancel(); // Close form
      } else {
        alert("Failed to add student");
      }
    } catch (e) {
      console.error(e);
      alert("Error adding student");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h3 className="text-lg font-bold text-gray-800">Add New Student</h3>
        <button onClick={onCancel} className="text-gray-500 hover:text-red-500">Close</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mandatory Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Student Name *</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Course Interested *</label>
            <input required type="text" value={courseInterested} onChange={e => setCourseInterested(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile No *</label>
            <input required type="tel" value={mobileNo} onChange={e => setMobileNo(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">WhatsApp No *</label>
            <input required type="tel" value={whatsappNo} onChange={e => setWhatsappNo(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-100">
          <h4 className="font-semibold text-gray-800 mb-4">Document Uploads (Optional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["aadharCardUrl", "panCardUrl", "aparIdUrl", "samagraIdUrl", "tenthMarksheetUrl", "twelfthMarksheetUrl", "graduationMarksheetUrl", "photoUrl"].map(doc => (
              <div key={doc} className="border p-3 rounded bg-gray-50 flex justify-between items-center">
                <span className="text-xs font-medium text-gray-600">
                  {doc.replace("Url", "").replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                </span>
                <button type="button" onClick={() => handleSimulatedUpload(doc)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {docUrls[doc] ? 'Uploaded' : 'Upload'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            {isSubmitting ? "Saving..." : "Submit Student"}
          </button>
        </div>
      </form>
    </div>
  );
}
