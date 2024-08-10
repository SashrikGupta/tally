const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
var compiler = require('compilex');
var options = { stats: true };
compiler.init(options);

dotenv.config({ path: './config.env' });

const PORT = process.env.PORT || 2982;

app.use(bodyParser.json());
app.use(cors());

// Set envData based on the operating system
var envData;
if (process.platform === "win32") {
    envData = { OS: "windows" ,
        options: { timeout: 5000 }
     };
     
} else {
    envData = { OS: "linux" , 
        options: { timeout: 5000 }
     };
     
}

const py_route = express.Router();
const CPP_route = express.Router();
const JAVA_route = express.Router();

const pyposthandel = (req, res) => {
    const code = req.body.code;
    const input = req.body.input;

    compiler.compilePythonWithInput(envData, code, input, function(data) {
        if (data.error) {
            data.error = data.error.replace(/File ".*", line/g, 'Line');
        }
        res.send(data);

        deleteTempFiles();
    });
};

const cpp_posthandel = (req, res) => {
    const code = req.body.code;
    const input = req.body.input;

    const cppEnvData = {
        OS: envData.OS,
        cmd: "g++", 
        options : {
            timeout : 50000
        }
    };

    compiler.compileCPPWithInput(cppEnvData, code, input, function(data) {
        if (data.error) {
            data.error = data.error.replace(/File ".*", line/g, 'Line');
        }
        res.send(data);
        console.log(data);
        deleteTempFiles();
    });
};

const java_posthandel = (req, res) => {
    const code = req.body.code;
    const input = req.body.input;

    compiler.compileJavaWithInput(envData, code, input, function(data) {
        if (data.error) {
            data.error = data.error.replace(/File ".*", line/g, 'Line');
        }
        res.send(data);
        console.log(data);
        deleteTempFiles();
    });
};

function deleteTempFiles() {
    const directory = './temp';
    fs.readdir(directory, (err, files) => {
        if (err) console.log(err);

        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) console.log(err);
            });
        }
    });
}

CPP_route.post('/', cpp_posthandel);
py_route.post('/', pyposthandel);
JAVA_route.post('/', java_posthandel);

app.use("/py_router", py_route);
app.use("/CPP_router", CPP_route);
app.use("/JAVA_router", JAVA_route);

app.listen(PORT, () => {
    console.log("server has been started", PORT);
});
