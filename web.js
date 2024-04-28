const mysql = require('mysql2');
const express = require('express');
const app = express();
const port = 3002;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'recipemanagement',
});

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/web.html');
});

app.get('/recipes', function (req, res) {
    connection.query('SELECT title FROM RECIPES', function (error, results, fields) {
        if (error) {
            console.error('Error fetching titles from MySQL:', error);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

app.get('/recipes/:title?', function (req, res) {
    const recipeTitle = req.params.title;
    console.log('recipeTitle ' + recipeTitle);
    
    if (recipeTitle) {
        // Fetch details for a specific recipe
        connection.query('SELECT * FROM RECIPES WHERE title = ?', [recipeTitle], function (error, results, fields) {
            if (error) {
                console.error('Error fetching recipe details from MySQL:', error);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }

            if (results.length === 0) {
                res.status(404).json({ error: 'Recipe not found' });
                return;
            }

            res.json(results[0]);
        });
    } else {
        // Fetch all recipes
        connection.query('SELECT title FROM RECIPES', function (error, results, fields) {
            if (error) {
                console.error('Error fetching titles from MySQL:', error);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }

            res.json(results);
        });
    }
});


connection.connect(function (err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
    //console.log('Connected as id ' + connection.threadId);
});

app.post('/', function (req, res) {
    var title = req.body.title;
    var ingredients = req.body.ingredients;
    var instructions = req.body.instructions;

    // Sample data to be inserted
    const recipeData = {
        title: title,
        ingredients: ingredients,
        instructions: instructions,
    };

    // Insert data into the "recipes" table
    connection.query('INSERT INTO RECIPES SET ?', recipeData, function (error, results, fields) {
        if (error) {
            console.error('Error inserting data into MySQL:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        console.log('Data inserted successfully.');
        res.send('Data received and inserted successfully!');
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
