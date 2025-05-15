const { spawn, execSync } = require('child_process');

function runCommand(command) {
    try {
        console.log(`Running command: ${command}`);
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Command failed: ${command}`, error);
        process.exit(1);
    }
}

async function prepareStart() {
    try {
        // Run production preparation commands
        runCommand('npx prisma generate');
        runCommand('npx prisma migrate deploy');

        // Start the production server
        const nestProcess = spawn('npx', ['nest', 'start'], {
            stdio: 'inherit',
            shell: true
        });

        nestProcess.on('error', (error) => {
            console.error('Failed to start NestJS server:', error);
            process.exit(1);
        });

        nestProcess.on('close', (code) => {
            console.log(`NestJS server exited with code ${code}`);
            process.exit(code);
        });

    } catch (error) {
        console.error('Startup preparation failed:', error);
        process.exit(1);
    }
}

prepareStart();