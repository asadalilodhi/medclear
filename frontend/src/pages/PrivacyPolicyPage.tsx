import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6 text-brand-text">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold font-heading text-brand-primary mb-4">Privacy Policy</h1>
        <p className="text-xl text-brand-text/70 italic font-heading">Effective Date: June 2026</p>
      </div>

      <div className="bg-brand-surface p-12 rounded-3xl border border-brand-primary/10 shadow-sm space-y-12">
        
        <section>
          <h2 className="text-3xl font-bold text-brand-primary font-heading mb-4">1. Introduction & HIPAA Compliance Commitment</h2>
          <p className="text-lg leading-relaxed text-brand-text/90">
            At MedClear, we understand that medical financial data is profoundly sensitive. We are fully committed to protecting your Protected Health Information (PHI) in strict compliance with the Health Insurance Portability and Accountability Act (HIPAA). This privacy policy clearly outlines how we handle your data, how our AI systems operate, and how we bridge the gap between AI and HIPAA "Minimum Necessary" standards.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-brand-primary font-heading mb-4">2. Transparency About AI Processing</h2>
          <p className="text-lg leading-relaxed text-brand-text/90 mb-4">
            MedClear operates as an AI-powered navigator. It is critical that you understand how our AI model interacts with your data:
          </p>
          <ul className="list-disc pl-6 space-y-3 text-lg text-brand-text/90">
            <li><strong>Zero Data Retention:</strong> Our LLM (Large Language Model) integration operates statelessly. Your input (income and household size) is processed instantly to cross-reference against public hospital policies and is <strong>never</strong> saved, logged, or used to train future AI models.</li>
            <li><strong>Strict Redaction:</strong> Before any query is sent to our AI processing tier, we ensure that all Personally Identifiable Information (PII) is stripped locally within your browser.</li>
            <li><strong>No Autonomous Decision Making:</strong> The AI is restricted entirely to text extraction. All mathematical calculations regarding Federal Poverty Levels (FPL) are executed deterministically via human-written, auditable Python logic.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-brand-primary font-heading mb-4">3. Data Collection and Permitted Uses</h2>
          <p className="text-lg leading-relaxed text-brand-text/90 mb-4">
            We operate under the principle of data minimization. We only collect the specific data points required to calculate your eligibility tier:
          </p>
          <ul className="list-disc pl-6 space-y-3 text-lg text-brand-text/90">
            <li><strong>What we collect:</strong> Annual household income, household size, and the name of the hospital you are inquiring about.</li>
            <li><strong>What we DO NOT collect:</strong> Names, Social Security Numbers, addresses, or medical conditions.</li>
            <li><strong>Permitted Disclosures:</strong> We do not sell your data. We do not disclose your data to third parties for marketing. Any data processing is strictly for the internal operation of determining charity care eligibility.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-brand-primary font-heading mb-4">4. Vendor Management & Business Associate Agreements (BAAs)</h2>
          <p className="text-lg leading-relaxed text-brand-text/90">
            We utilize enterprise-grade cloud infrastructure and LLM providers. Every third-party vendor that interacts with our processing pipeline is bound by a signed Business Associate Agreement (BAA), legally obligating them to uphold HIPAA Security Rule standards and preventing them from retaining your PHI.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-brand-primary font-heading mb-4">5. Patient Rights</h2>
          <p className="text-lg leading-relaxed text-brand-text/90">
            Because our architecture is entirely ephemeral, there are no persistent patient records stored in our database for you to request or amend. However, if you choose to email us or use our contact forms, you retain full rights under HIPAA to request an accounting of disclosures or deletion of any correspondence.
          </p>
        </section>

        <section className="bg-brand-surface p-8 rounded-2xl border-2 border-brand-primary/20 shadow-sm mt-8">
          <h2 className="text-2xl font-bold text-brand-primary font-heading mb-3 flex items-center gap-2">
            <span className="w-2 h-6 bg-brand-accent rounded-full inline-block"></span>
            Contact the Privacy Officer
          </h2>
          <p className="text-lg text-brand-text">
            If you have any questions regarding your data privacy or wish to file a complaint, please reach out to our HIPAA Privacy Officer via our <Link to="/contact" className="text-brand-primary font-bold hover:underline">Contact Page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
