"use client";
import React, { useState } from "react";

type CityLetterFormProps = {
  className?: string;
};

export function CityLetterForm({ className = "" }: CityLetterFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted", { firstName, lastName, email, address, phone });
    setShowForm(false);
  };

  return (
    <>
      {/* Trigger Link */}
      <span className={className}>
        <button
          onClick={() => setShowForm(true)}
          className="underline hover:text-white hover:decoration-[#cc36a5] visited:text-[#cc36a5] transition italic"
        >
          Click here
        </button>
        <span className="italic">{" "}to let your city leaders know you want them to.</span>
      </span>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex justify-center items-center p-4 overflow-auto">
          <div className="relative bg-[#fffcee] text-[#001123] w-full max-w-2xl p-6 rounded-xl shadow-2xl my-10">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-[#001123] hover:text-[#cc36a5] text-2xl font-bold z-10"
              onClick={() => setShowForm(false)}
              aria-label="Close"
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold mb-2">
              Tell your city you want Waste Lens
            </h2>
            <p className="text-sm mb-6">
              We need your mailing address to ensure we send the letter to the
              correct city leaders.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  className="flex-1 p-2 rounded border border-gray-300"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="flex-1 p-2 rounded border border-gray-300"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <input
                type="text"
                placeholder="Mailing Address"
                className="w-full p-2 rounded border border-gray-300"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />

              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="flex-1 p-2 rounded border border-gray-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  className="flex-1 p-2 rounded border border-gray-300"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              {/* Simulated Letter Preview */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm whitespace-pre-line mt-6">
                <p>Dear City Officials,</p>
                <p className="mt-4">
                  I'm writing to express my support for Waste Lens, a solution
                  that could help improve recycling, reduce waste, and lower
                  costs for residents like me. Please consider implementing this
                  innovative program in our community.
                </p>
                <p className="mt-6 font-semibold italic">
                  Sincerely,
                  <br />
                  Sent by Waste Lens on behalf of your constituent {
                    firstName
                  }{" "}
                  {lastName}
                </p>
              </div>

              <button
                type="submit"
                className="mt-6 bg-[#cc36a5] text-white rounded px-4 py-2 hover:bg-white hover:text-[#cc36a5] hover:border hover:border-[#cc36a5] transition-all"
                className="mt-6 bg-[#cc36a5] text-white border border-[#fffcee] rounded px-4 py-2 hover:bg-white hover:text-[#cc36a5] hover:border-[#cc36a5] transition-all"
              >
                Submit Letter
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
