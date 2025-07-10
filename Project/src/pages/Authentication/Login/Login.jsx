import React from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router"; // ✅ FIXED
import useAuth from "../../../hooks/useAuth";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { signInUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || "/";

  const onSubmit = (data) => {
    signInUser(data.email, data.password)
      .then((result) => {
        console.log(result.user);
        navigate(from, { replace: true }); // ✅ Redirect to original destination
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="flex justify-center items-center bg-base-200 my-10">
      <div className="card bg-base-100 w-full py-10">
        <div className="text-start">
          <h2 className="text-4xl font-bold">Welcome Back</h2>
          <p>Login with Profast</p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="fieldset space-y-4">
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

              <div className="text-start">
                <a className="link link-hover">Forgot password?</a>
              </div>

              <button className="btn btn-neutral border-none rounded bg-PPrimary w-full mt-4">
                Login
              </button>

              <div className="text-start">
                <p>
                  Don’t have an account?{" "}
                  <Link
                    to="/register"
                    state={{ from }}
                    className="text-blue-500 hover:underline"
                  >
                    Register
                  </Link>
                </p>

                {location.state?.from && (
                  <p className="text-sm text-gray-500 mt-2">
                    After login, you'll be redirected to{" "}
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

export default Login;
