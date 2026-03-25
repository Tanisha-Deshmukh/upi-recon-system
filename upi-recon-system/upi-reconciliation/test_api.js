import axios from 'axios';
async function test() {
   try {
       const res = await axios.get('http://localhost:8003/api/v1/users/login'); // GET will probably return 404, but not connection refused
       console.log('Got response', res.status);
   } catch(e) {
       console.log('Error', e.message);
   }
}
test();
