import { SF_DISPLAY, SF_TEXT } from "@/constants/typography";

export default function DashboardHeader() {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1
          className="text-[34px] font-semibold text-[#1d1d1f]"
          style={{
            fontFamily: SF_DISPLAY,
            letterSpacing: "-0.374px",
            lineHeight: 1.1,
          }}
        >
          Dashboard
        </h1>
        <p
          className="mt-1 text-[17px] text-[#7a7a7a]"
          style={{
            fontFamily: SF_TEXT,
            letterSpacing: "-0.374px",
          }}
        >
          Overview of your store's performance.
        </p>
      </div>
      <div className="mt-4 md:mt-0">
        <button
          className="inline-flex items-center justify-center rounded-full bg-[#0066cc] px-5 py-2.5 text-[14px] font-medium text-white transition-transform hover:scale-95 focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2 cursor-pointer"
          style={{
            fontFamily: SF_TEXT,
            letterSpacing: "-0.224px",
          }}
        >
          Download Report
        </button>
      </div>
    </div>
  );
}
