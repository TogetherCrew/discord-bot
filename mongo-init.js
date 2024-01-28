print('Initializing MongoDB!!!!!!!!!');

db.createUser({
    user: 'root',
    pwd: 'pass',
    roles: [
        {
            role: 'readWrite',
            db: 'RnDAO',
        },
    ],
});

db.createCollection("myCollection"); // This will create the RnDAO database