import React from "react";
import location from "../../../assets/location-merchant.png";

const Merchant = () => {
  return (
    <div className='bg-no-repeat bg-[#03373D] bg-[url("https://i.postimg.cc/dVbML6VG/be-a-merchant-bg.png")] rounded-2xl my-10 p-10'>
      <div className="hero-content flex-col lg:flex-row-reverse">
        <img src={location} className="max-w-sm rounded-lg" />
        <div className="text-white">
          <h1 className="text-5xl font-bold">
            Merchant and Customer Satisfaction <br /> is Our First Priority
          </h1>
          <p className="py-6">
            We offer the lowest delivery charge with the highest value along
            with 100% safety of your product. Pathao courier delivers your
            parcels in every corner of Bangladesh right on time.
          </p>
          <div className="flex gap-10">
            <button className="btn btn-primary rounded-full border-green-800 bg-green-800">Become a Merchant</button>
            <button className="btn btn-primary rounded-full border-green-800 hover:bg-green-800">Earn with Profast Courier</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Merchant;
