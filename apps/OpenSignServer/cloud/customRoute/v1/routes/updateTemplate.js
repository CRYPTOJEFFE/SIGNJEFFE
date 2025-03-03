export default async function updateTemplate(request, response) {
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
      const allowedKeys = ['Name', 'Note', 'Description'];
      const objectKeys = Object.keys(request.body);
      const isValid = objectKeys.every(key => allowedKeys.includes(key)) && objectKeys.length > 0;
      if (isValid) {
        const userId = { __type: 'Pointer', className: '_User', objectId: id };
        const template = new Parse.Query('contracts_Template');
        template.equalTo('objectId', request.params.template_id);
        template.equalTo('CreatedBy', userId);
        const res = await template.first({ useMasterKey: true });
        if (res) {
          const isArchive = res.get('IsArchive');
          if (isArchive && isArchive) {
            return response.status(404).json({ message: 'Template not found!' });
          } else {
            const template = Parse.Object.extend('contracts_Template');
            const updateQuery = new template();
            updateQuery.id = request.params.template_id;
            if (request?.body?.Name) {
              updateQuery.set('Name', request?.body?.Name);
            }
            if (request?.body?.Note) {
              updateQuery.set('Note', request?.body?.Note);
            }
            if (request?.body?.Description) {
              updateQuery.set('Name', request?.body?.Description);
            }
            if (request?.body?.FolderId) {
              updateQuery.set('Folder', {
                __type: 'Pointer',
                className: 'contracts_Template',
                objectId: request?.body?.FolderId,
              });
            }
            const updatedRes = await updateQuery.save(null, { useMasterKey: true });
            if (updatedRes) {
              return response.json({
                objectId: updatedRes.id,
                updatedAt: updatedRes.get('updatedAt'),
              });
            }
          }
        } else {
          return response.status(404).json({ error: 'Template not found!' });
        }
      } else {
        return response.status(400).json({ error: 'Please provide valid field names!' });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.json(err);
  }
}
