export default {
    port: 3001,
    fetch(request) {
        const url = new URL(request.url);
        let path = url.pathname === '/' ? '/sudoku.html' : url.pathname;
        
        const ext = path.split('.').pop();
        const types = {
            'html': 'text/html',
            'js': 'application/javascript',
            'css': 'text/css'
        };
        
        try {
            const file = Bun.file(process.cwd() + path);
            if (file.size === 0) {
                return new Response('Not Found', { status: 404 });
            }
            return new Response(file, {
                headers: { 'Content-Type': types[ext] || 'text/plain' }
            });
        } catch (e) {
            return new Response('Not Found', { status: 404 });
        }
    }
};
