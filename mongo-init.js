print("Started Adding the Users.");
db = db.getSiblingDB("RnDAO");
db.createUser({ user: "user", pwd: "1234", roles: ["readWrite"] })
print("End Adding the User Roles.");