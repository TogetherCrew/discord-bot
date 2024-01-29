print('Started Adding the Users.');
db = db.getSiblingDB('RnDAO');
db.createUser({ user: 'root', pwd: 'pass', roles: ['readWrite'] });
print('End Adding the User Roles.');