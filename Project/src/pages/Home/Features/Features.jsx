import React from "react";


const featuresData = [
  {
    id: 1,
    title: "Live Parcel Tracking",
    description:
      "Stay updated in real-time with our live parcel tracking feature. From pick-up to delivery, monitor your shipment's journey and get instant status updates for complete peace of mind.",
    image: 'https://i.postimg.cc/DzcC5Qqb/live-tracking.png',
  },
  {
    id: 2,
    title: "100% Safe Delivery",
    description:
      "We ensure your parcels are handled with the utmost care and delivered securely to their destination. Our reliable process guarantees safe and damage-free delivery every time.",
    image: 'https://i.postimg.cc/vZf2xwTh/call.png',
  },
  {
    id: 3,
    title: "24/7 Call Center Support",
    description:
      "Our dedicated support team is available around the clock to assist you with any questions, updates, or delivery concerns—anytime you need us.",
    image: 'https://i.postimg.cc/vZf2xwTh/call.png',
  },
];


const Features = () => {
  return (
    <section className="py-12 md:px-8">
      <div className="mx-auto space-y-6">
        {featuresData.map((feature) => (
          <div
            key={feature.id}
            className="flex flex-col md:flex-row items-center bg-gray-50 rounded-lg p-6 gap-6 border border-blue-100 shadow-sm"
          >
            <img
              src={feature.image}
              alt={feature.title}
              className="w-32 h-32 object-contain"
            />
            <div className="border-l border-dashed pl-5">
              <h3 className="text-lg md:text-xl font-semibold text-blue-700 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
