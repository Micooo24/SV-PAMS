import { Platform } from 'react-native'


let BASEURL = '';

//LOCALHOST
{Platform.OS == 'android'
? BASEURL = 'http://192.168.1.182:8000'
: BASEURL = 'http://172.20.10.3:8000'
}


//DEPLOYMENT
// {Platform.OS == 'android'
//     ? baseURL = ''
//     : baseURL = ''
//     }

export default BASEURL;