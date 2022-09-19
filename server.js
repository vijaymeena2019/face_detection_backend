const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const Clarifai = require('clarifai');

const clarapi = new Clarifai.App({    // api clint installation
    apiKey: '97dbedcefa3342309972705418ceae4a'
})



const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'password',
        database: 'face-detection'
    }
});

// console.log(db.select('*').from('users').then(data => console.log(data)));


const app = express();





//  We like planning our API.

// And this is something as a developer you really want to do before you just start coding and you want

// to make sure that you have an idea of what your API design will look like.

// So let's think about this.

/* 
 /signin --> POST = success/fail
 /register --> POST -> users
 /profile/:userId --> GET--> users
 /image --> PUT --> users
 */



// For security of user  password - bcrypt-nodejs

// hash functions are one way only
// bcrypt.hash("bacon", null, null, function(err, hash) {
//     // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });

// Creating Temporery database


// Note-> every time server is restarted the database is also reset to default as following
// const database = {

//     users: [
//         {
//             id: '1',
//             name: 'Vijay',
//             email: 'vijaymeena@gmail.com',
//             password: 'vijaymeena',
//             entries: 0,
//             joined: new Date()
//         },
//         {
//             id: '2',
//             name: 'Ajay',
//             email: 'ajaymeena@gmail.com',
//             password: 'ajaymeena',
//             entries: 0,
//             joined: new Date()
//         }
//     ],
//     login: [
//         {
//             id: '987',
//             hash: '',
//             email: "vijaymeena@gmail.com"
//         }
//     ]
// }

// const filteredArray = database.users.filter(obj => obj.password === userEntered.password)


// app.use(express.urlencoded({ extended: false }));     // it converted urlencoded data into js object, we can access it through -> req.body


app.use(express.json())  // it converte json  to js object, we can access it through -> req.body
app.use(cors());

// Default page

app.get("/", (req, res) => {
    res.send("success");
})

// imageUrl

app.post("/imageurl", (req, res) => {
    clarapi.models.predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
        .then(data => {
            res.json(data);
        })
        .catch(err => res.status(400).json('Unable to Work With API'))
})


// User Profile

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    //   let found = false;
    // database.users.forEach(user => {    // find() is better to use here

    //     if (user.id === id) {
    //         found = true;
    //         return res.json(user);
    //     }
    // })

    db.select('*').from('users')
        .where({
            id: id
        })
        .then(user => {
            // console.log(user)
            if (user.length) {
                res.json(user[0]);
            } else {   // we need it because it return empty array and empty array is true in js
                res.status(400).json('Not Found')
            }
        })
        .catch(err => res.status(400).json('error getting user'))
    // if (!found) res.json('No such user')
})

//Sign in

app.post("/signin", (req, res) => {

    if (!req.body.email || !req.body.password) {
        res.status(400).json('incorrect login submission');
    } else {   // i need to put else here otherwise i got err 'ERR_HTTP_HEADERS_SENT'

        db.select('email', 'hash').from('login')
            .where('email', '=', req.body.email)
            .then(data => {
                const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
                if (isValid) {
                    return db.select('*').from('users')
                        .where('email', '=', req.body.email)
                        .then(user => {
                            res.json(user[0])
                        })
                        .catch(err => res.status(400).json('unable to get user'))
                } else {
                    res.status(400).json('Wrong Credentials')
                }
            })
            .catch(err => res.status(400).json('wrong credentials'))
    }
})






// const signinEntered = req.body

// if (database.users[0].password === signinEntered.password && database.users[0].email === signinEntered.email) {
//     res.json(database.users[0]);
// } else {
//     res.status(404).json('Incorreted Username aur Password. Please Try Again');
// }
// })

// Register

app.post('/register', (req, res) => {
    // 2 conditions 
    // check if users is already registered or not
    // if not registered then register him

    const { name, email, password } = req.body;

    // Security Checking 
    if (!name || !email || !password) {
        res.status(400).json('incorrect form submission');
    } else {

        // Adding hash
        const hash = bcrypt.hashSync(password);
        // USING DATABASE

        db.transaction(trx => {
            trx.insert({
                hash: hash,
                email: email
            })
                .into('login')
                .returning('email')
                .then(loginEmail => {
                    return trx('users')
                        .returning('*')
                        .insert({
                            email: loginEmail[0].email,
                            name: name,
                            joined: new Date()
                        })
                        .then(user => {
                            res.json(user[0]);
                        })
                })
                .then(trx.commit)
                .catch(trx.rollback)
        })
            .catch(err => res.status(400).json('Unable to Register'))
    }
})



//     db('users')
//         .returning('*')
//         .insert({
//             email: email,
//             name: name,
//             joined: new Date()
//         })
//         // .then(data => console.log(data));
//         .then(user => {
//             res.json(user[0])  // we should return an object , because it  is object in array
//         })
//         .catch(err => res.status(400).json(err))
// })


// // Hash the password using bcrypt


// bcrypt.hash(password, null, null, function (err, hash) {
//     // Store hash in your password DB.
//     console.log(hash); //$2a$10$MN6Wx4byrPFpNiWhxPShpOY18a7pFIBvwL4uNh.N/ZunMlPmQG1fq // 'anybody'
// });

// // compare the password - true
// bcrypt.compare('anybody', '$2a$10$MN6Wx4byrPFpNiWhxPShpOY18a7pFIBvwL4uNh.N/ZunMlPmQG1fq', function (err, res) {
//     // Store hash in your password DB.
//     console.log(res); // true   // password - 'anybody'
// })
// // compare the password - false
// bcrypt.compare('nobody', '$2a$10$MN6Wx4byrPFpNiWhxPShpOY18a7pFIBvwL4uNh.N/ZunMlPmQG1fq', function (err, res) {
//     // Store hash in your password DB.
//     console.log(res); // false  
// })



// checking is already registered or not?
// const newArray1 = [1, 2, 3, 4, 5]
// filternewArray = database.users

// IF USER ALREADY REGISTER
// if (database.users.find(obj => obj.email === email)) {
//     res.status(404).json('users already exits');
// } else {
//     const len = database.users.length;

// // My Way
// database.users.push(req.body);

// database.users[len - 1]["id"] = len;
// database.users[len - 1]['entries'] = 0;
// database.users[len - 1]['joined'] = new Date();
// res.json(database);

// Best way

// database.users.push({
//     id: len + 1 + "",
//     name: name,
//     email: email,
//     password: password,
//     entries: 0,
//     joined: new Date()
// })
//     res.json(database.users[database.users.length - 1])
// }
// })


// Image Count update

app.put('/image', (req, res) => {
    const { id } = req.body;

    db('users').where('id', '=', id)   // search  for update
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            res.json(entries[0].entries);   // entries[0].entries added in new update
        })
        .catch(err => res.status(400).json('unable to get entries'))

    // let found = false;
    // database.users.forEach(user => {
    //     if (user.id === id) {
    //         found = true;
    //         user.entries++;
    //         return res.json(user.entries);
    //     }
    // })
    // if (!found) res.json('user no found');
})

app.listen(process.env.PORT || 3000, () => {    // process.env.PORT is added to deploy on heroku
    console.log(`app is running on port ${process.env.PORT}`)
});