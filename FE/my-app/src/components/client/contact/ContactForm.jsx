import InlineAlert from "@/components/InlineAlert";
import { SF_DISPLAY } from "@/constants/typography";

export default function ContactForm({
  formData,
  alert,
  setAlert,
  submitting,
  onChange,
  onSubmit,
}) {
  return (
    <section id="form" className="w-full bg-[#ffffff] py-16 sm:py-24 px-6">
      <div className="max-w-160 mx-auto">
        <div className="text-center mb-10">
          <h2
            className="text-[28px] md:text-[34px] font-semibold tracking-[-0.374px] text-[#1d1d1f]"
            style={{ fontFamily: SF_DISPLAY }}
          >
            Send us a message
          </h2>
          <p className="mt-2 text-[14px] sm:text-[17px] text-[#7a7a7a]">
            Please fill out the form below and we will contact you back.
          </p>
        </div>

        {alert && (
          <div className="mb-8">
            <InlineAlert
              variant={alert.variant}
              title={alert.title}
              message={alert.message}
              onDismiss={() => setAlert(null)}
            />
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
          <div className="flex flex-col">
            <label
              htmlFor="contact-name"
              className="text-[12px] font-semibold tracking-[0.5px] uppercase text-[#1d1d1f] mb-2 pl-1"
            >
              Full Name
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={onChange}
              disabled={submitting}
              className="h-11 px-4 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#1d1d1f] bg-[#f5f5f7] rounded-lg border border-[#e0e0e0] outline-none transition-all duration-200 placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 focus:bg-white disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="contact-email"
              className="text-[12px] font-semibold tracking-[0.5px] uppercase text-[#1d1d1f] mb-2 pl-1"
            >
              Email Address
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              placeholder="example@domain.com"
              value={formData.email}
              onChange={onChange}
              disabled={submitting}
              className="h-11 px-4 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#1d1d1f] bg-[#f5f5f7] rounded-lg border border-[#e0e0e0] outline-none transition-all duration-200 placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 focus:bg-white disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="contact-topic"
              className="text-[12px] font-semibold tracking-[0.5px] uppercase text-[#1d1d1f] mb-2 pl-1"
            >
              What can we help you with?
            </label>
            <div className="relative">
              <select
                id="contact-topic"
                name="topic"
                value={formData.topic}
                onChange={onChange}
                disabled={submitting}
                className="w-full h-11 px-4 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#1d1d1f] bg-[#f5f5f7] rounded-lg border border-[#e0e0e0] outline-none appearance-none transition-all duration-200 focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 focus:bg-white disabled:opacity-60"
              >
                <option value="" disabled>Select a topic</option>
                <option value="Product Support">Product Support & Inquiry</option>
                <option value="Billing & Orders">Billing, Payments & Orders</option>
                <option value="Tech Support">Technical Support</option>
                <option value="Business Partnerships">Business Partnerships</option>
                <option value="Feedback">Feedback & Suggestions</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#7a7a7a]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="contact-message"
              className="text-[12px] font-semibold tracking-[0.5px] uppercase text-[#1d1d1f] mb-2 pl-1"
            >
              Your Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows="5"
              placeholder="Describe your request in detail..."
              value={formData.message}
              onChange={onChange}
              disabled={submitting}
              className="p-4 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#1d1d1f] bg-[#f5f5f7] rounded-lg border border-[#e0e0e0] outline-none transition-all duration-200 placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 focus:bg-white resize-y min-h-30 disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full h-11 rounded-full bg-[#0066cc] text-white text-[17px] font-normal tracking-[-0.374px] leading-[1.47] border-none cursor-pointer hover:bg-[#0071e3] active:scale-[0.95] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Sending Message...</span>
              </>
            ) : (
              "Send Message"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
