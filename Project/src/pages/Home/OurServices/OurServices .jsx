import { FaShippingFast, FaGlobeAsia, FaWarehouse, FaMoneyBillWave, FaBuilding, FaUndoAlt } from "react-icons/fa";

const services = [
  {
    title: "Express & Standard Delivery",
    description:
      "We deliver parcels within 24–72 hours in Dhaka, Chittagong, Sylhet, Khulna, and Rajshahi. Express delivery available in Dhaka within 4–6 hours from pick-up to drop-off.",
    icon: <FaShippingFast className="text-3xl text-pink-600" />,
  },
  {
    title: "Nationwide Delivery",
    description:
      "We deliver parcels nationwide with home delivery in every district, ensuring your products reach customers within 48–72 hours.",
    icon: <FaGlobeAsia className="text-3xl text-green-600" />,
  },
  {
    title: "Fulfillment Solution",
    description:
      "We also offer customized service with inventory management support, online order processing, packaging, and after sales support.",
    icon: <FaWarehouse className="text-3xl text-blue-600" />,
  },
  {
    title: "Cash on Home Delivery",
    description:
      "100% cash on delivery anywhere in Bangladesh with guaranteed safety of your product.",
    icon: <FaMoneyBillWave className="text-3xl text-yellow-600" />,
  },
  {
    title: "Corporate Service / Contract In Logistics",
    description:
      "Customized corporate services which includes warehouse and inventory management support.",
    icon: <FaBuilding className="text-3xl text-indigo-600" />,
  },
  {
    title: "Parcel Return",
    description:
      "Through our reverse logistics facility we allow end customers to return or exchange their products with online business merchants.",
    icon: <FaUndoAlt className="text-3xl text-red-500" />,
  },
];

const OurServices = () => {
  return (
    <section className="bg-[#043C45] text-white py-16 px-6 md:px-20 rounded-xl my-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Our Services</h2>
        <p className="max-w-2xl mx-auto text-lg font-light">
          Enjoy fast, reliable parcel delivery with real-time tracking and zero hassle. From personal packages to business shipments — we deliver on time, every time.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <div
            key={index}
            className={`rounded-xl p-6 shadow-lg text-center bg-white text-[#043C45] ${
              service.title === "Nationwide Delivery" ? "bg-lime-200" : ""
            }`}
          >
            <div className="flex justify-center mb-4 text-4xl text-[#E65F78]">
              {service.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
            <p className="text-sm">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default OurServices