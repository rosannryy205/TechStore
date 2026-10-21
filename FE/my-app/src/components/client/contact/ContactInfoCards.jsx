import { SF_DISPLAY } from "@/constants/typography";
import {
  PhoneIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
} from "./contactIcons";

export default function ContactInfoCards() {
  const cards = [
    {
      icon: PhoneIcon,
      title: "Call Us",
      desc: "Direct call for immediate support.",
      highlight: "1-800-MY-PJ26",
      footer: "Mon - Fri, 8:00 AM - 8:00 PM EST",
    },
    {
      icon: MapPinIcon,
      title: "Visit Us",
      desc: "Find the nearest store location.",
      highlight: "Store Locator",
      footer: "Experience our services first-hand",
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Community Support",
      desc: "Find answers from our expert community.",
      highlight: "Ask the Community",
      footer: "Available 24/7 online",
    },
    {
      icon: BriefcaseIcon,
      title: "Business & Enterprise",
      desc: "Custom support options for corporations.",
      highlight: "Contact Enterprise Sales",
      footer: "Custom solutions & volume pricing",
    },
  ];

  return (
    <section
      id="channels"
      className="w-full bg-[#272729] py-16 sm:py-24 px-6 sm:px-12 md:px-16"
    >
      <div className="max-w-360 mx-auto text-center">
        <h2
          className="text-[28px] md:text-[40px] font-semibold leading-[1.1] tracking-[-0.374px] text-white mb-12"
          style={{ fontFamily: SF_DISPLAY }}
        >
          Other ways to connect
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <article
                key={idx}
                className="bg-[#2a2a2c] rounded-[18px] border border-[#333333] p-6 flex flex-col justify-between min-h-55 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#444446]"
              >
                <div>
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Icon />
                  </div>
                  <h3 className="text-[17px] font-semibold text-white tracking-[-0.374px] mb-2">
                    {card.title}
                  </h3>
                  <p className="text-[14px] text-[#cccccc] leading-[1.43] tracking-[-0.224px]">
                    {card.desc}
                  </p>
                  <div className="mt-4 text-[17px] font-semibold text-[#2997ff]">
                    {card.highlight}
                  </div>
                </div>
                <div className="mt-4 text-[12px] text-[#7a7a7a]">
                  {card.footer}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
