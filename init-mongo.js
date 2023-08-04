const user = process.env['MONGO_INITDB_ROOT_USERNAME']
const pwd = process.env['MONGO_INITDB_ROOT_PASSWORD']
const database = process.env['MONGO_INITDB_DATABASE']

const admin = db.getSiblingDB('admin');
admin.auth(user, pwd);

db.createUser({user, pwd, roles:[{role: "userAdminAnyDatabase" , db: "admin"}]})