db.createUser(
    {
        user: "user",
        pwd: "123456Pass",
        roles: [
            {
                role: "readWrite",
                db: "RnDAO"
            }
        ]
    }
);
db.createCollection("test"); //MongoDB creates the database when you first store data in that database