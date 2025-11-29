require('greenlock-express')
    .init({
        packageRoot: __dirname,
        configDir: './greenlock.d',
        
        // Contact for security and critical bug notices
        maintainerEmail: 'admin@coquettecraft.duckdns.org',
        
        // Whether to run at cloudscale
        cluster: false
    })
    .ready(httpsWorker);

function httpsWorker(glx) {
    // Import your existing Express app
    const app = require('./core/server');
    
    // Serves on 80 and 443
    // Get's SSL certificates magically!
    glx.serveApp(app);
}
