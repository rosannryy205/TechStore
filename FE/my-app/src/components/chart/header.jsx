import { Bars3Icon, MagnifyingGlassIcon, BellIcon } from "@heroicons/react/24/outline";
import { SF_TEXT } from "@/constants/typography";

export default function Header({ setIsOpen }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200/80 bg-white/95 backdrop-blur-md px-4 shadow-xs md:px-6">
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button
          type="button"
          className="mr-4 inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl p-2 text-[#18181B] hover:bg-zinc-100 md:hidden transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Search */}
        <div className="hidden sm:flex max-w-md w-full items-center">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <MagnifyingGlassIcon className="h-4 w-4 text-[#71717A]" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="block w-full rounded-full border border-zinc-200/80 bg-zinc-50 py-2 pl-10 pr-4 text-[#18181B] placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] sm:text-[14px]"
              style={{ fontFamily: SF_TEXT }}
              placeholder="Tìm kiếm..."
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Notification button */}
        <button
          type="button"
          className="relative min-w-[44px] min-h-[44px] rounded-full bg-zinc-100 p-2.5 text-[#18181B] hover:bg-zinc-200/80 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          aria-label="Thông báo"
        >
          <BellIcon className="h-5 w-5" aria-hidden="true" />
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3B82F6]"></span>
          </span>
        </button>

        {/* Profile dropdown / Avatar */}
        <div className="relative ml-2">
          <button
            type="button"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            aria-label="Tài khoản quản trị"
          >
            <div className="h-9 w-9 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-xs border border-zinc-200">
              AD
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
