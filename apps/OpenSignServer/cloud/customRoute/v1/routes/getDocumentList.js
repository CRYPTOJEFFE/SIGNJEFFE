import axios from 'axios';
import reportJson from '../../../parsefunction/reportsJson.js';
import dotenv from 'dotenv';
dotenv.config();

export default async function getDocumentList(request, response) {
  const reqToken = request.headers['x-api-token'];
  const appId = process.env.APP_ID;
  const serverUrl = process.env.SERVER_URL;
  if (!reqToken) {
    return response.status(400).json({ error: 'Please Provide API Token' });
  }
  const tokenQuery = new Parse.Query('appToken');
  tokenQuery.equalTo('token', reqToken);
  const token = await tokenQuery.first({ useMasterKey: true });
  if (token !== undefined) {
    // Valid Token then proceed request
    const userId = token.get('Id');
    const docType = request.params.doctype;
    const limit = request?.query?.limit ? request.query.limit : 100;
    const skip = request?.query?.skip ? request.query.skip : 0;
    let reportId;
    switch (docType) {
      case 'draftdocuments':
        reportId = 'ByHuevtCFY';
        break;
      case 'signaturerequest':
        reportId = '4Hhwbp482K';
        break;
      case 'inprogressdocuments':
        reportId = '1MwEuxLEkF';
        break;
      case 'completedocuments':
        reportId = 'kQUoW4hUXz';
        break;
      case 'expiredocuments':
        reportId = 'zNqBHXHsYH';
        break;
      case 'declinedocuments':
        reportId = 'UPr2Fm5WY3';
        break;
      default:
        reportId = '';
    }
    const json = reportId && reportJson(reportId, userId);
    const clsName = 'contracts_Document';
    if (reportId && json) {
      const { params, keys } = json;
      const orderBy = '-updatedAt';
      const strParams = JSON.stringify(params);
      const strKeys = keys.join();
      const headers = {
        'Content-Type': 'application/json',
        'X-Parse-Application-Id': appId,
        'X-Parse-Master-Key': process.env.MASTER_KEY,
      };
      const url = `${serverUrl}/classes/${clsName}?where=${strParams}&keys=${strKeys}&order=${orderBy}&skip=${skip}&limit=${limit}&include=AuditTrail.UserPtr`;
      const res = await axios.get(url, { headers: headers });
      if (res.data && res.data.results.length > 0) {
        const updateRes = res.data.results.map(x => ({
          objectId: x.objectId,
          title: x.Name,
          note: x.Note || '',
          folder: x?.Folder?.Name || 'OpenSign™ Drive',
          file: x?.SignedUrl || x.URL,
          owner: x?.ExtUserPtr?.Name,
          signers: x?.Signers?.map(y => y?.Name) || '',
          created_at: x.createdAt,
          updated_at: x.updatedAt,
        }));
        return response.json({ result: updateRes });
      } else {
        return response.json({ result: [] });
      }
    } else {
      return response.status(404).json({ error: 'Report not available!' });
    }
  }
  return response.status(405).json({ error: 'Invalid API Token!' });
}
