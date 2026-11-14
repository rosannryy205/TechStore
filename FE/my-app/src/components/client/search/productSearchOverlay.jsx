import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useProductSearch } from "@/hooks/client/useProductSearch";
import { resolveProductImageUrl, handleImageError } from "@/utils/imageHelper";
import { formatVnd } from "@/utils/formatCurrency";

/** Hộp tìm kiếm được mount khi mở, nên đóng hộp sẽ hủy hook/request và query nháp. */
export default function ProductSearchOverlay({ onClose }) {
  const [query, setQuery] = useState("");
  const [composing, setComposing] = useState(false);
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const search = useProductSearch({ open: true, query, composing });

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    // Portal ở ngoài app root; inert ngăn Tab/click đi vào nền khi dialog đang mở.
    const background = [...document.body.children].filter(
      (node) => !node.contains(dialogRef.current),
    );
    const previousInert = background.map((node) => node.inert);
    background.forEach((node) => {
      node.inert = true;
    });
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key !== "Tab") return;
      const elements = [
        ...dialogRef.current.querySelectorAll(
          "a[href], button:not([disabled]), input:not([disabled])",
        ),
      ];
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      background.forEach((node, index) => {
        node.inert = previousInert[index];
      });
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [onClose]);

  const submit = (event) => {
    event.preventDefault();
    if (composing || !search.keyword || search.tooLong) return;
    navigate(`/products?q=${encodeURIComponent(search.keyword)}`);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 px-3 pt-6 backdrop-blur-sm sm:pt-24"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-search-title"
        className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl sm:max-h-[80dvh]"
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <h2
            id="product-search-title"
            className="text-lg font-semibold text-zinc-900"
          >
            Tìm kiếm sản phẩm
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng tìm kiếm"
            className="min-h-11 min-w-11 rounded-full text-xl hover:bg-zinc-100"
          >
            ×
          </button>
        </div>
        <form
          onSubmit={submit}
          className="flex gap-2 border-b border-zinc-100 px-5 py-4"
        >
          <label htmlFor="product-search-input" className="sr-only">
            Tên sản phẩm, thương hiệu hoặc danh mục
          </label>
          <input
            id="product-search-input"
            ref={inputRef}
            type="search"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={(event) => {
              setQuery(event.currentTarget.value);
              setComposing(false);
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                (composing || event.nativeEvent.isComposing)
              )
                event.preventDefault();
            }}
            placeholder="Tên sản phẩm, thương hiệu, danh mục..."
            aria-describedby="product-search-status"
            className="min-w-0 flex-1 rounded-xl border border-zinc-300 px-3 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="submit"
            disabled={composing || !search.keyword || search.tooLong}
            className="rounded-xl bg-blue-600 px-4 text-sm font-medium text-white disabled:opacity-40"
          >
            Tìm kiếm
          </button>
        </form>
        <div
          className="min-h-24 overflow-y-auto px-5 py-3"
          onScroll={(event) => {
            const node = event.currentTarget;
            if (node.scrollHeight - node.scrollTop - node.clientHeight < 80)
              search.loadMore();
          }}
        >
          <div
            id="product-search-status"
            role="status"
            aria-live="polite"
            className="py-2 text-sm text-zinc-600"
          >
            {search.tooLong
              ? "Từ khóa tối đa 100 ký tự."
              : !search.keyword
                ? "Nhập tên sản phẩm, thương hiệu hoặc danh mục để tìm kiếm."
                : composing
                  ? "Đang nhập từ khóa…"
                  : search.loading && !search.items.length
                    ? "Đang tìm sản phẩm…"
                    : search.error
                      ? "Không thể tải kết quả tìm kiếm."
                      : !search.items.length
                        ? "Không tìm thấy sản phẩm phù hợp"
                        : `${search.total} sản phẩm phù hợp`}
          </div>
          {search.error && (
            <div role="alert" className="my-3 text-sm text-red-700">
              <p>{search.error}</p>
              <button
                type="button"
                onClick={search.retry}
                className="mt-2 rounded-lg border border-red-200 px-4 py-2"
              >
                Thử lại
              </button>
            </div>
          )}
          <ul
            aria-label="Kết quả tìm kiếm"
            className="divide-y divide-zinc-100"
          >
            {search.items.map((product) => (
              <li key={product.id}>
                <Link
                  to={product.href}
                  onClick={onClose}
                  className="flex items-center gap-4 rounded-xl py-3 outline-none hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <img
                    src={resolveProductImageUrl(product.image)}
                    onError={handleImageError}
                    alt=""
                    className="h-16 w-16 shrink-0 object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-900">
                      {product.name}
                    </p>
                    <p className="mt-1 text-sm text-blue-700">
                      Từ {formatVnd(product.minPrice)}
                    </p>
                    {product.isOutOfStock && (
                      <span className="text-xs text-zinc-500">Hết hàng</span>
                    )}
                    {product.hasSale && (
                      <span className="ml-2 text-xs text-red-600">ƯU ĐÃI</span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {search.page > 0 && search.page < search.totalPages && (
            <button
              type="button"
              disabled={search.loading}
              onClick={search.loadMore}
              className="my-3 w-full rounded-xl bg-zinc-100 py-3 text-sm disabled:opacity-50"
            >
              {search.loading ? "Đang tải thêm…" : "Tải thêm sản phẩm"}
            </button>
          )}
        </div>
        {search.keyword && !search.tooLong && (
          <form onSubmit={submit} className="border-t border-zinc-100 p-4">
            <button
              type="submit"
              disabled={composing}
              className="w-full rounded-xl bg-blue-50 py-3 text-sm font-medium text-blue-700"
            >
              Xem tất cả kết quả
            </button>
          </form>
        )}
      </section>
    </div>,
    document.body,
  );
}
