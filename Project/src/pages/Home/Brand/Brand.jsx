import React from 'react';
import Marquee from 'react-fast-marquee';
import brand1 from '../../../assets/brands/brand1.png';
import brand2 from '../../../assets/brands/brand2.png';
import brand3 from '../../../assets/brands/brand3.png';
import brand4 from '../../../assets/brands/brand4.png';
import brand5 from '../../../assets/brands/brand5.png';
import brand6 from '../../../assets/brands/brand6.png';
import brand7 from '../../../assets/brands/brand7.png';

const logos = [brand1, brand2, brand3, brand4, brand5, brand6, brand7];

const Brand = () => {
  return (
    <div className="py-12 my-12">
      <h2 className="text-center text-2xl md:text-3xl font-semibold mb-8">
        We've helped thousands of <span className="text-blue-600">sales teams</span>
      </h2>

      <Marquee className='mt-10' speed={60} gradient={false} pauseOnHover={true}>
        {logos.map((logo, index) => (
          <div key={index} className="mx-10">
            <img src={logo} alt={`Brand ${index}`} className="h-6 w-auto object-contain" />
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default Brand;
