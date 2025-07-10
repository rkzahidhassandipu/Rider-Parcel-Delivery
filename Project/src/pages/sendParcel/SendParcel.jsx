import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "../../index.css";
import warehouseData from "../../assets/warehouses.json";
import Swal from "sweetalert2";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNavigate } from "react-router";
import { useTrackingLog } from "../../hooks/useTrackingLog";

const SendParcel = () => {
  const [parcelType, setParcelType] = useState("Document");
  const uniqueRegions = [...new Set(warehouseData.map((w) => w.region))];
  const [senderRegion, setSenderRegion] = useState("");
  const [receiverRegion, setReceiverRegion] = useState("");
  const navigate = useNavigate();
  const { logTracking } = useTrackingLog();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const generateTrackingID = (regionCode = "MY") => {
    const prefix = "TRK";
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14); // yyyyMMddHHmmss
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4-char random
    return `${prefix}-${regionCode}-${timestamp}-${randomPart}`;
  };

  const onSubmit = (data) => {
    const { parcelType, parcelWeight, senderDistrict, receiverDistrict } = data;
    const weight = parseFloat(parcelWeight) || 0;
    const isSameDistrict = senderDistrict === receiverDistrict;

    let cost = 0;
    let breakdown = "";

    if (parcelType === "Document") {
      cost = isSameDistrict ? 60 : 80;
      breakdown = `
      <p><strong>Parcel Type:</strong> Document</p>
      <p><strong>Location:</strong> ${
        isSameDistrict ? "Within District" : "Outside District"
      }</p>
      <p><strong>Base Cost:</strong> ৳${cost}</p>
    `;
    } else {
      if (weight <= 3) {
        cost = isSameDistrict ? 110 : 150;
        breakdown = `
        <p><strong>Parcel Type:</strong> Non-Document</p>
        <p><strong>Weight:</strong> ${weight} KG (within 3KG)</p>
        <p><strong>Location:</strong> ${
          isSameDistrict ? "Within District" : "Outside District"
        }</p>
        <p><strong>Base Cost:</strong> ৳${cost}</p>
      `;
      } else {
        const extraWeight = weight - 3;
        const extraCost = extraWeight * 40;

        if (isSameDistrict) {
          cost = 110 + extraCost;
          breakdown = `
          <p><strong>Parcel Type:</strong> Non-Document</p>
          <p><strong>Weight:</strong> ${weight} KG (3KG base + ${extraWeight}KG extra)</p>
          <p><strong>Base Cost:</strong> ৳110</p>
          <p><strong>Extra:</strong> ${extraWeight}KG × ৳40 = ৳${extraCost}</p>
        `;
        } else {
          cost = 150 + extraCost + 40;
          breakdown = `
          <p><strong>Parcel Type:</strong> Non-Document</p>
          <p><strong>Weight:</strong> ${weight} KG (3KG base + ${extraWeight}KG extra)</p>
          <p><strong>Base Cost:</strong> ৳150</p>
          <p><strong>Extra Weight:</strong> ${extraWeight}KG × ৳40 = ৳${extraCost}</p>
          <p><strong>Additional Distance Fee:</strong> ৳40</p>
        `;
        }
      }
    }

    Swal.fire({
      title: "Delivery Cost Breakdown",
      html: `
      ${breakdown}
      <hr class="my-2"/>
      <h3 style="color: green;">Total Price: ৳${cost}</h3>
    `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Proceed to Payment",
      cancelButtonText: "Edit Again",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#d1d5db",
    }).then((result) => {
      if (result.isConfirmed) {
        const tracking_id = generateTrackingID();
        const parcelData = {
          ...data,
          cost,
          created_by: user.email,
          creation_date: new Date().toISOString(),
          payment_status: "unpaid",
          delivery_status: "not_collected",
          tracking_id: tracking_id,
        };

        console.log("Proceeding with data:", parcelData);

        axiosSecure
          .post("/parcels", parcelData)
          .then(async (res) => {
            if (res.data.insertedId) {
              Swal.fire({
                title: "Redirecting...",
                text: "Proceeding to payment gateway.",
                icon: "success",
                timer: 1500,
                showCancelButton: false,
                showConfirmButton: false,
              });
              await logTracking({
                tracking_id: parcelData.tracking_id,
                status: "parcel_created",
                note: `Created by ${user.displayName}`,
                actor: user?.email || "system",
              });
              // TODO: Redirect to payment page
              navigate("/dashboard/myparcels");
            }
          })
          .catch((err) => {
            console.error("❌ Parcel submission failed:", err);
            Swal.fire(
              "Error",
              "Could not submit parcel. Try again later.",
              "error"
            );
          });
      } else {
        console.log("User chose to edit again");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-3xl font-bold text-green-900 mb-4">Add Parcel</h2>
      <hr className="mb-6" />

      <div className="mb-6">
        <p className="text-lg font-semibold mb-2">Enter your parcel details</p>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="Document"
              {...register("parcelType")}
              checked={parcelType === "Document"}
              onChange={(e) => setParcelType(e.target.value)}
              className="accent-green-500"
            />
            <span>Document</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="Not-Document"
              {...register("parcelType")}
              checked={parcelType === "Not-Document"}
              onChange={(e) => setParcelType(e.target.value)}
              className="accent-green-500"
            />
            <span>Not-Document</span>
          </label>
        </div>
      </div>

      {/* Parcel Name and Weight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          {...register("parcelName", { required: true })}
          type="text"
          placeholder="Parcel Name"
          className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          {...register("parcelWeight", { required: parcelType !== "Document" })}
          type="text"
          placeholder="Parcel Weight (KG)"
          disabled={parcelType === "Document"}
          className={`border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 ${
            parcelType === "Document"
              ? "bg-gray-100 cursor-not-allowed"
              : "focus:ring-green-500"
          }`}
        />
      </div>

      {/* Sender & Receiver Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        {/* Sender */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Sender Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              {...register("senderName")}
              placeholder="Sender Name"
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {/* Sender Region */}
            <select
              {...register("senderRegion")}
              onChange={(e) => setSenderRegion(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select your region</option>
              {uniqueRegions.map((region, idx) => (
                <option key={idx} value={region}>
                  {region}
                </option>
              ))}
            </select>
            <input
              {...register("senderAddress")}
              placeholder="Address"
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              {...register("senderContact")}
              placeholder="Sender Contact No"
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {/* Sender District (filtered by senderRegion) */}
            <select
              {...register("senderDistrict")}
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={!senderRegion}
            >
              <option value="">Select district</option>
              {[
                ...new Set(
                  warehouseData
                    .filter((w) => w.region === senderRegion)
                    .map((w) => w.district)
                ),
              ].map((district, idx) => (
                <option key={idx} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
          <textarea
            {...register("pickupInstruction")}
            rows="3"
            placeholder="Pickup Instruction"
            className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
          ></textarea>
        </div>

        {/* Receiver */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Receiver Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              {...register("receiverName")}
              placeholder="Receiver Name"
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {/* Receiver Region */}
            <select
              {...register("receiverRegion")}
              onChange={(e) => setReceiverRegion(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select your region</option>
              {uniqueRegions.map((region, idx) => (
                <option key={idx} value={region}>
                  {region}
                </option>
              ))}
            </select>
            <input
              {...register("receiverAddress")}
              placeholder="Address"
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              {...register("receiverContact")}
              placeholder="Receiver Contact No"
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {/* Receiver District (filtered by receiverRegion) */}
            <select
              {...register("receiverDistrict")}
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={!receiverRegion}
            >
              <option value="">Select district</option>
              {[
                ...new Set(
                  warehouseData
                    .filter((w) => w.region === receiverRegion)
                    .map((w) => w.district)
                ),
              ].map((district, idx) => (
                <option key={idx} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
          <textarea
            {...register("deliveryInstruction")}
            rows="3"
            placeholder="Delivery Instruction"
            className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
          ></textarea>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        * PickUp Time 4pm–7pm Approx.
      </p>

      <button
        type="submit"
        className="bg-lime-400 hover:bg-lime-500 text-white px-6 py-2 rounded-md font-medium"
      >
        Proceed to Confirm Booking
      </button>
    </form>
  );
};

export default SendParcel;
