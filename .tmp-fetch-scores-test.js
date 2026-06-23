const fetch = require('node:fetch');
const body = JSON.stringify({ query: 'query{scores{id score grade remark student{fullName className} subject{name}}}' });
fetch('http://localhost:4000/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
  .then(async (res) => {
    console.log('status', res.status);
    console.log(await res.text());
  })
  .catch((err) => {
    console.error(err);
  });
