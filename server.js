const http = require('http');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

const logEvents = require('./logEvents');
const EventEmitter = require('events');
class Emitter extends EventEmitter{ }; //calling the emitter class
// Initialize Object
const myEmitter = new Emitter();
//add listener for a log event
myEmitter.on('log', (msgs, fileName) => logEvents(msgs, fileName)); //Listener to listen to a log event. Log events send the message
//define a port address
//const PORT = process.env.PORT || 5000;
const serveFile = async (filePath, contentType, response) =>{
    try{
        const rawData = await fsPromises.readFile(filePath,
             !contentType.includes('image') ? 'utf8' : ''
             );
        const data = contentType === 'application/json'
        ? JSON.parse(rawData) : rawData;
        response.writeHead(
            filePath.includes('404.html') ? 404 : 200,
            {'Content-Type': contentType});
        response.end(
            contentType === 'application/json' ? JSON.stringify(data) : data
        );
    } catch (err) {
        console.log(err);
        myEmitter.emit('log', `${err.name}: ${err.message}`, 'errLog.txt');
        response.statusCode = 500;
        response.end();
    }
}

const server = http.createServer((req,res) => {
    console.log(req.url, req.method);
    //Emit event Notification
    myEmitter.emit('log', `${req.url}\t${req.method}`, 'reqLog.txt');

    const extension = path.extname(req.url);

    let contentType;

    switch (extension) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.jpg':
            contentType = 'image/jpeg';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.txt':
            contentType = 'text/plain';
            break;
        case '.pdf':
            contentType = 'text/pdf';
            break;
        case '.docx':
            contentType = 'text/docx';
            break;
        default:
            contentType = 'text/html';
    }
//Chain Tenery statement
    let filePath = 
        contentType === 'text/html' && req.url === '/' //If the content type is html and the request url is just a slash, 
            ? path.join(__dirname, 'views', 'index.html') // then, direct it to views folder containing html file
            : contentType === 'text/html' && req.url.slice(-1) === '/'  //These statements an also be put inside if conditions.
                ? path.join(__dirname, 'views', req.url, 'index.html')
                : contentType === 'text/html'
                    ? path.join(__dirname, 'views', req.url)
                    : path.join(__dirname, req.url);
    
    //makes the .html extension not required in the browser.
    if (!extension && req.url.slice(-1) !== '/') filePath += '.html';

    const fileExists = fs.existsSync(filePath);

    if (fileExists){
        serveFile(filePath, contentType,res);

    } else {
        switch (path.parse(filePath).base) {
            case 'old-page.html':
                res.writeHead(301, { 'Location': '.img/img2.jpg' });
                res.end();
                break;
            case 'web-page.html':
                res.writeHead(301, { 'Location': '/' });
                res.end();
                break;
            default:
                serveFile(path.join(__dirname, 'views', '404.html'), 'text/html', res);
            }
    }   
});
server.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));
