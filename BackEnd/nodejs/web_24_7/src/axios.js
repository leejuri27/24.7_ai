import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://20.249.87.104:3000/trainer',
    headers: {
        accept: 'application/json',
    },
});

export default instance;
