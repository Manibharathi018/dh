import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation Policy | Dhanya Factory Outlet",
  description:
    "Read the cancellation policy of Dhanya Factory Outlet. Understand how to cancel your order before dispatch and what happens with ready-to-ship orders.",
};

export default function CancellationPolicyPage() {
  return (
    <main className="bg-white min-h-screen text-gray-900 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* ── Title ── */}
        <h1
          className="text-2xl md:text-3xl font-semibold tracking-[0.2em] uppercase text-center text-gray-900 mb-8"
          style={{ fontFamily: "serif" }}
        >
          Cancellation Policy
        </h1>

        {/* ── Intro ── */}
        <p className="text-sm text-gray-700 leading-relaxed mb-6">
          At <strong>Dhanya Factory Outlet</strong>, we understand that plans can change. We aim
          to make the cancellation process simple and hassle-free while ensuring smooth
          communication at every step.
        </p>

        <hr className="border-gray-300 mb-8" />

        {/* ── Section 1: Our Right to Cancel ── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-900 mb-3">
            Our Right to Cancel
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            Dhanya Factory Outlet reserves the right to cancel any order at its discretion,
            without prior notice.
          </p>
          <ul className="list-disc list-outside pl-5 space-y-2 text-sm text-gray-700 leading-relaxed">
            <li>If we cancel an order, you will be informed promptly.</li>
            <li>
              Any payment made will be refunded within a reasonable timeframe.
            </li>
          </ul>
        </section>

        <hr className="border-gray-300 mb-8" />

        {/* ── Section 2: Customer-Initiated Cancellations ── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-900 mb-3">
            Customer-Initiated Cancellations
          </h2>
          <ol className="list-decimal list-outside pl-5 space-y-4 text-sm text-gray-700 leading-relaxed">
            <li>
              <span className="font-semibold text-gray-900">Before Dispatch:</span> You can
              cancel your order directly from the &ldquo;My Orders&rdquo; section in your account
              before it has been dispatched.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Ready-to-Ship Orders:</span> Once
              the order status is marked as &ldquo;Ready to Ship&rdquo;, cancellation is no
              longer possible. However, you may refuse the delivery upon arrival. Once the
              shipment is returned to us, your refund will be processed.
            </li>
          </ol>
        </section>

        <hr className="border-gray-300 mb-8" />

        {/* ── Section 3: Need Help? ── */}
        <section>
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-900 mb-3">
            Need Help?
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            If you face any issues while canceling your order, our Customer Service Team is
            here to help:
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
              </a>{" "}
              (10:00 AM – 10:00 PM, Monday to Saturday)
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}
