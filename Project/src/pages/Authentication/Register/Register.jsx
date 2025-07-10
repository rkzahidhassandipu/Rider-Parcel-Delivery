import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router"; // ✅ FIXED
import useAuth from "../../../hooks/useAuth";
import { FaUserAlt } from "react-icons/fa";
import axios from "axios";
import useAxios from "../../../hooks/useAxios";

const Register = () => {
  const { createUser, updateUserProfile } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const location = useLocation();
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState("");
  const axiosInstance = useAxios();

  const from = location.state?.from?.pathname || "/"; // ✅ Correct redirect path
  console.log("Redirect target:", from); // ✅ Debug check

  const onSubmit = async (data) => {
    try {
      const result = await createUser(data.email, data.password);
      const user = result.user;

      const userInfo = {
        email: user.email,
        role: "user",
        create_at: new Date().toISOString(),
        last_log_in: new Date().toISOString(),
      };

      await axiosInstance.post("users", userInfo);

      const userProfile = {
        displayName: data.name,
        photoURL: profilePic,
      };

      await updateUserProfile(userProfile);
      console.log("✅ Profile updated");

      navigate(from, { replace: true }); // ✅ Go to original route
    } catch (error) {
      console.error("Registration Error:", error);
    }
  };

  const handlePreview = async (e) => {
    const image = e.target.files[0];
    const formData = new FormData();
    formData.append("image", image);

    const imageUploadUrl = `https://api.imgbb.com/1/upload?expiration=600&key=${
      import.meta.env.VITE_image_upload_key
    }`;
    const res = await axios.post(imageUploadUrl, formData);
    setProfilePic(res.data.data.url);
  };

  return (
    <div className="flex justify-center items-center bg-base-200 my-10">
      <div className="card bg-base-100 w-full py-10">
        <div className="text-start">
          <h2 className="text-4xl font-bold">Create an Account</h2>
          <p>Register with Profast</p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="fieldset space-y-4">
              <label className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700">
                <FaUserAlt />
                <span>Upload Profile Image</span>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="hidden"
                  {...register("profileImage", { required: true })}
                  onChange={handlePreview}
                />
              </label>

              {/* 👁️ Image Preview */}
              {profilePic && (
                <>
                  <img
                    src={profilePic}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover mt-4 border shadow"
                  />
                  <p className="text-green-500 mt-2">
                    ✅ Image selected successfully!
                  </p>
                </>
              )}

              <label className="label">Your name</label>
              <input
                type="text"
                className="input border rounded w-full"
                placeholder="Your Name"
                {...register("name")}
              />

              <label className="label">Email</label>
              <input
                type="email"
                className="input border rounded w-full"
                placeholder="Email"
                {...register("email")}
              />

              <label className="label">Password</label>
              <input
                type="password"
                className="input border rounded w-full"
                placeholder="Password"
                {...register("password", { required: true, minLength: 6 })}
              />

              {errors.password?.type === "required" && (
                <p className="text-red-500">Password is required</p>
              )}
              {errors.password?.type === "minLength" && (
                <p className="text-red-500">Password must be 6 characters</p>
              )}

              <button className="btn btn-neutral border-none rounded bg-PPrimary w-full mt-4">
                Register
              </button>

              <div className="text-start">
                <p className="text-base">
                  Already have an account?{" "}
                  <Link
                    className="text-blue-500 hover:link"
                    to="/login"
                    state={{ from }} // ✅ Preserve redirect
                  >
                    Login
                  </Link>
                </p>

                {/* Optional: UX message */}
                {location.state?.from && (
                  <p className="text-sm text-gray-500 mt-2">
                    After registering, you'll be redirected to:{" "}
                    <strong>{location.state.from.pathname}</strong>
                  </p>
                )}
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
