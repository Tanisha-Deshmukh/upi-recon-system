import axios from 'axios';
async function login() {
    try {
        const res = await axios.post('http://localhost:8003/api/v1/users/login', {
            email: "tanishadeshmukh38@gmail.com",
            password: "_tanisha_.001"
        });
        console.log("Login Success:", res.data);
    } catch (e) {
        console.error("Login Failed:", e.response?.data || e.message);
    }
}
login();
