const ContactPage = () => {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6 text-center">
      <h1 className="text-4xl font-bold mb-6 text-brand-navy">Get in Touch</h1>
      <p className="text-lg text-gray-600 mb-12">
        Have questions about the tool or need technical support? We are here to help.
      </p>
      <div className="bg-brand-surface p-10 rounded-3xl border border-gray-100 shadow-sm text-left">
        <form action="https://formsubmit.co/asadalilodhi09@gmail.com" method="POST" className="space-y-6">
          <input type="hidden" name="_subject" value="New MedClear Contact Form Submission!" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_template" value="table" />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input type="text" name="name" required className="w-full border border-gray-300 rounded-xl p-3 focus:ring-brand-sage focus:border-brand-sage outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" name="email" required className="w-full border border-gray-300 rounded-xl p-3 focus:ring-brand-sage focus:border-brand-sage outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea name="message" rows={4} required className="w-full border border-gray-300 rounded-xl p-3 focus:ring-brand-sage focus:border-brand-sage outline-none"></textarea>
          </div>
          <button type="submit" className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-opacity-90 transition shadow-md">
            Send Message
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-6 text-center font-medium">
          * Do not send sensitive medical information through this form.
        </p>
      </div>
    </div>
  );
};

export default ContactPage;
