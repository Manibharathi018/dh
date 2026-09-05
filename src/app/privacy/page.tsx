import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Dhanya Factory Outlet",
  description:
    "Read the Privacy Policy of Dhanya Factory Outlet. Learn how we collect, use, and protect your personal information when you shop with us.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white min-h-screen text-gray-900 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* ── Title ── */}
        <h1
          className="text-2xl md:text-3xl font-semibold tracking-[0.2em] uppercase text-center text-gray-900 mb-10"
          style={{ fontFamily: "serif" }}
        >
          Privacy Policy
        </h1>

        {/* ── Intro ── */}
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed mb-8">
          <p>
            At <strong>Dhanya Factory Outlet</strong>, your trust is our greatest asset. We are
            committed to safeguarding your personal data and respecting your privacy at all times.
            This Privacy Policy explains how we collect, use, and protect your information when
            you visit our website or interact with us in any way.
          </p>
          <p>
            We do not sell, rent, or trade your personal information to any third party for
            commercial purposes. While we take extensive measures to protect your data, we cannot
            be held responsible for breaches caused by unauthorised third-party actions beyond our
            control.
          </p>
        </div>

        <hr className="border-gray-300 mb-8" />

        {/* ── Section 1: Information We Collect ── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-900 mb-3">
            Information We Collect
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            We may collect the following types of information when you use our services:
          </p>
          <ul className="list-disc list-outside pl-5 space-y-2 text-sm text-gray-700 leading-relaxed">
            <li>
              <span className="font-semibold text-gray-900">Personal Information</span> — Name,
              contact details, shipping/billing address, payment details, date of birth (if
              provided), and account login information.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Usage Data</span> — Pages you visit,
              time spent, device type, IP address, browser details, and cookies.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Communication Preferences</span> —
              Your choices regarding marketing communications and alerts.
            </li>
          </ul>
        </section>

        <hr className="border-gray-300 mb-8" />

        {/* ── Section 2: How We Use Your Information ── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-900 mb-3">
            How We Use Your Information
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            Your personal data will be used solely for purposes that improve your shopping
            experience, including:
          </p>
          <ul className="list-disc list-outside pl-5 space-y-2 text-sm text-gray-700 leading-relaxed">
            <li>Processing your orders and payments.</li>
            <li>Delivering products and providing customer support.</li>
            <li>Sending updates on orders, new arrivals, offers, and promotions.</li>
            <li>Customizing your shopping experience with relevant recommendations.</li>
            <li>Resolving disputes, troubleshooting issues, and ensuring secure transactions.</li>
            <li>Improving our website and service experience based on analytics.</li>
          </ul>
        </section>

        <hr className="border-gray-300 mb-8" />

        {/* ── Section 3: Communication Consent ── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-900 mb-3">
            Communication Consent
          </h2>
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              By providing your contact details, you authorize{" "}
              <strong>Dhanya Factory Outlet</strong> to send you information, alerts, SMS messages,
              calls, and promotional content—either directly or through authorized service
              providers—even if your number is registered on the National Do Not Call Registry or
              National Customer Preference Register.
            </p>
            <p>
              You agree not to hold <strong>Dhanya Factory Outlet</strong> or its service providers
              liable for such communications under applicable laws or TRAI regulations.
            </p>
          </div>
        </section>

        <hr className="border-gray-300 mb-8" />

        {/* ── Section 4: Cookies & Tracking Technologies ── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-900 mb-3">
            Cookies &amp; Tracking Technologies
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            We use cookies to enhance your shopping experience, making it faster, safer, and more
            personalized. Cookies allow us to:
          </p>
          <ul className="list-disc list-outside pl-5 space-y-2 text-sm text-gray-700 leading-relaxed mb-4">
            <li>Recognize returning visitors.</li>
            <li>Save your preferences for future visits.</li>
            <li>Improve website speed, navigation, and recommendations.</li>
            <li>Display relevant advertising (without sharing your personal details).</li>
          </ul>
          <p className="text-sm text-gray-700 leading-relaxed">
            You can choose to disable cookies via your browser settings, but certain site features
            may not work as intended.
          </p>
        </section>

        <hr className="border-gray-300 mb-8" />

        {/* ── Section 5: Data Security ── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-900 mb-3">
            Data Security
          </h2>
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              Your privacy is our priority. We use physical, electronic, and managerial safeguards
              to protect your data, including encryption for sensitive information such as payment
              details.
            </p>
            <p>
              In the unlikely event of a security breach, we will promptly inform you via email and
              take corrective measures to restore security.
            </p>
          </div>
        </section>

        <hr className="border-gray-300 mb-8" />

        {/* ── Section 6: Advertising & Third-Party Services ── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-900 mb-3">
            Advertising &amp; Third-Party Services
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            We may collaborate with authorized third-party partners to display relevant ads and
            improve services. While no personally identifiable information is shared with
            advertisers, aggregated user data may be used to optimize content and offers.
          </p>
        </section>

        <hr className="border-gray-300 mb-8" />

        {/* ── Section 7: Your Choices & Control ── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-900 mb-3">
            Your Choices &amp; Control
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            You have full control over the information you share with us. While certain personal
            details are required to complete orders, you can:
          </p>
          <ul className="list-disc list-outside pl-5 space-y-2 text-sm text-gray-700 leading-relaxed">
            <li>
              Update your profile and preferences in the &ldquo;My Account&rdquo; section.
            </li>
            <li>
              Opt out of promotional communications anytime via the &ldquo;unsubscribe&rdquo; link
              or by contacting customer support.
            </li>
          </ul>
        </section>

        <hr className="border-gray-300 mb-8" />

        {/* ── Section 8: Important Disclaimer ── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-900 mb-3">
            Important Disclaimer
          </h2>
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              While we work hard to keep your information secure, we strongly advise you not to
              share sensitive details (such as passwords or OTPs) with anyone claiming to represent{" "}
              <strong>Dhanya Factory Outlet</strong> via calls, SMS, or unofficial emails. We will
              never ask for such details over these channels.
            </p>
            <p>
              We are not responsible for losses arising from information shared by you with
              unauthorized individuals or through unofficial communication channels.
            </p>
          </div>
        </section>

        <hr className="border-gray-300 mb-8" />

        {/* ── Section 9: Contact Us ── */}
        <section>
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-900 mb-3">
            Contact Us
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            For any privacy-related concerns, you can reach us at:
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
              Customer Care:{" "}
              <a href="tel:+919629850010" className="text-blue-600 hover:underline">
                +91 96298 50010
              </a>{" "}
              (Mon–Sat, 10:00 AM – 10:00 PM)
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}
