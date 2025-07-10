import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../../Component/Loading/Loading";
import useAuth from "../../../hooks/useAuth";
import Swal from "sweetalert2";
import { useTrackingLog } from "../../../hooks/useTrackingLog";

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { parcelId } = useParams();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Get user info
  const {logTracking} = useTrackingLog()

  console.log(user.email);

  const { isPending, data: parcelInfo = {} } = useQuery({
    queryKey: ["parcels", parcelId],
    queryFn: async () => {
      const res = await axiosSecure(`/parcels/${parcelId}`);
      return res.data;
    },
  });

  if (isPending) {
    return <Loading />;
  }

  const price = parcelInfo.cost;
  const amountInCents = price * 100;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);
    if (!card) return;

    // Step 1: Get payment intent from backend
    try {
      const res = await axiosSecure.post("/create-payment-intent", {
        amountInCents,
        parcelId,
      });

      const clientSecret = res.data.clientSecret;

      // Step 2: Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: user?.displayName || "Anonymous",
            email: user?.email,
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
        setSuccess("");
      } else if (result.paymentIntent.status === "succeeded") {
        setSuccess("✅ Payment successful!");
        const transactionId = result.paymentIntent.id;
        setError("");
        console.log("💰 PaymentIntent:", result.paymentIntent);
        // Optional: update parcel status or save payment info
        // step: 3 mark parcel paid also create payment history
        const paymentData = {
          parcelId,
          userEmail: user.email,
          amount: price, // use defined variable
          transactionId,
          paymentMethod: result.paymentIntent.payment_method_types,
        };

        const paymentRes = await axiosSecure.post("payments", paymentData);
        if (paymentRes.data.insertResult) {
          Swal.fire({
            title: "Payment Successful!",
            text: `Transaction ID: ${transactionId}`,
            icon: "success",
            confirmButtonText: "Go to My Parcels",
          }).then( async () => {
            await logTracking(
              {
                 tracking_id: parcelInfo.tracking_id,
                status: "payment_done",
                note: `paid by ${user.displayName}`,
                actor: user?.email || "system",
              }
            )
            // ✅ Redirect after confirmation
            navigate("/dashboard/myparcels");
          });
        }
      }
    } catch (err) {
      setError(err.message || "Payment failed");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <CardElement />
        <button
          type="submit"
          disabled={!stripe}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
        >
          Pay ${price}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-500 mt-2">{success}</p>}
      </form>
    </div>
  );
};

export default PaymentForm;
