const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors') ; 
const dotenv = require('dotenv'); // Import dotenv


app.use(bodyParser.json());
app.use(cors())
dotenv.config({ path: './config.env' });
const PORT = process.env.PORT || 2982;
var compiler = require('compilex');
var options = { stats: true };
compiler.init(options);

var envData = { OS: "windows" };
//else
var envData = { OS: "linux" };

const py_route = express.Router();



const pyposthandel = (req, res) => {
    const code = req.body.code;
    const input = req.body.input;

    compiler.compilePythonWithInput(envData, code, input, function(data) {
        // If there's an error, clean up the file path from the error message
        if (data.error) {
            data.error = data.error.replace(/File ".*", line/g, 'Line');
        }

        res.send(data);
        console.log(data);
        deleteTempFiles();
    });
};


//--------------------------------------------------------------
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
//-------------------------------------------------------------



py_route.post('/', pyposthandel); 


app.use("/py_router", py_route);

app.listen(PORT, () => {
    console.log("server has been started " , PORT);
});
