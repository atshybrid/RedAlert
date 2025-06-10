const axios = require('axios');

const BASE_URL = 'http://localhost:3004';

async function testRoleBasedAccess() {
  console.log('🔐 Testing Role-Based Access Control...\n');

  try {
    // Step 1: Login with admin user
    console.log('1. 🔑 Logging in with admin user...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      phone: '6355340577',
      mpin: '123456'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.data.token;
    const userRole = loginResponse.data.data.role;
    console.log(`✅ Login successful! User role: ${userRole}`);
    console.log(`🎫 Token: ${token.substring(0, 20)}...`);

    // Step 2: Test GET request (should work for any authenticated user)
    console.log('\n2. 📋 Testing GET request (should work for any role)...');
    try {
      const getResponse = await axios.get(`${BASE_URL}/api/locations/countries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ GET request successful: ${getResponse.data.message}`);
    } catch (error) {
      console.log(`❌ GET request failed: ${error.response?.data?.message || error.message}`);
    }

    // Step 3: Test POST request (should work for admin/desk roles)
    console.log('\n3. ➕ Testing POST request (admin/desk only)...');
    try {
      const postResponse = await axios.post(`${BASE_URL}/api/locations/countries`, {
        name: 'Test Country',
        code: 'TC'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ POST request successful: ${postResponse.data.message}`);
      
      // Store the created country ID for cleanup
      const countryId = postResponse.data.data.id;
      
      // Step 4: Test PATCH request (should work for admin/desk roles)
      console.log('\n4. ✏️ Testing PATCH request (admin/desk only)...');
      try {
        const patchResponse = await axios.patch(`${BASE_URL}/api/locations/countries/${countryId}`, {
          name: 'Updated Test Country'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ PATCH request successful: ${patchResponse.data.message}`);
      } catch (error) {
        console.log(`❌ PATCH request failed: ${error.response?.data?.message || error.message}`);
      }

      // Step 5: Test DELETE request (should work for admin only)
      console.log('\n5. 🗑️ Testing DELETE request (admin only)...');
      try {
        const deleteResponse = await axios.delete(`${BASE_URL}/api/locations/countries/${countryId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ DELETE request successful: ${deleteResponse.data.message}`);
      } catch (error) {
        console.log(`❌ DELETE request failed: ${error.response?.data?.message || error.message}`);
      }

    } catch (error) {
      console.log(`❌ POST request failed: ${error.response?.data?.message || error.message}`);
    }

    // Step 6: Test without token (should fail)
    console.log('\n6. 🚫 Testing request without token (should fail)...');
    try {
      await axios.get(`${BASE_URL}/api/locations/countries`);
      console.log('❌ Request without token should have failed!');
    } catch (error) {
      console.log(`✅ Request without token correctly failed: ${error.response?.status} ${error.response?.statusText}`);
    }

    // Step 7: Test with invalid token (should fail)
    console.log('\n7. 🔒 Testing request with invalid token (should fail)...');
    try {
      await axios.get(`${BASE_URL}/api/locations/countries`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      console.log('❌ Request with invalid token should have failed!');
    } catch (error) {
      console.log(`✅ Request with invalid token correctly failed: ${error.response?.status} ${error.response?.statusText}`);
    }

    console.log('\n🎉 Role-based access control testing completed!');

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

// Run the test
testRoleBasedAccess();
