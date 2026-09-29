const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function test() {
  const form = new FormData();
  form.append('name', 'Test Product');
  form.append('category_id', '1');
  form.append('brand_id', '1');
  form.append('description', 'Test Description');
  form.append('status', '1');

  const variants = [
    {
      sku: 'TEST-SKU',
      price: '1000',
      sale_price: '900',
      stock: 100,
      status: 1,
      attributes: [
        { attribute_id: 1, value: 'Red' }
      ]
    }
  ];
  form.append('variants', JSON.stringify(variants));

  try {
    const res = await axios.post('http://localhost:3000/api/admin/products', form, {
      headers: form.getHeaders(),
    });
    console.log('Success:', res.data);
  } catch (err) {
    if (err.response) {
      console.log('Error status:', err.response.status);
      console.log('Error data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.log('Error:', err.message);
    }
  }
}

test();
