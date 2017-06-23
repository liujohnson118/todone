
exports.up = function(knex, Promise) {
  return knex.schema.createTable('tasks', function (table) {
    table.increments().primary();
    table.string('category');
    table.string('content');
    table.date('date');
    table.integer('user_id').references('users.id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('tasks');
};
