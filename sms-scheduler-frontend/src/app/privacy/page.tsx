'use client';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 mb-4">
              We collect information you provide directly when you use our Message Scheduler service, including:
            </p>
            <ul className="list-disc pl-5 text-gray-600 mb-4 space-y-2">
              <li>Contact information (phone numbers you provide for messaging)</li>
              <li>Message content you schedule to send</li>
              <li>Scheduling information (dates and times for messages)</li>
              <li>Account information if you register for an account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-5 text-gray-600 mb-4 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Send the messages you schedule at the times you specify</li>
              <li>Respond to your requests and provide customer support</li>
              <li>Monitor and analyze usage and trends</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Data Retention</h2>
            <p className="text-gray-600 mb-4">
              We retain your scheduled messages only for as long as necessary to provide the service and for legitimate business purposes. You can delete your messages at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Changes to This Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:sarthak.vitmal.dev@gmail.com" className="text-blue-600 hover:underline">sarthak.vitmal.dev@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}