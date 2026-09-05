import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy | Dhanya Factory Outlet",
  description:
    "Read the Shipping Policy of Dhanya Factory Outlet. Learn about order processing times, delivery timelines, shipping charges, COD fees, and failed delivery attempts.",
};

export default function ShippingPolicyPage() {
  return (
    <main className="bg-white min-h-screen text-gray-900 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* ── Title ── */}
        <h1
          className="text-2xl md:text-3xl font-semibold tracking-[0.2em] uppercase text-center text-gray-900 mb-10"
          style={{ fontFamily: "serif" }}
        >
          Shipping Policy
        </h1>

        {/* ── Intro ── */}
        <p className="text-sm text-gray-700 leading-relaxed mb-8">
          At <strong>Dhanya Factory Outlet</strong>, we&apos;re committed to delivering your
          orders quickly, safely, and hassle-free. We partner with trusted courier services to
          ensure your shopping experience is smooth from checkout to doorstep.
        </p>

        <hr className="border-gray-300 mb-8" />

        {/* ── Section 1: Order Processing & Dispatch ── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-900 mb-4">
            Order Processing &amp; Dispatch
          </h2>
          <ul className="list-disc list-outside pl-5 space-y-2 text-sm text-gray-700 leading-relaxed mb-6">
            <li>Orders are processed and dispatched within 24–48 hours of confirmation.</li>
            <li>Delivery timelines depend on your location:</li>
          </ul>

          {/* Delivery Table */}
          <div className="border border-gray-300 rounded-sm overflow-hidden mb-6">
            <table className="w-full text-sm text-gray-700">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left px-5 py-3 font-medium text-gray-900 bg-gray-50 w-1/2">
                    Location
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-900 bg-gray-50 w-1/2">
                    Estimated Delivery Time
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-5 py-4">Chennai</td>
                  <td className="px-5 py-4">3–4 working days</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-5 py-4">Metro Cities</td>
                  <td className="px-5 py-4">5–7 working days</td>
                </tr>
                <tr>
                  <td className="px-5 py-4">Other Regions</td>
                  <td className="px-5 py-4">Up to 10 working days</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed italic">
            <strong>Note:</strong> Delivery times are counted in business days and exclude
            weekends/public holidays. Delays due to weather, festivals, or logistics disruptions
            may occur — we appreciate your patience in such cases.
          </p>
        </section>

        <hr className="border-gray-300 mb-8" />

        {/* ── Section 2: Shipping Charges ── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-900 mb-4">
            Shipping Charges
          </h2>
          <ul className="list-disc list-outside pl-5 space-y-2 text-sm text-gray-700 leading-relaxed">
            <li>
              Free Shipping on all orders above ₹999 across India.
            </li>
          </ul>
        </section>

        <hr className="border-gray-300 mb-8" />

        {/* ── Section 3: Cash on Delivery (COD) Charges ── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-900 mb-4">
            Cash on Delivery (COD) Charges
          </h2>
          <ul className="list-disc list-outside pl-5 space-y-2 text-sm text-gray-700 leading-relaxed">
            <li>Flat ₹100 COD fee applies to all COD orders.</li>
          </ul>
        </section>

        <hr className="border-gray-300 mb-8" />

        {/* ── Section 4: Failed Delivery Attempts ── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-900 mb-4">
            Failed Delivery Attempts
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            Sometimes, deliveries may fail due to:
          </p>
          <ul className="list-disc list-outside pl-5 space-y-2 text-sm text-gray-700 leading-relaxed mb-4">
            <li>Incorrect or incomplete address.</li>
            <li>Recipient unavailable or incorrect contact number.</li>
            <li>Restricted delivery area.</li>
            <li>COD payment not made upon delivery.</li>
            <li>Recipient has moved from the provided address.</li>
          </ul>
          <p className="text-sm text-gray-700 leading-relaxed">
            If delivery fails after 3 attempts, the order will be canceled and returned to us.
          </p>
        </section>

        <hr className="border-gray-300 mb-8" />

        {/* ── Contact ── */}
        <section>
          <p className="text-sm font-semibold text-gray-900 leading-relaxed mb-3">
            For any order or delivery-related concerns, our Customer Support Team is here to
            help you.
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <span className="mr-2">📧</span>
              Email:{" "}
              <a
                href="mailto:dhanyafactoryoutlet@gmail.com"
                className="text-blue-600 hover:underline"
              >
                dhanyafactoryoutlet@gmail.com
              </a>
            </p>
            <p>
              <span className="mr-2">📞</span>
              Phone:{" "}
              <a href="tel:+919629850010" className="text-blue-600 hover:underline">
                +91 96298 50010
              </a>
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}
