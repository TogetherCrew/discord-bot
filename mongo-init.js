print('Started Adding the Users.');
db = db.getSiblingDB('RnDAO');
db.createUser({ user: 'user', pwd: 'password', roles: ['readWrite'] });
print('End Adding the User Roles.');