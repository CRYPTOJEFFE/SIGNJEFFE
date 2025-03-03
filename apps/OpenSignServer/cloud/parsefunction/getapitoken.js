import axios from 'axios';
export default async function getapitoken(request) {
  const serverUrl = process.env.SERVER_URL;
  try {
    const userRes = await axios.get(serverUrl + '/users/me', {
      headers: {
        'X-Parse-Application-Id': process.env.APP_ID,
        'X-Parse-Session-Token': request.headers['sessiontoken'],
      },
    });
    const userId = userRes.data && userRes.data.objectId;
    if (userId) {
      const tokenQuery = new Parse.Query('appToken');
      tokenQuery.equalTo('Id', userId);
      const res = await tokenQuery.first({ useMasterKey: true });
      if (res) {
        return { status: 'success', result: res.get('token') };
      }
    }
  } catch (err) {
    console.log('Err', err);
    return { status: 'error', result: err };
  }
}
