import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [mode, setMode] = useState("user"); // "admin" or "user"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  // Admin login
  const handleAdminLogin = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/login", { email, password });
      const role = res.data.role;
      localStorage.setItem("role", role);
      navigate(role === "admin" ? "/admin" : "/report");
    } catch (err) {
      alert("❌ Invalid credentials");
    }
  };

  // Aadhaar verification
  const handleAadhaarVerify = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/verify_aadhaar", { aadhaar });
      if (res.data.valid) {
        await axios.post("http://127.0.0.1:5000/send_otp", { aadhaar });
        setOtpSent(true);
        alert("✅ OTP sent to your registered phone number");
      } else {
        alert("❌ Invalid Aadhaar number");
      }
    } catch (err) {
      alert("Error verifying Aadhaar");
    }
  };

  // OTP verification
  const handleOtpVerify = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/verify_otp", { aadhaar, otp });
      if (res.data.verified) {
        localStorage.setItem("role", "user");
        navigate("/report");
      } else {
        alert("❌ Invalid OTP");
      }
    } catch (err) {
      alert("Error verifying OTP");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-sm">
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => setMode("user")}
            className={`px-3 py-1 rounded ${mode === "user" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            User Login
          </button>
          <button
            onClick={() => setMode("admin")}
            className={`px-3 py-1 rounded ${mode === "admin" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Admin Login
          </button>
        </div>

        {mode === "admin" ? (
          <>
            <h1 className="text-2xl font-bold mb-4 text-center">🔑 Admin Login</h1>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 mb-3 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 mb-3 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleAdminLogin} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Login
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4 text-center">👤 User Aadhaar Login</h1>
            <input
              type="text"
              placeholder="Enter Aadhaar Number"
              className="w-full p-2 mb-3 border rounded"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value)}
            />
            {!otpSent ? (
              <button onClick={handleAadhaarVerify} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Verify Aadhaar
              </button>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="w-full p-2 mb-3 border rounded"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button onClick={handleOtpVerify} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                  Verify OTP
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
