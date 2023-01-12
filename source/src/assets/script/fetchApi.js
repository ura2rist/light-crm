class FetchApi {
  constructor() {
    this.url = 'http://localhost:3000'
  }

  getClients() {
    return fetch(this.url + '/api/clients').then(response => response.json());
  }

  setClients(data) {
    return fetch(this.url + '/api/clients', {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(response => response.json());
  }

  getClient(id) {
    return fetch(this.url + '/api/clients/' + id).then(response => response.json());
  }

  setRewrite(id, data) {
    return fetch(this.url + '/api/clients/' + id, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }).then(response => response.json());
  }

  removeClient(id) {
    return fetch(this.url + '/api/clients/' + id, {
      method: 'DELETE',
    }).then(response => response.json());
  }

  searchClient(query) {
    return fetch(this.url + '/api/clients?search=' + query).then(response => response.json());
  }
}

const fetchApi = new FetchApi;

export default fetchApi;