
exports.up = function(knex, Promise) {
  return knex.schema.createTable('tasks', function (table) {
    table.increments().primary();
    table.string('category');
    table.string('content');
    table.date('date');
    table.string('user_id').references('users.username');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('tasks');
};
