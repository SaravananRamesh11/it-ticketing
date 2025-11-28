import { useForm } from "react-hook-form";
import React from "react";
import axios from "axios";
import './addusers.css';

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
    <div className="create-user-container">
      <div className="create-user-card">
        <h2 className="create-user-title">Employee Registration</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="create-user-form">
          <div className="create-user-form-group">
            <label className="create-user-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="create-user-input"
              placeholder="Enter full name"
              {...register("employeeName", { required: "Name is required" })}
            />
            {errors.employeeName && <span className="create-user-error">{errors.employeeName.message}</span>}
          </div>

          <div className="create-user-form-group">
            <label className="create-user-label" htmlFor="employeeId">Employee ID</label>
            <input
              id="employeeId"
              type="text"
              className="create-user-input"
              placeholder="Enter employee ID"
              {...register("employeeId", {
                required: "Employee ID is required",
                pattern: {
                  value: /^[A-Za-z0-9]+$/,
                  message: "Employee ID should be alphanumeric",
                },
              })}
            />
            {errors.employeeId && (
              <span className="create-user-error">{errors.employeeId.message}</span>
            )}
          </div>

          <div className="create-user-form-group">
            <label className="create-user-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="create-user-input"
              placeholder="Enter email address"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <span className="create-user-error">{errors.email.message}</span>
            )}
          </div>

          <div className="create-user-form-group">
            <label className="create-user-label" htmlFor="role">Role</label>
            <select
              id="role"
              className="create-user-select"
              {...register("role", { required: "Role is required" })}
            >
              <option value="">Select a role</option>
              <option value="Admin">Admin</option>
              <option value="Employee">Employee</option>
              <option value="IT Support">IT Support</option>
            </select>
            {errors.role && <span className="create-user-error">{errors.role.message}</span>}
          </div>

          <div className="create-user-form-group">
            <label className="create-user-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="create-user-input"
              placeholder="Enter password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 2,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            {errors.password && (
              <span className="create-user-error">{errors.password.message}</span>
            )}
          </div>

          <button type="submit" className="create-user-button">
            Register Employee
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmployeeRegistrationForm;