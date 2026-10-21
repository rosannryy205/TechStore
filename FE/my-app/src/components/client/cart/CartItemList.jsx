import CartItemRow from "./cartItemRow";

export default function CartItemList({
  items,
  hasMounted,
  updatingItemId,
  onChangeQuantity,
  onRemoveItem,
}) {
  return (
    <div className="border-t border-[#e0e0e0]">
      {items.map((item, index) => (
        <CartItemRow
          key={item.id}
          item={item}
          index={index}
          hasMounted={hasMounted}
          updatingItemId={updatingItemId}
          onChangeQuantity={onChangeQuantity}
          onRemoveItem={onRemoveItem}
        />
      ))}
    </div>
  );
}
