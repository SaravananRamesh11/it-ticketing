// // 

// import React from 'react';
// import { useForm } from 'react-hook-form';
// import axios from 'axios';

// const RemoveUserForm = () => {
//   const { register, handleSubmit, reset } = useForm();

//   const onSubmit = async (data) => {
//     try {
//       const response = await axios.post('http://localhost:5000/api/admin/remove', {
//         employeeId: data.employeeId,
//       });

//       alert(`Success: ${response.data.message}`);
//       reset();
//     } catch (error) {
//       if (error.response) {
//         alert(`Error: ${error.response.data.message}`);
//       } else {
//         alert('Server error: ' + error.message);
//       }
//     }
//   };

//   return (
//     <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
//       <h2 className="mb-6 text-2xl font-bold text-gray-800">Remove User</h2>
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         <div>
//           <label htmlFor="employeeId" className="block mb-2 text-sm font-medium text-gray-700">
//             Employee ID
//           </label>
//           <input
//             id="employeeId"
//             type="text"
//             {...register('employeeId', { required: true })}
//             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//             placeholder="Enter Employee ID"
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
//         >
//           Remove User
//         </button>
//       </form>
//     </div>
//   );
// };

// export default RemoveUserForm;



// import React from 'react';
// import { useForm } from 'react-hook-form';
// import axios from 'axios';

// const RemoveUserForm = () => {
//   const { register, handleSubmit, reset } = useForm();

//   const onSubmit = async (data) => {
//     try {
//       const response = await axios.post('http://localhost:5000/api/admin/remove', {
//         employeeId: data.employeeId,
//       });

//       alert(`Success: ${response.data.message}`);
//       reset();
//     } catch (error) {
//       if (error.response) {
//         alert(`Error: ${error.response.data.message}`);
//       } else {
//         alert('Server error: ' + error.message);
//       }
//     }
//   };

//   return (
//     <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
//       <h2 className="mb-6 text-2xl font-bold text-gray-800">Remove User</h2>
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         <div>
//           <label htmlFor="employeeId" className="block mb-2 text-sm font-medium text-gray-700">
//             Employee ID
//           </label>
//           <input
//             id="employeeId"
//             type="text"
//             {...register('employeeId', { required: true })}
//             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//             placeholder="Enter Employee ID"
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 ease-in-out
//                      shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
//         >
//           Remove User
//         </button>
//       </form>
//     </div>
//   );
// };

// export default RemoveUserForm;




import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
// Import your CSS file
import './remove.css'; // Assuming you create this file in the same directory

const RemoveUserForm = () => {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('http://localhost:5000/api/admin/remove', {
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