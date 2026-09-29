import { useState, useEffect } from "react";
import InlineAlert from "../../components/InlineAlert";

const SF_DISPLAY = "SF Pro Display, system-ui, -apple-system, sans-serif";
const SF_TEXT = "SF Pro Text, system-ui, -apple-system, sans-serif";

/* ─── SVG Icons ─── */
function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6 text-[#2997ff]"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.802-5.122-4.1-6.924-6.924l1.293-.97a1.125 1.125 0 0 0 .417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6 text-[#2997ff]"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  );
}

function ChatBubbleLeftRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6 text-[#2997ff]"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379L12 21l3.12-3.12c1.153-.086 2.294-.21 3.423-.379 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v5.018Z"
      />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6 text-[#2997ff]"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 0 1 3.75 18.4v-4.25m16.5 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 14.15m17.25 0v-4.25a2.25 2.25 0 0 0-2.25-2.25H16.5V4.875A1.125 1.125 0 0 0 15.375 3.75H8.625a1.125 1.125 0 0 0-1.125 1.125V7.65H5.25A2.25 2.25 0 0 0 3 9.9v4.25m16.5 0h-16.5"
      />
    </svg>
  );
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  });
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Set document title on mount for SEO best practices & calculate header height
  useEffect(() => {
    document.title = "Contact Support - PJ26";

    const updateHeight = () => {
      const header = document.getElementById("global-header");
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    
    // Dynamic timer to handle rendering latency and layout recalculation
    const timer = setTimeout(updateHeight, 300);

    return () => {
      window.removeEventListener("resize", updateHeight);
      clearTimeout(timer);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAlert(null);

    // Simple validation
    if (!formData.name.trim()) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "Please enter your name.",
      });
      return;
    }

    if (!formData.email.trim()) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "Please enter your email.",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    if (!formData.topic) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "Please select a topic.",
      });
      return;
    }

    if (!formData.message.trim()) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "Please enter your message.",
      });
      return;
    }

    // Submit animation simulation (1.2s delay for premium feel)
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setAlert({
        variant: "success",
        title: "Message Sent",
        message: `Thank you, ${formData.name}! We've received your request about "${formData.topic}" and will reply to ${formData.email} shortly.`,
      });
      // Reset form
      setFormData({
        name: "",
        email: "",
        topic: "",
        message: "",
      });
    }, 1200);
  };

  return (
    <main className="w-full flex-1 bg-[#ffffff]" style={{ fontFamily: SF_TEXT }}>
      {/* ─── Frosted Sub-Navigation ─── */}
      <nav
        className="sticky z-40 h-13 w-full bg-[#f5f5f7]/80 backdrop-blur-[20px] border-b border-[#e0e0e0] flex items-center justify-between px-6 sm:px-12 md:px-16"
        style={{ top: `${headerHeight}px` }}
        aria-label="Sub Navigation"
      >
        <div
          className="text-[18px] sm:text-[21px] font-semibold text-[#1d1d1f] tracking-[0.231px]"
          style={{ fontFamily: SF_DISPLAY }}
        >
          Contact Support
        </div>
        <div className="flex items-center gap-6 text-[12px] sm:text-[14px]">
          <a
            href="#form"
            className="text-[#1d1d1f] hover:text-[#0066cc] transition-colors"
          >
            Form
          </a>
          <a
            href="#channels"
            className="text-[#1d1d1f] hover:text-[#0066cc] transition-colors"
          >
            Ways to Connect
          </a>
          <a
            href="#form"
            className="hidden sm:inline-flex h-7 items-center px-4 rounded-full bg-[#0066cc] text-white text-[12px] font-normal hover:bg-[#0071e3] transition-colors active:scale-[0.95]"
          >
            Get Help
          </a>
        </div>
      </nav>

      {/* ─── Hero Section (Parchment Tile) ─── */}
      <section className="w-full bg-[#f5f5f7] py-16 sm:py-24 text-center px-6 sm:px-12">
        <div className="max-w-245 mx-auto flex flex-col items-center">
          <h1
            className="text-[40px] md:text-[56px] font-semibold tracking-[-0.28px] sm:tracking-[-1.68px] leading-[1.07] text-[#1d1d1f]"
            style={{ fontFamily: SF_DISPLAY }}
          >
            We're here to help.
          </h1>
          <p className="mt-4 text-[17px] md:text-[21px] font-normal leading-[1.47] tracking-[-0.374px] text-[#333333] max-w-[65ch]">
            Whether you have a question about features, pricing, orders, or anything else, our team is ready to answer all your inquiries.
          </p>
        </div>
      </section>

      {/* ─── Contact Form Section (White Tile) ─── */}
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
            {/* Name Input */}
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
                onChange={handleChange}
                disabled={submitting}
                className="h-11 px-4 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#1d1d1f] bg-[#f5f5f7] rounded-lg border border-[#e0e0e0] outline-none transition-all duration-200 placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 focus:bg-white disabled:opacity-60"
              />
            </div>

            {/* Email Input */}
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
                onChange={handleChange}
                disabled={submitting}
                className="h-11 px-4 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#1d1d1f] bg-[#f5f5f7] rounded-lg border border-[#e0e0e0] outline-none transition-all duration-200 placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 focus:bg-white disabled:opacity-60"
              />
            </div>

            {/* Topic Select */}
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
                  onChange={handleChange}
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

            {/* Message Textarea */}
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
                onChange={handleChange}
                disabled={submitting}
                className="p-4 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#1d1d1f] bg-[#f5f5f7] rounded-lg border border-[#e0e0e0] outline-none transition-all duration-200 placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 focus:bg-white resize-y min-h-30 disabled:opacity-60"
              />
            </div>

            {/* Submit Button */}
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

      {/* ─── Other Support Channels Section (Dark Tile) ─── */}
      <section id="channels" className="w-full bg-[#272729] py-16 sm:py-24 px-6 sm:px-12 md:px-16">
        <div className="max-w-360 mx-auto text-center">
          <h2
            className="text-[28px] md:text-[40px] font-semibold leading-[1.1] tracking-[-0.374px] text-white mb-12"
            style={{ fontFamily: SF_DISPLAY }}
          >
            Other ways to connect
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {/* Phone Card */}
            <article className="bg-[#2a2a2c] rounded-[18px] border border-[#333333] p-6 flex flex-col justify-between min-h-55 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#444446]">
              <div>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <PhoneIcon />
                </div>
                <h3 className="text-[17px] font-semibold text-white tracking-[-0.374px] mb-2">
                  Call Us
                </h3>
                <p className="text-[14px] text-[#cccccc] leading-[1.43] tracking-[-0.224px]">
                  Direct call for immediate support.
                </p>
                <div className="mt-4 text-[17px] font-semibold text-[#2997ff]">
                  1-800-MY-PJ26
                </div>
              </div>
              <div className="mt-4 text-[12px] text-[#7a7a7a]">
                Mon - Fri, 8:00 AM - 8:00 PM EST
              </div>
            </article>

            {/* Location Card */}
            <article className="bg-[#2a2a2c] rounded-[18px] border border-[#333333] p-6 flex flex-col justify-between min-h-55 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#444446]">
              <div>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <MapPinIcon />
                </div>
                <h3 className="text-[17px] font-semibold text-white tracking-[-0.374px] mb-2">
                  Visit Us
                </h3>
                <p className="text-[14px] text-[#cccccc] leading-[1.43] tracking-[-0.224px]">
                  Find the nearest store location.
                </p>
                <div className="mt-4 text-[17px] font-semibold text-[#2997ff]">
                  Store Locator
                </div>
              </div>
              <div className="mt-4 text-[12px] text-[#7a7a7a]">
                Experience our services first-hand
              </div>
            </article>

            {/* Community Support */}
            <article className="bg-[#2a2a2c] rounded-[18px] border border-[#333333] p-6 flex flex-col justify-between min-h-55 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#444446]">
              <div>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <ChatBubbleLeftRightIcon />
                </div>
                <h3 className="text-[17px] font-semibold text-white tracking-[-0.374px] mb-2">
                  Community Support
                </h3>
                <p className="text-[14px] text-[#cccccc] leading-[1.43] tracking-[-0.224px]">
                  Find answers from our expert community.
                </p>
                <div className="mt-4 text-[17px] font-semibold text-[#2997ff]">
                  Ask the Community
                </div>
              </div>
              <div className="mt-4 text-[12px] text-[#7a7a7a]">
                Available 24/7 online
              </div>
            </article>

            {/* Enterprise Support */}
            <article className="bg-[#2a2a2c] rounded-[18px] border border-[#333333] p-6 flex flex-col justify-between min-h-55 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#444446]">
              <div>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <BriefcaseIcon />
                </div>
                <h3 className="text-[17px] font-semibold text-white tracking-[-0.374px] mb-2">
                  Business & Enterprise
                </h3>
                <p className="text-[14px] text-[#cccccc] leading-[1.43] tracking-[-0.224px]">
                  Custom support options for corporations.
                </p>
                <div className="mt-4 text-[17px] font-semibold text-[#2997ff]">
                  Contact Enterprise Sales
                </div>
              </div>
              <div className="mt-4 text-[12px] text-[#7a7a7a]">
                Custom solutions & volume pricing
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}