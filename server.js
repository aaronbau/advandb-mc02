const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'password',
    database : 'advandb'
});

var level = 3;
var sliceFlag = false;
var sliceLocation = "";
var diceFlag = false;
var diceLocation = "";
var diceType = "";
var query = "";

connection.connect();

app.use(express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(8080, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

app.get('/', (req, res) => {    
    res.sendFile('/views/index.html');
});

app.get('/default', (req, res) => {    
    level = 3;
    sliceFlag = false;
    sliceLocation = "";
    diceFlag = false;
    diceLocation = "";
    diceType = "";

    console.log(level);    

    generateQuery();

    connection.query(query, function (error, results, fields) {
        if (error) throw error;

        res.send(results);
    });
});

app.get('/drilldown', (req, res) => {    
    if(level <= 0) {
        level = 0;
    } else {
        level -= 1;
    }

    console.log(level);
    generateQuery();

    connection.query(query, function (error, results, fields) {
        if (error) throw error;

        res.send(results);
    });
});

app.get('/rollup', (req, res) => {    
    if(level >= 3) {
        level = 3;
    } else {
        level += 1;
    }

    console.log(level);
    generateQuery();

    connection.query(query, function (error, results, fields) {
        if (error) throw error;

        res.send(results);
    });
});

app.get('/slice', (req, res) => {    
    diceFlag = false;
    sliceFlag = true;
    diceLocation = "";
    diceType = "";

    console.log("slice", sliceFlag);
    console.log("dice", diceFlag);
    sliceLocation = req.query.sliceLocation;
    generateQuery();

    connection.query(query, function (error, results, fields) {
        if (error) throw error;

        res.send(results);
    });
});

app.get('/dice', (req, res) => {    
    diceFlag = true;
    sliceFlag = false;
    sliceLocation = "";

    console.log("dice", diceFlag);
    console.log("slice", sliceFlag);
    diceLocation = req.query.diceLocation;
    diceType = req.query.diceType;

    generateQuery();

    connection.query(query, function (error, results, fields) {
        if (error) throw error;

        res.send(results);
    });
});

function generateQuery() {
    var select = "";
    var from = "";
    var where = "";
    var input = "";
    var group = "";
    
    select = "SELECT production.id, production.volume, aquani.type,";
    from = " FROM Production production, Location location, Aquani aquani";
    where = " WHERE production.location = location.id AND production.aquani = aquani.id";

    if(level == 3) {
        select += " location.municipality, location.barangay, location.zone, location.purok"

        if(sliceFlag) {
            input += " AND location.municipality = " + '"' + sliceLocation + '"';
        } else if(diceFlag) {
            input += " AND location.municipality = " + '"' + diceLocation + '"';
            input += " AND aquani.type = " + '"' + diceType + '"';
        }
        
        group += " GROUP BY location.municipality WITH ROLLUP";
    } else if(level == 2) {
        select += " location.barangay, location.zone, location.purok"

        if(sliceFlag) {
            input += " AND location.barangay = " + '"' + sliceLocation + '"';
        } else if(diceFlag) {
            input += " AND location.barangay = " + '"' + diceLocation + '"';
            input += " AND aquani.type = " + '"' + diceType + '"';
        }
        
        group += " GROUP BY location.barangay WITH ROLLUP";
    } else if(level == 1) {
        select += " location.zone, location.purok"

        if(sliceFlag) {
            input += " AND location.zone = " + '"' + sliceLocation + '"';
        } else if(diceFlag) {
            input += " AND location.zone = " + '"' + diceLocation + '"';
            input += " AND aquani.type = " + '"' + diceType + '"';
        }
        
        group += " GROUP BY location.zone WITH ROLLUP";
    } else if(level == 0) {
        select += " location.purok"

        if(sliceFlag) {
            input += " AND location.purok = " + '"' + sliceLocation + '"';
        } else if(diceFlag) {
            input += " AND location.purok = " + '"' + diceLocation + '"';
            input += " AND aquani.type = " + '"' + diceType + '"';
        }
        
        group += " GROUP BY location.purok WITH ROLLUP";
    }

    select += ', SUM(production.volume) AS "Total Volume"';

    query = select + from + where + input + group;
    console.log(query);
}   