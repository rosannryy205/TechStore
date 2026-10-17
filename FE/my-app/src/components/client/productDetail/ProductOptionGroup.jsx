import { SF_TEXT } from "@/constants/typography";

export default function ProductOptionGroup({ label, name, items, selectedId, onSelect }) {
  return (
    <div className="w-full">
      <div className="text-[14px] font-semibold tracking-[-0.224px] leading-[1.29] text-[#1d1d1f] mb-2">
        {label}
      </div>

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={name}>
        {items.map((it) => {
          const isSel = it.id === selectedId;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onSelect(it.id)}
              role="radio"
              aria-checked={isSel}
              aria-label={it.label}
              className={
                isSel
                  ? "px-4 py-2.5 rounded-full border-2 border-[#0071e3] bg-white/0 text-[#1d1d1f] text-[14px] font-normal tracking-[-0.224px] leading-[1.43] active:scale-95 transition-transform cursor-pointer"
                  : "px-4 py-2.5 rounded-full border border-[rgba(0,0,0,0.08)] bg-white text-[#1d1d1f] text-[14px] font-normal tracking-[-0.224px] leading-[1.43] hover:bg-[#f5f5f7] active:scale-95 transition-transform cursor-pointer"
              }
              style={{ fontFamily: SF_TEXT }}
            >
              {it.id === selectedId && "• "}
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
