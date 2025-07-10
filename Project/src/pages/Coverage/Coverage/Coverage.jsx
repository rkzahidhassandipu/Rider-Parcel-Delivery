import React from "react";
import BangladeshMap from "../BDMap/BangladeshMap";

const Coverage = () => {
  return (
    <div>
      {/* Title */}
      <h2 className="text-3xl font-bold text-center">
        We are available in 64 districts
      </h2>

      <BangladeshMap />
    </div>
  );
};

export default Coverage;


// now i want to show marker in 64 districts where we have our branches