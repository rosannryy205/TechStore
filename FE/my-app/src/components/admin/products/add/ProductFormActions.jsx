export function ProductFormActions({ submitting, onCancel }) {
  return (
    <div className="flex flex-col-reverse justify-end gap-3 pt-4 sm:flex-row">
      <button
        type="button"
        onClick={onCancel}
        disabled={submitting}
        className="rounded-full px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-[#0066cc] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2 disabled:opacity-50"
      >
        {submitting ? "Saving..." : "Save Product"}
      </button>
    </div>
  );
}
