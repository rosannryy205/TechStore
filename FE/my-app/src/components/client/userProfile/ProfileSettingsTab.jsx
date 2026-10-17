import { SF_DISPLAY } from "@/constants/typography";

export default function ProfileSettingsTab({
  user,
  formName,
  setFormName,
  formPhone,
  setFormPhone,
  formAddress,
  setFormAddress,
  saving,
  saveMessage,
  onSaveProfile,
}) {
  return (
    <div className="bg-[#ffffff] rounded-[18px] border border-[#e0e0e0] p-6 sm:p-8">
      <h2
        className="text-[24px] font-semibold leading-[1.14] tracking-[0.196px] mb-8"
        style={{ fontFamily: SF_DISPLAY }}
      >
        Account Settings
      </h2>

      {saveMessage && (
        <div
          className={`mb-6 p-4 rounded-[11px] text-[14px] ${
            saveMessage.type === "success"
              ? "bg-[#e8f8ee] text-[#1d8a3d]"
              : "bg-[#fff0f0] text-[#e30000]"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      <form onSubmit={onSaveProfile} className="space-y-6 max-w-lg">
        <div>
          <label className="block text-[14px] font-semibold tracking-[-0.224px] text-[#1d1d1f] mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="w-full bg-[#f5f5f7] border border-[#e0e0e0] text-[#1d1d1f] text-[17px] rounded-[11px] px-4 py-2.75 focus:outline-none focus:bg-[#ffffff] focus:ring-4 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block text-[14px] font-semibold tracking-[-0.224px] text-[#1d1d1f] mb-2">
            Email Address
          </label>
          <div className="w-full bg-[#f5f5f7] border border-[#e0e0e0] text-[#7a7a7a] text-[17px] rounded-[11px] px-4 py-2.75 cursor-not-allowed">
            {user?.email || ""}
          </div>
          <p className="text-[12px] text-[#7a7a7a] mt-1">
            Email cannot be changed.
          </p>
        </div>

        <div>
          <label className="block text-[14px] font-semibold tracking-[-0.224px] text-[#1d1d1f] mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
            className="w-full bg-[#f5f5f7] border border-[#e0e0e0] text-[#1d1d1f] text-[17px] rounded-[11px] px-4 py-2.75 focus:outline-none focus:bg-[#ffffff] focus:ring-4 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all"
            placeholder="Your phone number"
          />
        </div>

        <div>
          <label className="block text-[14px] font-semibold tracking-[-0.224px] text-[#1d1d1f] mb-2">
            Shipping Address
          </label>
          <textarea
            value={formAddress}
            onChange={(e) => setFormAddress(e.target.value)}
            rows={3}
            className="w-full bg-[#f5f5f7] border border-[#e0e0e0] text-[#1d1d1f] text-[17px] rounded-[11px] px-4 py-2.75 focus:outline-none focus:bg-[#ffffff] focus:ring-4 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all resize-y"
            placeholder="Your shipping address"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[#0066cc] text-[#ffffff] px-6 py-2.75 rounded-full text-[17px] font-normal hover:bg-[#0071e3] active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
