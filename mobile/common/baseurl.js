import { Platform } from 'react-native'


let BASE_URL = '';

//LOCALHOST
{Platform.OS == 'android'
? BASE_URL = 'http://192.168.1.182:8000'
: BASE_URL = 'http://172.20.10.3:8000'
}


//DEPLOYMENT
// {Platform.OS == 'android'
//     ? baseURL = ''
//     : baseURL = ''
//     }

export default BASE_URL;