const options = {
  headers: {
    'Content-Type': 'application/json',
    'x-gemini-api-key': ''
  }
};
const headers = new Headers(options.headers);
headers.delete('x-gemini-api-key');
console.log(Array.from(headers.entries()));
