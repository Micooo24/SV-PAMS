import { Platform } from 'react-native'


let BASE_URL = '';

//LOCALHOST
{Platform.OS == 'android'
? BASE_URL = 'http://192.168.100.78:8000'
: BASE_URL = 'http://192.168.27.70:8000'
}


//DEPLOYMENT
// {Platform.OS == 'android'
//     ? baseURL = ''
//     : baseURL = ''
//     }

export default BASE_URL;