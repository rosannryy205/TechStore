import { useRef, useState } from "react";
import { inspectProductKeyword } from "@/utils/productSearch";

/** Form trên trang chỉ submit khi Enter/bấm nút; key ở parent đồng bộ khi Back/Forward. */
export default function ProductSearchForm({ initialQuery, onSearch, onClear }) {
  const [draft, setDraft] = useState(initialQuery);
  const composingRef = useRef(false);
  const { keyword, tooLong } = inspectProductKeyword(draft);
  return (
    <div className="mx-auto mb-8 max-w-2xl">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!composingRef.current && !tooLong) onSearch(keyword);
        }}
      >
        <label htmlFor="products-query" className="sr-only">
          Tìm kiếm sản phẩm
        </label>
        <input
          id="products-query"
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onCompositionStart={() => {
            composingRef.current = true;
          }}
          onCompositionEnd={() => {
            composingRef.current = false;
          }}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              (composingRef.current || event.nativeEvent.isComposing)
            )
              event.preventDefault();
          }}
          placeholder="Tìm sản phẩm, thương hiệu, danh mục…"
          aria-describedby={tooLong ? "products-query-error" : undefined}
          className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="submit"
          disabled={tooLong}
          className="rounded-xl bg-blue-600 px-4 text-sm font-medium text-white disabled:opacity-40"
        >
          Tìm kiếm
        </button>
      </form>
      {tooLong && (
        <p
          id="products-query-error"
          role="alert"
          className="mt-2 text-sm text-red-700"
        >
          Từ khóa tối đa 100 ký tự.
        </p>
      )}
      {initialQuery && (
        <button
          type="button"
          onClick={() => {
            setDraft("");
            onClear();
          }}
          className="mt-3 text-sm text-blue-700 underline"
        >
          Xóa từ khóa
        </button>
      )}
    </div>
  );
}
