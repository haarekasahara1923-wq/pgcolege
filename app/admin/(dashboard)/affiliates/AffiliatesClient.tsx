"use client";

import { useState } from "react";
import { Users, FileText, Check, X, Ban, Download } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AffiliatesClient({ initialAffiliates }: { initialAffiliates: any[] }) {
  const [affiliates, setAffiliates] = useState(initialAffiliates);
  const router = useRouter();

  const toggleBlock = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/affiliates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !currentStatus })
      });
      if (res.ok) {
        setAffiliates(affiliates.map(a => a.id === id ? { ...a, isBlocked: !currentStatus } : a));
        router.refresh();
      }
    } catch (e) {
      alert("Error updating status");
    }
  };

  const approveAffiliate = async (id: string) => {
    const rate = prompt("Enter Commission Rate (e.g. 10% or ₹5000):");
    if (!rate) return;

    try {
      const res = await fetch(`/api/admin/affiliates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true, commissionRate: rate })
      });
      if (res.ok) {
        setAffiliates(affiliates.map(a => a.id === id ? { ...a, isApproved: true, commissionRate: rate } : a));
        router.refresh();
      }
    } catch (e) {
      alert("Error approving");
    }
  };

  const generateWelcomeLetter = (affiliate: any) => {
    // Generate an HTML string for the welcome letter
    const htmlContent = `
      <html>
        <head>
          <title>Welcome Letter - ${affiliate.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { max-height: 80px; }
            h1 { color: #1e3a8a; margin: 10px 0 0 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
            .content { line-height: 1.6; }
            .commission { font-weight: bold; font-size: 18px; color: #b45309; padding: 15px; background: #fffbeb; border: 1px dashed #f59e0b; margin: 20px 0; text-align: center; }
            .footer { margin-top: 60px; border-top: 1px solid #ccc; padding-top: 20px; }
            .signature-box { display: flex; justify-content: space-between; margin-top: 50px; }
            .sign-line { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Prathvi Group of College</h1>
            <p>Empowering Education, Shaping Futures</p>
          </div>
          <div class="content">
            <p>Date: ${new Date().toLocaleDateString()}</p>
            <p><strong>To,</strong><br/>
               ${affiliate.name}<br/>
               ${affiliate.resAddress}<br/>
               Mobile: ${affiliate.mobileNo}
            </p>
            <h3>Subject: Welcome to Prathvi Group of College Affiliate Partner Program</h3>
            <p>Dear ${affiliate.name},</p>
            <p>We are thrilled to welcome you as an official Affiliate Partner of Prathvi Group of College. Your affiliate code is <strong>${affiliate.affiliateCode}</strong>.</p>
            
            <div class="commission">
              Approved Commission Rate: ${affiliate.commissionRate}
            </div>

            <p>As an authorized partner, you are eligible to refer students to our courses and earn the approved commission upon successful admission and fee payment.</p>
            
            <div class="footer">
              <p><strong>Acceptance & Agreement:</strong></p>
              <p>I hereby accept the terms of the affiliate program and the commission structure outlined above.</p>
              <div class="signature-box">
                <div class="sign-line">Authorized Signatory (College)</div>
                <div class="sign-line">Affiliate Signature</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Affiliate Partners</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {affiliates.map((affiliate) => (
              <tr key={affiliate.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{affiliate.name}</div>
                  <div className="text-sm text-gray-500">Code: {affiliate.affiliateCode}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {affiliate.mobileNo}<br/>{affiliate.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-center font-bold">
                  {affiliate.studentsCount}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {affiliate.commissionRate || "Not set"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    affiliate.isBlocked ? 'bg-red-100 text-red-800' :
                    affiliate.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {affiliate.isBlocked ? 'Blocked' : affiliate.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {!affiliate.isApproved && !affiliate.isBlocked && (
                      <button onClick={() => approveAffiliate(affiliate.id)} className="text-green-600 hover:text-green-900" title="Approve & Set Commission">
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    {affiliate.isApproved && (
                      <button onClick={() => generateWelcomeLetter(affiliate)} className="text-blue-600 hover:text-blue-900" title="Generate Welcome Letter (PDF)">
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                    <button onClick={() => toggleBlock(affiliate.id, affiliate.isBlocked)} className={`${affiliate.isBlocked ? 'text-gray-600' : 'text-red-600'} hover:text-red-900`} title={affiliate.isBlocked ? "Unblock" : "Block"}>
                      {affiliate.isBlocked ? <Check className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
