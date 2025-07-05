'use client';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing or using the Message Scheduler service, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Service Description</h2>
            <p className="text-gray-600 mb-4">
              Message Scheduler is a platform that allows users to schedule text messages to be sent at future dates and times. The service acts as an intermediary and is not responsible for the content of messages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. User Responsibilities</h2>
            <p className="text-gray-600 mb-4">
              You agree to:
            </p>
            <ul className="list-disc pl-5 text-gray-600 mb-4 space-y-2">
              <li>Provide accurate and complete information when using the service</li>
              <li>Only schedule messages to recipients who have consented to receive them</li>
              <li>Not use the service for illegal, harmful, or abusive purposes</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Prohibited Uses</h2>
            <p className="text-gray-600 mb-4">
              You may not use the service to:
            </p>
            <ul className="list-disc pl-5 text-gray-600 mb-4 space-y-2">
              <li>Send spam or unsolicited messages</li>
              <li>Harass, threaten, or intimidate others</li>
              <li>Send fraudulent or deceptive messages</li>
              <li>Violate any third-party rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              Message Scheduler shall not be liable for any delays in message delivery, service interruptions, or any damages resulting from the use or inability to use the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to modify these terms at any time. Your continued use of the service after any such changes constitutes your acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Contact Information</h2>
            <p className="text-gray-600">
              For any questions about these Terms of Service, please contact us at <a href="mailto:sarthak.vitmal.dev@gmail.com" className="text-blue-600 hover:underline">sarthak.vitmal.dev@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}