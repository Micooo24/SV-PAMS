import { Platform } from 'react-native'


let BASE_URL = '';

// HOST URLS  
// let jane_url =
// let janna_url =
// let lei_url =
let mico_url ='http://192.168.1.182:8000';

//LOCALHOST
{Platform.OS == 'android'
? BASE_URL = mico_url
: BASE_URL = 'http://192.168.1.182:8000'
}


//DEPLOYMENT
// {Platform.OS == 'android'
//     ? baseURL = ''
//     : baseURL = ''
//     }

export default BASE_URL;