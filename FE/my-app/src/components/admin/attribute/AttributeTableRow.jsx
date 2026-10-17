import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function AttributeTableRow({ attribute }) {
  const valuesArray = typeof attribute.values === "string"
    ? attribute.values.split(",")
    : Array.isArray(attribute.values)
      ? attribute.values
      : [];

  return (
    <tr className="transition-colors hover:bg-gray-50">
      <td className="whitespace-nowrap px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{attribute.name}</div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {valuesArray.map((val, idx) => (
          <span
            key={idx}
            className="inline-block mr-1 mb-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200"
          >
            {typeof val === "string" ? val.trim() : val?.value || val}
          </span>
        ))}
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            attribute.status === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {attribute.status === 1 ? "Đang hoạt động" : "Tạm ẩn"}
        </span>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
        <button className="mx-2 text-[#0066cc] transition-colors hover:text-[#005bb5] cursor-pointer">
          <PencilSquareIcon className="h-5 w-5" />
        </button>
        <button className="text-red-500 transition-colors hover:text-red-700 cursor-pointer">
          <TrashIcon className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
}
