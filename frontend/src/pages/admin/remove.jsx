import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
// Import your CSS file
import './remove.css'; // Assuming you create this file in the same directory

const RemoveUserForm = () => {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/admin/remove`, {
        employeeId: data.employeeId,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}` // ⬅️ Attach token to request
        }
      });

      alert(`Success: ${response.data.message}`);
      reset();
    } catch (error) {
      if (error.response) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Server error: ' + error.message);
      }
    }
  };

  return (
    <div className="form-container"> {/* Added a class for the overall form container */}
      <h2 className="form-title">Remove User</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="remove-user-form">
        <div className="form-group">
          <label htmlFor="employeeId" className="form-label">
            Employee ID
          </label>
          <input
            id="employeeId"
            type="text"
            {...register('employeeId', { required: true })}
            className="form-input" // Added a class for the input field
            placeholder="Enter Employee ID"
          />
        </div>
        <button
          type="submit"
          className="remove-user-button" // Renamed the class for the button
        >
          Remove User
        </button>
      </form>
    </div>
  );
};

export default RemoveUserForm;