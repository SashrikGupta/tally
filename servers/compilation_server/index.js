const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { spawn } = require('child_process');
const process = require('process'); // To get the memory usage of the parent process

dotenv.config({ path: './config.env' });

const PORT = process.env.PORT || 2982;

app.use(bodyParser.json());
app.use(cors());

const py_route = express.Router();
const CPP_route = express.Router();
const JAVA_route = express.Router();

const getMemoryUsage = () => {
    return process.memoryUsage().heapUsed / 1024 / 1024; // Convert bytes to MB
};

const pyposthandel = (req, res) => {
    const code = req.body.code;
    const input = req.body.input;

    // Path to the temp Python script file
    const filePath = path.join(__dirname, 'script.py');

    // Write the code to a temp Python script file
    fs.writeFileSync(filePath, code);

    const startTime = Date.now();
    const initialMemoryUsage = getMemoryUsage(); // Initial memory usage
    let stdout = '';
    let stderr = '';
    let isTimeout = false;

    // Spawn a child process to run the Python script
    const child = spawn('python', [filePath]);

    // Set a timeout to kill the process if it runs too long
    const timeout = setTimeout(() => {
        isTimeout = true;
        child.kill('SIGKILL'); // Forcefully kill the process
    }, 2000); // 2 seconds

    // Capture stdout
    child.stdout.on('data', (data) => {
        stdout += data.toString();
    });

    // Capture stderr
    child.stderr.on('data', (data) => {
        stderr += data.toString();
    });

    // Handle process exit
    child.on('exit', (code) => {
        clearTimeout(timeout); // Clear the timeout
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        const finalMemoryUsage = getMemoryUsage(); // Final memory usage
        const memoryUsage = finalMemoryUsage - initialMemoryUsage;

        if (isTimeout) {
            res.send({
                error: 'TIME LIMIT EXCEEDED',
                metric: { executionTime: `${executionTime}ms`, memoryUsage: `${memoryUsage.toFixed(2)}MB` }
            });
        } else if (code !== 0 || stderr) {
            res.send({
                error: stderr.replace(/File ".*", line/g, 'Line'),
                metric: { executionTime: `${executionTime}ms`, memoryUsage: `${memoryUsage.toFixed(2)}MB` }
            });
        } else {
            res.send({
                output: stdout,
                metric: { executionTime: `${executionTime}ms`, memoryUsage: `${memoryUsage.toFixed(2)}MB` }
            });
        }

        deleteTempFiles();
    });

    // Pass input to the child process
    if (input) {
        child.stdin.write(input);
        child.stdin.end();
    }
};

const cpp_posthandel = (req, res) => {
    const code = req.body.code;
    const input = req.body.input;

    // Path to the temp C++ source file
    const filePath = path.join(__dirname, 'main.cpp');

    // Write the code to a temp C++ file
    fs.writeFileSync(filePath, code);

    const startTime = Date.now();
    const initialMemoryUsage = getMemoryUsage(); // Initial memory usage
    let stdout = '';
    let stderr = '';
    let isTimeout = false;

    // Compile and run the C++ code
    const compileChild = spawn('g++', ['-o', 'a.out', filePath]);

    // Capture compile stdout
    compileChild.stdout.on('data', (data) => {
        stdout += data.toString();
    });

    // Capture compile stderr
    compileChild.stderr.on('data', (data) => {
        stderr += data.toString();
    });

    compileChild.on('close', (code) => {
        if (code === 0) {
            // Compile succeeded, run the binary
            const runChild = spawn('./a.out');

            // Set a timeout to kill the process if it runs too long
            const timeout = setTimeout(() => {
                isTimeout = true;
                runChild.kill('SIGKILL'); // Forcefully kill the process
            }, 2000); // 2 seconds

            runChild.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            runChild.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            runChild.on('exit', (code) => {
                clearTimeout(timeout);
                const endTime = Date.now();
                const executionTime = endTime - startTime;
                const finalMemoryUsage = getMemoryUsage(); // Final memory usage
                const memoryUsage = finalMemoryUsage - initialMemoryUsage;

                if (isTimeout) {
                    res.send({
                        error: 'TIME LIMIT EXCEEDED',
                        metric: { executionTime: `${executionTime}ms`, memoryUsage: `${memoryUsage.toFixed(2)}MB` }
                    });
                } else if (code !== 0 || stderr) {
                    res.send({
                        error: stderr.replace(/File ".*", line/g, 'Line'),
                        metric: { executionTime: `${executionTime}ms`, memoryUsage: `${memoryUsage.toFixed(2)}MB` }
                    });
                } else {
                    res.send({
                        output: stdout,
                        metric: { executionTime: `${executionTime}ms`, memoryUsage: `${memoryUsage.toFixed(2)}MB` }
                    });
                }

                deleteTempFiles();
            });

            // Pass input to the child process
            if (input) {
                runChild.stdin.write(input);
                runChild.stdin.end();
            }
        } else {
            const endTime = Date.now();
            const executionTime = endTime - startTime;
            const finalMemoryUsage = getMemoryUsage(); // Final memory usage
            const memoryUsage = finalMemoryUsage - initialMemoryUsage;

            res.send({
                error: 'Compilation Error',
                metric: { executionTime: `${executionTime}ms`, memoryUsage: `${memoryUsage.toFixed(2)}MB` }
            });
            deleteTempFiles();
        }
    });
};

