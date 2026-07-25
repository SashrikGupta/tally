const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const TIME_LIMIT_MS = 5000;

function getMemoryUsageMb() {
  return process.memoryUsage().heapUsed / 1024 / 1024;
}

/** Runs `cmd args` with `input` piped to stdin, honoring the shared time limit. */
function execute(cmd, args, { cwd, input }) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const initialMemory = getMemoryUsageMb();
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const child = spawn(cmd, args, { cwd });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, TIME_LIMIT_MS);

    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ output: '', error: err.message, timedOut: false, exitCode: null, metrics: metricsOf(startTime, initialMemory) });
    });

    child.on('exit', (exitCode) => {
      clearTimeout(timer);
      const metrics = metricsOf(startTime, initialMemory);
      if (timedOut) {
        resolve({ output: '', error: 'TIME LIMIT EXCEEDED', timedOut: true, exitCode, metrics });
      } else if (exitCode !== 0 || stderr) {
        resolve({ output: '', error: stderr.replace(/File ".*", line/g, 'Line'), timedOut: false, exitCode, metrics });
      } else {
        resolve({ output: stdout, error: '', timedOut: false, exitCode, metrics });
      }
    });

    if (input) child.stdin.write(input);
    child.stdin.end();
  });
}

function metricsOf(startTime, initialMemoryMb) {
  return {
    timeMs: Date.now() - startTime,
    memoryMb: Number((getMemoryUsageMb() - initialMemoryMb).toFixed(2)),
  };
}

/**
 * Runs `run(dir)` inside a freshly created, unique temp directory, then
 * always removes it afterward — regardless of success or failure.
 *
 * This is the fix for the concurrency-corruption bug in the previous
 * implementation: every handler used to write to a FIXED filename
 * (script.py / main.cpp / Main.java / a.out) inside the server's own
 * directory, so two requests running at the same time overwrote each
 * other's source and read each other's compiled binaries. See
 * Context/07-known-issues.md.
 */
async function withTempDir(run) {
  const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'codeconnect-run-'));
  try {
    return await run(dir);
  } finally {
    await fs.promises.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function runPython(code, input) {
  return withTempDir(async (dir) => {
    const filePath = path.join(dir, 'script.py');
    await fs.promises.writeFile(filePath, code);
    return execute('python', [filePath], { cwd: dir, input });
  });
}

async function runCpp(code, input) {
  return withTempDir(async (dir) => {
    const sourcePath = path.join(dir, 'main.cpp');
    const binaryPath = path.join(dir, process.platform === 'win32' ? 'a.exe' : 'a.out');
    await fs.promises.writeFile(sourcePath, code);

    const compileResult = await execute('g++', ['-O2', '-o', binaryPath, sourcePath], { cwd: dir, input: '' });
    if (compileResult.exitCode !== 0) {
      return { output: '', error: compileResult.error || 'Compilation Error', timedOut: false, exitCode: compileResult.exitCode, metrics: compileResult.metrics };
    }
    return execute(binaryPath, [], { cwd: dir, input });
  });
}

async function runJava(code, input) {
  return withTempDir(async (dir) => {
    // The compilation server's contract requires `public class Main` — the
    // filename must match the public class name for javac.
    const sourcePath = path.join(dir, 'Main.java');
    await fs.promises.writeFile(sourcePath, code);

    const compileResult = await execute('javac', [sourcePath], { cwd: dir, input: '' });
    if (compileResult.exitCode !== 0) {
      return { output: '', error: compileResult.error || 'Compilation Error', timedOut: false, exitCode: compileResult.exitCode, metrics: compileResult.metrics };
    }
    return execute('java', ['-cp', dir, 'Main'], { cwd: dir, input });
  });
}

module.exports = { runPython, runCpp, runJava };
