import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Home from "@/app/page";

const Footer = () => {
  return (
    <footer>
      <div className="flex flex-col md:flex-row items-start justify-center px-6 md:px-16 lg:px-32 gap-10 py-14 border-b border-gray-500/30 text-gray-500">

        <div className="w-4/5">
          <Image className="w-28 md:w-32" src={assets.logo} alt="logo" />
          <br/>
          <h1 className="text-black text-xl font-bold">Team A.A.R.C. Tech</h1>
          <p className="mt-6 text-md">
            AARC FOODS is a food delivery service that provides delicious meals to customers. We are committed to delivering high-quality food with excellent customer service. Our team is dedicated to ensuring that every order is prepared with care and delivered on time.
              <br/>
              <br/>
            Owner Ms. Anjali Prajapati
              <br/>
            Contact AARC FOODS for any queries: +91 9044614431
          </p>
        </div>

        <div className="w-1/2 flex items-center justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Company</h2>
            <ul className="text-sm space-y-2">
              <li>
                <a className="hover:underline transition">Home</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">About us</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">Contact us</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">Privacy policy</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-1/2 flex items-start justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Get in touch</h2>
            <div className="text-sm space-y-2">
              <p>+1-234-567-890</p>
              <p>contact@greatstack.dev</p>
            </div>
          </div>
        </div>
      </div>
      <p className="py-4 text-center text-xs md:text-sm">
        Copyright 2025 © Created By Team A.A.R.C Tech, All Right Reserved.
      </p>
    </footer>
  );
};

export default Footer;