const axios = require('axios');

async function test() {
    try {
        const response = await axios.post('http://localhost:5002/api/auth/login', {
            email: 'admin@purevit.com',
            password: '123456'
        });
        console.log('Login successful:', response.data.email);
        console.log('Role:', response.data.role);
    } catch (error) {
        console.error('Login failed:', error.response ? error.response.data : error.message);
    }
}

test();