const java_posthandel = (req, res) => {
    const code = req.body.code;
    const input = req.body.input;

    // Path to the temp Java source file
    const filePath = path.join(__dirname, 'Main.java');

    // Write the code to a temp Java file
    fs.writeFileSync(filePath, code);

    const startTime = Date.now();
    const initialMemoryUsage = getMemoryUsage(); // Initial memory usage
    let stdout = '';
    let stderr = '';
    let isTimeout = false;

    // Compile and run the Java code
    const compileChild = spawn('javac', [filePath]);

    // Capture compile stdout
    compileChild.stdout.on('data', (data) => {
        stdout += data.toString();
    });

    // Capture compile stderr
    compileChild.stderr.on('data', (data) => {
        stderr += data.toString();
    });

    compileChild.on('close', (code) => {
        if (code === 0) {
            const runChild = spawn('java', ['Main']);

            // Set a timeout to kill the process if it runs too long
            const timeout = setTimeout(() => {
                isTimeout = true;
                runChild.kill('SIGKILL'); // Forcefully kill the process
            }, 2000); // 2 seconds

            runChild.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            runChild.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            runChild.on('exit', (code) => {
                clearTimeout(timeout);
                const endTime = Date.now();
                const executionTime = endTime - startTime;
                const finalMemoryUsage = getMemoryUsage(); // Final memory usage
                const memoryUsage = finalMemoryUsage - initialMemoryUsage;

                if (isTimeout) {
                    res.send({
                        error: 'TIME LIMIT EXCEEDED',
                        metric: { executionTime: `${executionTime}ms`, memoryUsage: `${memoryUsage.toFixed(2)}MB` }
                    });
                } else if (code !== 0 || stderr) {
                    res.send({
                        error: stderr.replace(/File ".*", line/g, 'Line'),
                        metric: { executionTime: `${executionTime}ms`, memoryUsage: `${memoryUsage.toFixed(2)}MB` }
                    });
                } else {
                    res.send({
                        output: stdout,
                        metric: { executionTime: `${executionTime}ms`, memoryUsage: `${memoryUsage.toFixed(2)}MB` }
                    });
                }

                deleteTempFiles();
            });

            // Pass input to the child process
            if (input) {
                runChild.stdin.write(input);
                runChild.stdin.end();
            }
        } else {
            const endTime = Date.now();
            const executionTime = endTime - startTime;
            const finalMemoryUsage = getMemoryUsage(); // Final memory usage
            const memoryUsage = finalMemoryUsage - initialMemoryUsage;

            res.send({
                error: 'Compilation Error',
                metric: { executionTime: `${executionTime}ms`, memoryUsage: `${memoryUsage.toFixed(2)}MB` }
            });
            deleteTempFiles();
        }
    });
};

// Delete temporary files after processing
const deleteTempFiles = () => {
    try {
        fs.unlinkSync(path.join(__dirname, 'script.py'));
        fs.unlinkSync(path.join(__dirname, 'main.cpp'));
        fs.unlinkSync(path.join(__dirname, 'Main.java'));
        fs.unlinkSync(path.join(__dirname, 'a.out')); // Remove compiled C++ binary
    } catch (err) {
        console.error('Error deleting temp files:', err);
    }
};

py_route.post('/', pyposthandel);
CPP_route.post('/', cpp_posthandel);
JAVA_route.post('/', java_posthandel);

app.use("/py_router", py_route);
app.use("/CPP_router", CPP_route);
app.use("/JAVA_router", JAVA_route);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
