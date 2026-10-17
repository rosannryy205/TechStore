import { SF_DISPLAY } from "@/constants/typography";

export default function ContactHeader({ headerHeight }) {
  return (
    <>
      {/* Frosted Sub-Navigation */}
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
            className="text-[#1d1d1f] hover:text-[#0066cc] transition-colors no-underline"
          >
            Form
          </a>
          <a
            href="#channels"
            className="text-[#1d1d1f] hover:text-[#0066cc] transition-colors no-underline"
          >
            Ways to Connect
          </a>
          <a
            href="#form"
            className="hidden sm:inline-flex h-7 items-center px-4 rounded-full bg-[#0066cc] text-white text-[12px] font-normal hover:bg-[#0071e3] transition-colors active:scale-[0.95] no-underline"
          >
            Get Help
          </a>
        </div>
      </nav>

      {/* Hero Section */}
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
    </>
  );
}
