export default async function getDocument(request, response) {
  try {
    const reqToken = request.headers['x-api-token'];
    if (!reqToken) {
      return response.status(400).json({ error: 'Please Provide API Token' });
    }
    const tokenQuery = new Parse.Query('appToken');
    tokenQuery.equalTo('token', reqToken);
    const token = await tokenQuery.first({ useMasterKey: true });
    if (token !== undefined) {
      // Valid Token then proceed request
      const id = token.get('Id');
      const userId = { __type: 'Pointer', className: '_User', objectId: id };
      const Document = new Parse.Query('contracts_Document');
      Document.equalTo('objectId', request.params.document_id);
      Document.equalTo('CreatedBy', userId);
      Document.notEqualTo('IsArchive', true);
      Document.include('Signers');
      Document.include('Folder');
      Document.include('ExtUserPtr');
      const res = await Document.first({ useMasterKey: true });
      if (res) {
        const document = JSON.parse(JSON.stringify(res));
        return response.json({
          objectId: document.objectId,
          Title: document.Name,
          Note: document.Note || '',
          Folder: document?.Folder?.Name || 'OpenSign™ Drive',
          File: document?.SignedUrl || document.URL,
          Owner: document?.ExtUserPtr?.Name,
          Signers: document?.Signers?.map(y => y?.Name) || '',
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
        });
      } else {
        return response.status(404).json({ error: 'Document not found!' });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.json(err);
  }
}
