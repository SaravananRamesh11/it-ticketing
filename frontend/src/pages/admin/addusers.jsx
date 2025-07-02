import { useForm } from "react-hook-form";
import React from "react";
import axios from "axios";

function EmployeeRegistrationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      console.log(data);
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await axios.post(`${apiUrl}/api/admin/add_users`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}` // ⬅️ Attach token to request
        }
      }

      );
      alert(res.data.message);
    } catch (error) {
      console.log(error);
      const message = error.response?.data?.message;
      alert(message || "Registration failed");
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "100vh",
      backgroundColor: "#f5f5f5"
    }}>
      <div style={{
        width: "400px",
        padding: "30px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
        backgroundColor: "white"
      }}>
        <h2 style={{
          textAlign: "center",
          marginBottom: "25px",
          color: "#333"
        }}>Employee Registration</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#555"
            }} htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxSizing: "border-box",
                fontSize: "14px"
              }}
              {...register("employeeName", { required: "Name is required" })}
            />
            {errors.employeeName && <span style={{
              color: "#e74c3c",
              fontSize: "13px",
              display: "block",
              marginTop: "5px"
            }}>{errors.employeeName.message}</span>}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#555"
            }} htmlFor="employeeId">Employee ID</label>
            <input
              id="employeeId"
              type="text"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxSizing: "border-box",
                fontSize: "14px"
              }}
              {...register("employeeId", {
                required: "Employee ID is required",
                pattern: {
                  value: /^[A-Za-z0-9]+$/,
                  message: "Employee ID should be alphanumeric",
                },
              })}
            />
            {errors.employeeId && (
              <span style={{
                color: "#e74c3c",
                fontSize: "13px",
                display: "block",
                marginTop: "5px"
              }}>{errors.employeeId.message}</span>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#555"
            }} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxSizing: "border-box",
                fontSize: "14px"
              }}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <span style={{
                color: "#e74c3c",
                fontSize: "13px",
                display: "block",
                marginTop: "5px"
              }}>{errors.email.message}</span>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#555"
            }} htmlFor="role">Role</label>
            <select
              id="role"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxSizing: "border-box",
                fontSize: "14px"
              }}
              {...register("role", { required: "Role is required" })}
            >
              <option value="">Select a role</option>
              <option value="Admin">Admin</option>
              <option value="Employee">Employee</option>
              <option value="IT Support">IT Support</option>
            </select>
            {errors.role && <span style={{
              color: "#e74c3c",
              fontSize: "13px",
              display: "block",
              marginTop: "5px"
            }}>{errors.role.message}</span>}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#555"
            }} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxSizing: "border-box",
                fontSize: "14px"
              }}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 2,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            {errors.password && (
              <span style={{
                color: "#e74c3c",
                fontSize: "13px",
                display: "block",
                marginTop: "5px"
              }}>{errors.password.message}</span>
            )}
          </div>

          <button 
            type="submit" 
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              transition: "background-color 0.3s"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2980b9"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#3498db"}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmployeeRegistrationForm;