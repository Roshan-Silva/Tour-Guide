import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function SignIn() {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post("http://localhost:5000/api/auth/login", formData);
    console.log("Login success:", response.data);

    // Optionally store token or user info
    localStorage.setItem("token", response.data.token);

    // Redirect to homepage or dashboard
    navigate("/");

  } catch (error) {
    console.error("Login failed:", error.response?.data?.message || error.message);
    alert("Login failed: " + (error.response?.data?.message || "Unknown error"));
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-sky-500 to-indigo-500">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign In</h2>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          required
        />
        <button
          type="submit"
          className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 rounded-md transition duration-200"
        >
          Sign In
        </button>
        <p className="mt-4 text-sm text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-sky-700 underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
