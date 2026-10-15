export function generateVariantMatrix(selectedAttributesMap, existingVariants = [], productName = "") {
  // selectedAttributesMap: { [attrId]: { attr: AttributeObj, options: [OptionObj1, OptionObj2] } }
  
  const attributeIds = Object.keys(selectedAttributesMap);
  if (attributeIds.length === 0) return [];

  // Arrays of options for each attribute
  const optionsArrays = attributeIds.map(attrId => {
    return selectedAttributesMap[attrId].options.map(opt => ({
      attribute_id: Number(attrId),
      attribute: selectedAttributesMap[attrId].attr,
      value: opt.value, // value string
      option_id: opt.id // reference to option
    }));
  });

  // Cartesian product algorithm
  const cartesianProduct = (arrays) => {
    return arrays.reduce((acc, currArray) => {
      const newAcc = [];
      acc.forEach(accCombination => {
        currArray.forEach(currItem => {
          newAcc.push([...accCombination, currItem]);
        });
      });
      return newAcc;
    }, [[]]); // Start with array containing an empty combination
  };

  const combinations = cartesianProduct(optionsArrays);

  // Compare and merge with existing variants to preserve price/stock/sku
  return combinations.map(combination => {
    // Generate an automatic SKU based on Product Name and Combination Values
    const attrValuesStr = combination.map(c => c.value.replace(/\s+/g, '')).join('-');
    const defaultSku = `${productName.replace(/\s+/g, '-').toUpperCase()}-${attrValuesStr}`.replace(/[^A-Z0-9-]/g, '');

    // Check if this combination already exists
    const existing = existingVariants.find(v => {
      // Find if every attribute in combination exactly matches the variant's attributes
      if (!v.attributes && !v.attributeValues) return false;
      const vAttrs = v.attributes || v.attributeValues; // Check for both formatted and raw structures
      
      return combination.every(c => {
        return vAttrs.some(va => 
          Number(va.attribute_id) === Number(c.attribute_id) && 
          String(va.value) === String(c.value)
        );
      });
    });

    if (existing) {
      return {
        ...existing,
        // Ensure attributes are formatted correctly for backend submission
        attributes: combination.map(c => ({
          attribute_id: c.attribute_id,
          value: c.value
        }))
      };
    }

    // Return new variant structure
    return {
      sku: defaultSku,
      price: 0,
      salePrice: 0,
      stock: 0,
      status: 1,
      attributes: combination.map(c => ({
        attribute_id: c.attribute_id,
        value: c.value
      }))
    };
  });
}
