"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AdminPanel = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();
  const [claimHistory, setClaimHistory] = useState([]);
  const [claimStats, setClaimStats] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isModify, setModify] = useState(false);
  const [couponId, setCouponID] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
    } else {
      setAdminToken(token);
      fetchCoupons(token);
      fetchClaimHistory(token);
    }
  }, []);

  const showSuccessNotification = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const fetchCoupons = async (token) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setCoupons(data);
      else setError(data.message || "Failed to load coupons");
    } catch (err) {
      setError("Failed to load coupons.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/admin/coupon/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (response.ok) {
        fetchCoupons(adminToken);
        fetchClaimHistory(adminToken);
        showSuccessNotification("Coupon deleted successfully!");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete coupon");
      }
    } catch (err) {
      setError("Failed to delete coupon.");
    } finally {
      setLoading(false);
    }
  };

  const fetchClaimHistory = async (token) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/claims`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setClaimHistory(data.claimHistory);
        setClaimStats(data.claimStats);
      }
      setError(null);
    } catch (err) {
      setError("Failed to load claim history. Please try again later.");
      console.error("Error fetching claim history:", err);
    } finally {
      setLoading(false);
    }
  };

  const modifyCoupon = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/admin/coupon/update/${couponId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ newCode: newCoupon }),
        }
      );

      if (response.ok) {
        fetchCoupons(adminToken);
        fetchClaimHistory(adminToken);
        showSuccessNotification("Coupon modified successfully!");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to modify coupon");
      }
    } catch (err) {
      setError("Failed to modify coupon.");
    } finally {
      setModify(false);
      setNewCoupon("");
      setCouponID("");
      setLoading(false);
    }
  };

  const addCoupon = async () => {
    if (!newCoupon.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/admin/coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ code: newCoupon }),
      });

      const data = await response.json();
      if (response.ok) {
        fetchCoupons(adminToken);
        setNewCoupon("");
        showSuccessNotification(data.message || "Coupon added successfully!");
      } else {
        setError(data.message || "Error adding coupon");
      }
    } catch (err) {
      setError("Error adding coupon.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCoupon = async (id, isActive) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/admin/coupon/toggle/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ is_active: !isActive }),
        }
      );

      if (response.ok) {
        setCoupons((prevCoupons) =>
          prevCoupons.map((c) =>
            c._id === id ? { ...c, is_active: !isActive } : c
          )
        );
        showSuccessNotification(
          `Coupon ${isActive ? "disabled" : "enabled"} successfully!`
        );
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update coupon");
      }
    } catch (err) {
      setError("Failed to update coupon.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#0B192C" }} className="min-h-screen">
      {/* Top Navigation Bar */}
      <div className="text-white shadow-md">
        <div className="container mx-auto py-4 px-6">
          <h1 className="text-2xl md:text-3xl font-bold">Coupon Admin Panel</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-6 px-4 md:px-6">
        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow">
            <div className="flex">
              <div className="py-1">
                <svg
                  className="w-6 h-6 mr-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="font-bold">Success</p>
                <p className="text-sm">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow">
            <div className="flex">
              <div className="py-1">
                <svg
                  className="w-6 h-6 mr-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="font-bold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Add Coupon Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
            {isModify ? "Modify coupon" : "Add New Coupon"}
          </h2>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              value={newCoupon}
              onChange={(e) => setNewCoupon(e.target.value)}
              className="border text-black border-gray-300 p-2 rounded-md flex-grow focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter Coupon Code"
              onKeyDown={(e) => {
                if (e.key === "Enter") addCoupon();
              }}
            />
            <button
              onClick={isModify ? modifyCoupon : addCoupon}
              disabled={loading}
              style={{ cursor: `${loading ? "not-allowed" : "pointer"}` }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding...
                </span>
              ) : isModify ? (
                "Update"
              ) : (
                "Add Coupon"
              )}
            </button>
          </div>
        </div>

        {/* Coupon List Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-bold text-gray-800">Manage Coupons</h2>
            <button
              style={{ cursor: "pointer" }}
              onClick={() => fetchCoupons(adminToken)}
              className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm"
              disabled={loading}
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              Refresh
            </button>
          </div>

          {loading && coupons.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <svg
                className="animate-spin h-8 w-8 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="mt-2 text-lg font-medium">No coupons found</p>
              <p className="mt-1">
                Create your first coupon using the form above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Code
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Usage
                    </th>
                    <th
                      scope="col"
                      colSpan={3}
                      className="px-4 py-3 text-center text-xs font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.map((coupon) => (
                    <tr
                      key={coupon._id || `coupon-${coupon.code}`}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-lg text-sm mr-2">
                            {coupon.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            coupon.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {coupon.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            coupon.is_claimed
                              ? "bg-gray-300 text-gray-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {coupon.is_claimed ? "Claimed" : "Available"}
                        </span>
                        {coupon.is_claimed && (
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <span className="text-black text-xs">
                              Claimed By IP : {coupon.claimed_by.ip_address}
                            </span>
                            <span className="text-black text-xs">
                              Claimed on :
                              {new Date(
                                coupon.claimed_by.claimed_at
                              ).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          className={`px-3 py-1 rounded-md bg-blue-500 text-white transition duration-150 disabled:opacity-50`}
                          onClick={() => {
                            setModify(true),
                              setNewCoupon(coupon.code),
                              setCouponID(coupon._id);
                          }}
                          disabled={
                            (coupon.is_claimed ? true : false) || loading
                          }
                          style={{
                            cursor: coupon.is_claimed
                              ? "not-allowed"
                              : "pointer",
                          }}
                          title={
                            coupon.is_claimed
                              ? "Claimed coupons cannot be modified"
                              : ""
                          }
                        >
                          Modify
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          className={`px-3 py-1 rounded-md ${
                            coupon.is_active
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-green-500 hover:bg-green-600"
                          } text-white transition duration-150 disabled:opacity-50`}
                          onClick={() =>
                            toggleCoupon(coupon._id, coupon.is_active)
                          }
                          disabled={
                            (coupon.is_claimed ? true : false) || loading
                          }
                          style={{
                            cursor: coupon.is_claimed
                              ? "not-allowed"
                              : "pointer",
                          }}
                          title={
                            coupon.is_claimed
                              ? "Claimed coupons cannot be disabled"
                              : ""
                          }
                        >
                          {coupon.is_active ? "Disable" : "Enable"}
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className={`px-3 py-1 rounded-md text-red-900 border border-red-900 transition duration-150 disabled:opacity-50`}
                          onClick={() => deleteCoupon(coupon._id)}
                          disabled={loading}
                          style={{ cursor: "pointer" }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-bold text-gray-800">
              Coupon Claim History
            </h2>
          </div>
          {claimHistory.length === 0 ? (
            <p className="text-gray-500 text-center">
              No claimed coupons found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Code
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Claimed By (IP Address)
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Claimed On (Date & Time)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-black">
                  {claimHistory.map((coupon, index) => (
                    <tr
                      key={coupon._id}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-lg text-sm mr-2">
                          {coupon.code || "Unnamed Coupon"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {coupon.claimed_by?.ip_address || "Unknown"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {new Date(coupon.claimed_by.claimed_at).toLocaleString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-bold text-gray-800">
              IP-wise Coupon Claims
            </h2>
          </div>

          {claimStats.length === 0 ? (
            <p className="text-gray-500 text-center">
              No claim records available.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                  >
                    IP Address
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                  >
                    Total Coupons Claimed
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                  >
                    Coupons
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-black">
                {claimStats.map((stat, index) => (
                  <tr
                    key={stat.ip_address}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      {stat.ip_address}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {stat.total_claimed}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {stat.coupons.map((coupon, i) => (
                        <span
                          key={i}
                          className="inline-block bg-blue-200 text-blue-800 px-2 py-1 rounded-lg text-sm mr-2"
                        >
                          {coupon}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
