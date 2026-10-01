import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function JoinPartnerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ affiliateCode: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      resAddress: formData.get("resAddress"),
      officeAddress: formData.get("officeAddress"),
      mobileNo: formData.get("mobileNo"),
      whatsappNo: formData.get("whatsappNo"),
      email: formData.get("email"),
      workingArea: formData.get("workingArea"),
      courses: formData.get("courses"),
    };

    try {
      const response = await fetch("/api/partner/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessData({ affiliateCode: result.affiliateCode });
      } else {
        const error = await response.json();
        alert(error.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to submit. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    const affiliateLink = typeof window !== 'undefined' ? `${window.location.origin}/partner/${successData.affiliateCode}` : '';
    
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 pt-28">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">Your partner application has been submitted.</p>
            
            <div className="bg-blue-50 p-4 rounded-lg text-left mb-6">
              <p className="text-sm text-blue-800 font-semibold mb-2">Your Affiliate Link:</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={affiliateLink} 
                  className="flex-1 p-2 text-sm border border-blue-200 rounded bg-white"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(affiliateLink);
                    alert("Link copied!");
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                >
                  Copy
                </button>
              </div>
            </div>

            <Link
              href={`/partner/${successData.affiliateCode}/dashboard`}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Go to Affiliate Panel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 pt-28">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-yellow-400 flex items-center justify-center shadow-md shadow-yellow-400/20">
            <GraduationCap className="w-7 h-7 text-blue-950" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Join as a Partner
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Become an affiliate and earn commission per admission
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name *</label>
                <div className="mt-1">
                  <input id="name" name="name" type="text" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address *</label>
                <div className="mt-1">
                  <input id="email" name="email" type="email" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>

              <div>
                <label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                <div className="mt-1">
                  <input id="mobileNo" name="mobileNo" type="tel" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>

              <div>
                <label htmlFor="whatsappNo" className="block text-sm font-medium text-gray-700">WhatsApp Number *</label>
                <div className="mt-1">
                  <input id="whatsappNo" name="whatsappNo" type="tel" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="resAddress" className="block text-sm font-medium text-gray-700">Residential Address *</label>
                <div className="mt-1">
                  <textarea id="resAddress" name="resAddress" rows={2} required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="officeAddress" className="block text-sm font-medium text-gray-700">Office Address *</label>
                <div className="mt-1">
                  <textarea id="officeAddress" name="officeAddress" rows={2} required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>

              <div>
                <label htmlFor="workingArea" className="block text-sm font-medium text-gray-700">Working Area (City/Region) *</label>
                <div className="mt-1">
                  <input id="workingArea" name="workingArea" type="text" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>

              <div>
                <label htmlFor="courses" className="block text-sm font-medium text-gray-700">Courses to Deal With *</label>
                <div className="mt-1">
                  <input id="courses" name="courses" type="text" placeholder="e.g. BA, B.Sc, B.Com" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-blue-950 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 focus:outline-none disabled:opacity-70 transition-all duration-200"
              >
                {isSubmitting ? "Submitting..." : "Submit Registration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
