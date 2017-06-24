exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function (table) {
    table.increments().primary();
    table.string('username').unique();
    table.string('email').unique();
    table.string('password');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};