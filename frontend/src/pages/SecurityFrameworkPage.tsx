import React from 'react';

const SecurityFrameworkPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6 text-brand-text">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold font-heading text-brand-primary mb-4">Security Framework</h1>
        <p className="text-xl text-brand-text/70 italic font-heading">Our Unified SOC 2 + HIPAA Architecture</p>
      </div>

      <div className="bg-brand-surface p-12 rounded-3xl border border-brand-primary/10 shadow-sm space-y-12">
        
        <section>
          <p className="text-lg leading-relaxed text-brand-text/90">
            At MedClear, we understand that healthcare applications require the highest standard of security. We do not rely on "security by obscurity." Instead, we have architected a multilayered, modern security posture that integrates the stringent technical safeguards of <strong>HIPAA</strong> with the operational trust principles of <strong>SOC 2 Type II</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-brand-primary font-heading mb-4">Unified Control Framework</h2>
          <p className="text-lg leading-relaxed text-brand-text/90 mb-4">
            Rather than treating HIPAA and SOC 2 as isolated compliance checklists, MedClear operates on a unified control framework mapped to the <strong>NIST Cybersecurity Framework</strong>. This ensures that the 70-80% overlap between SOC 2 Trust Services Criteria (Security, Availability, Confidentiality) and HIPAA's Security Rule is met with robust, auditable engineering.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-brand-primary font-heading mb-4">Technical Safeguards & Zero Trust</h2>
          <div className="grid md:grid-cols-2 gap-8 mt-6">
            <div className="bg-brand-offwhite p-6 rounded-xl border border-brand-primary/10">
              <h3 className="text-xl font-bold text-brand-primary mb-2">Encryption Standards</h3>
              <p className="text-brand-text/80">All data in transit is encrypted using TLS 1.3. Any operational data stored at rest within our Supabase Postgres clusters is encrypted using AES-256.</p>
            </div>
            <div className="bg-brand-offwhite p-6 rounded-xl border border-brand-primary/10">
              <h3 className="text-xl font-bold text-brand-primary mb-2">Zero Trust Architecture</h3>
              <p className="text-brand-text/80">We enforce strict Identity and Access Management (IAM), requiring Multi-Factor Authentication (MFA) and the principle of least privilege for all internal developer access.</p>
            </div>
            <div className="bg-brand-offwhite p-6 rounded-xl border border-brand-primary/10">
              <h3 className="text-xl font-bold text-brand-primary mb-2">Ephemeral Processing</h3>
              <p className="text-brand-text/80">Our core FastAPI inference engine operates statelessly. Patient financial inputs exist only in memory during the RAG pipeline execution and are aggressively garbage-collected.</p>
            </div>
            <div className="bg-brand-offwhite p-6 rounded-xl border border-brand-primary/10">
              <h3 className="text-xl font-bold text-brand-primary mb-2">Continuous Security Testing</h3>
              <p className="text-brand-text/80">We integrate automated Static (SAST) and Dynamic (DAST) Application Security Testing directly into our CI/CD pipelines to catch vulnerabilities pre-deployment.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-brand-primary font-heading mb-4">Third-Party Risk & AI Infrastructure</h2>
          <p className="text-lg leading-relaxed text-brand-text/90 mb-4">
            A significant portion of healthcare breaches originate in the supply chain. MedClear manages third-party risk aggressively:
          </p>
          <ul className="list-disc pl-6 space-y-3 text-lg text-brand-text/90">
            <li><strong>Business Associate Agreements (BAAs):</strong> We hold executed BAAs with our cloud hosting providers and LLM API vendors (such as OpenAI/Groq for Llama 3 models), legally binding them to zero-retention policies.</li>
            <li><strong>Continuous Validation:</strong> We continuously monitor the SOC 2 compliance status of our critical sub-processors.</li>
          </ul>
        </section>

        <section className="bg-brand-primary text-white p-8 rounded-2xl">
          <h2 className="text-2xl font-bold font-heading mb-4">Commitment to Auditable Trust</h2>
          <p className="text-lg leading-relaxed text-white/90">
            Security is not a point-in-time state; it is a continuous operational discipline. MedClear maintains comprehensive, automated audit trails and incident response playbooks to ensure that our commitment to patient confidentiality is mathematically provable and legally sound.
          </p>
        </section>

      </div>
    </div>
  );
};

export default SecurityFrameworkPage;
