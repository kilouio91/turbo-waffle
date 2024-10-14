const os = require('os');
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

let browser; // To store the Puppeteer browser instance

// Function to log CPU usage
function logCpuUsage() {
    const cpus = os.cpus();
    cpus.forEach((cpu, index) => {
        const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
        const usage = ((total - cpu.times.idle) / total) * 100;
        console.log(`CPU ${index}: ${usage.toFixed(2)}% used`);
    });
    console.log('---');
}

// Function to calculate CPU usage
function getCPUUsage() {
    const cpus = os.cpus();

    let totalIdle = 0, totalTick = 0;
    for (let i = 0, len = cpus.length; i < len; i++) {
        const cpu = cpus[i];
        for (let type in cpu.times) {
            totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
    }

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;

    return {
        idle,
        total
    };
}

// Initial CPU usage
let startMeasure = getCPUUsage();

// Function to log CPU usage based on difference
function logCPUUsage() {
    const endMeasure = getCPUUsage();

    const idleDifference = endMeasure.idle - startMeasure.idle;
    const totalDifference = endMeasure.total - startMeasure.total;

    const percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);

    console.log(`CPU Usage: ${percentageCPU}%`);

    startMeasure = endMeasure;
}

(async () => {
    // Detect the operating system
    const platform = os.platform();

    // Map platform codes to OS names
    let osName;
    switch (platform) {
        case 'aix':
            osName = 'AIX';
            break;
        case 'darwin':
            osName = 'macOS';
            break;
        case 'freebsd':
            osName = 'FreeBSD';
            break;
        case 'linux':
            osName = 'Linux';
            break;
        case 'openbsd':
            osName = 'OpenBSD';
            break;
        case 'sunos':
            osName = 'SunOS';
            break;
        case 'win32':
            osName = 'Windows';
            break;
        default:
            osName = 'Unknown';
    }

    console.log(`Operating System: ${osName}`);

    // Launch Puppeteer browser in headless mode
    browser = await puppeteer.launch({ 
        headless: true,
        args: [
          "--disable-setuid-sandbox",
          "--no-sandbox",
          "--single-process",
          "--no-zygote",
        ]
    });
    const page = await browser.newPage();

    // Start logging CPU usage every 2 seconds
    const cpuLoggingInterval = setInterval(logCPUUsage, 2000);

    try {
        // Open a webpage (e.g., example.com)
        await page.goto('https://brazen-short-stone.glitch.me/');

        // Log the title of the page
        const pageTitle = await page.title();
        console.log(`Page Title: ${pageTitle}`);
    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        // Stop logging CPU usage
        clearInterval(cpuLoggingInterval);
    }
})();

// Log CPU usage every 5 seconds
const cpuUsageInterval = setInterval(logCpuUsage, 5000);

// Start the Express server
const server = app.listen(PORT, () => {
    console.log(`Express server is running on http://localhost:${PORT}`);
});

// Stop the Express server after 5 hours and 55 minutes
const shutdownTimeout = 5 * 60 * 60 * 1000 + 55 * 60 * 1000; // 5 hours 55 minutes in milliseconds

setTimeout(async () => {
    server.close(async () => {
        console.log('Express server stopped after 5 hours and 55 minutes.');
    });
    clearInterval(cpuUsageInterval);

    if (browser) {
        await browser.close();
        console.log('Puppeteer browser closed.');
    }
}, shutdownTimeout);

app.get('/', (req, res) => {
    res.send('Server is running...');
});
