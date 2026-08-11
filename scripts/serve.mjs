import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8'
};

const server = createServer(async (request, response) => {
    const requestedPath = request.url === '/' ? '/index.html' : request.url.split('?')[0];
    const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
    const filePath = join(root, safePath);

    try {
        const fileStat = await stat(filePath);
        if (!fileStat.isFile()) throw new Error('Not a file');

        response.writeHead(200, {
            'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream'
        });
        createReadStream(filePath).pipe(response);
    } catch {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Not found');
    }
});

server.listen(port, '127.0.0.1', () => {
    console.log(`Jitter test server listening on http://127.0.0.1:${port}`);
});
