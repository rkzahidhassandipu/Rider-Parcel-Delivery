import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useAuth from "../../../hooks/useAuth";
import { useLoaderData } from "react-router";
import useAxios from "../../../hooks/useAxios";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";

const BeARider = () => {
  const { user, loading } = useAuth();
  const serviceCenters = useLoaderData();
  const [districts, setDistricts] = useState([]);
  const [areas, setAreas] = useState([]);
  // console.log(user)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const selectedRegion = watch("region");
  const selectedDistrict = watch("district");
  const axiosSecure = useAxiosSecure();

  // Reset name/email/status when user is loaded
  useEffect(() => {
    if (user) {
      reset({
        name: user.displayName || "",
        email: user.email || "",
        status: "pending",
      });
    }
  }, [user, reset]);

  // Update districts based on region
  useEffect(() => {
    const regionData = serviceCenters.find(
      (center) => center.region === selectedRegion
    );
    if (regionData) {
      const uniqueDistricts = [
        ...new Set(
          serviceCenters
            .filter((c) => c.region === selectedRegion)
            .map((c) => c.district)
        ),
      ];
      setDistricts(uniqueDistricts);
      setAreas([]); // Clear areas when region changes
    } else {
      setDistricts([]);
    }
  }, [selectedRegion]);

  // Update areas based on district
  useEffect(() => {
    if (user) {
      reset((prev) => ({
        ...prev,
        name: user.displayName || "",
        email: user.email || "",
        status: "pending",
      }));
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    console.log(data);
    try {
      const riderData = {
        ...data,
        name: user?.displayName,
        email: user?.email,
        status: "pending",
        created_at: new Date().toISOString(),
      };
      axiosSecure.post("riders", riderData).then((res) => {
        if (res.data.insertedId) {
          Swal.fire({
            icon: "success",
            title: "Application Submitted",
            text: "Your applicaton is pending approval.",
          });
        }
      });
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <section className="bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
        {/* Form */}
        <div className="w-full md:w-1/2">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Be a Rider</h1>
          <p className="text-gray-600 mb-6">
            Join our delivery team and earn with flexibility. Fast onboarding
            and secure payments.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name & Email */}
            <input
              type="text"
              {...register("name")}
              readOnly
              className="w-full px-4 py-2 border rounded bg-gray-100"
              placeholder="Your Name"
            />
            <input
              type="email"
              {...register("email")}
              readOnly
              className="w-full px-4 py-2 border rounded bg-gray-100"
              placeholder="Your Email"
            />

            {/* Age */}
            <input
              type="number"
              {...register("age", { required: true })}
              className="w-full px-4 py-2 border rounded"
              placeholder="Age"
            />

            {/* Region & District */}
            <div className="flex gap-4">
              <select
                {...register("region", { required: true })}
                className="w-1/2 px-4 py-2 border rounded"
              >
                <option value="">Select Region</option>
                {[...new Set(serviceCenters.map((c) => c.region))].map(
                  (region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  )
                )}
              </select>

              <select
                {...register("district", { required: true })}
                className="w-1/2 px-4 py-2 border rounded"
              >
                <option value="">Select District</option>
                {districts.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            {/* Area (Covered Area) */}
            <select
              {...register("area")}
              className="w-full px-4 py-2 border rounded"
            >
              <option value="Area">Select Covered Area </option>
              <option value="Area1">Select Covered Area 1 </option>
              <option value="Area2">Select Covered Area 2 </option>
              <option value="Area3">Select Covered Area 3</option>
              {/* {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))} */}
            </select>

            {/* Phone & NID */}
            <div className="flex gap-4">
              <input
                type="text"
                {...register("phone", { required: true })}
                className="w-1/2 px-4 py-2 border rounded"
                placeholder="Phone Number"
              />
              <input
                type="text"
                {...register("nid", { required: true })}
                className="w-1/2 px-4 py-2 border rounded"
                placeholder="National ID Number"
              />
            </div>

            {/* Bike Info */}
            <input
              type="text"
              {...register("bikeBrand", { required: true })}
              className="w-full px-4 py-2 border rounded"
              placeholder="Bike Brand (e.g. Yamaha, Honda)"
            />
            <input
              type="text"
              {...register("bikeRegNo", { required: true })}
              className="w-full px-4 py-2 border rounded"
              placeholder="Bike Registration Number"
            />

            {/* Hidden Status */}
            <input type="hidden" {...register("status")} value="pending" />

            {/* Submit */}
            <input
              value={" Submit Application"}
              type="submit"
              className="w-full bg-lime-300 hover:bg-lime-400 transition-colors py-2 rounded text-gray-800 font-semibold"
            />
          </form>
        </div>

        {/* Image */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src="https://i.postimg.cc/1XksZDD6/14694900-courier-motorbike-delivery-package-1.png"
            alt="Rider on a scooter"
            className="max-w-sm w-full"
          />
        </div>
      </div>
    </section>
  );
};

export default BeARider;
