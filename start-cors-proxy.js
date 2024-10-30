const corsAnywhere = require('cors-anywhere');

// Define the host and port
const host = 'localhost';
const port = 8080;

corsAnywhere.createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2']
}).listen(port, host, () => {
    console.log(`Request received: ${req.url}`);
});
