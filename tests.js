const database = {

    user: [
        {
            id: '1',
            name: 'Vijay',
            email: 'vijaymeena@gmail.com',
            password: 'vijaymeena',
            entries: 0,
            joined: new Date()
        },
        {
            id: '2',
            name: 'Ajay',
            email: 'ajaymeena@gmail.com',
            password: 'ajaymeena',
            entries: 0,
            joined: new Date()
        }
    ]
}

database.user[1]['hello'] = "boss";
database.user[1].boss = 'alpha'

console.log(database.user[1])