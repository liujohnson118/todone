exports.seed = function(knex, Promise) {
  return knex('users').del()
    .then(function () {
      return Promise.all([
        knex('users').insert({username:'x', email:'x@x', password: '11aa'}),
        knex('users').insert({username:'y', email:'y@y', password: '22bb'}),
        knex('users').insert({username:'cc', email:'c@c.c', password: '33cc'})
      ]);
    });
};
