/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // sintaxe to create a new column in a table
  return knex.schema.table("users", (table) => {
    table.string("avatarUrl");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  // sintaxe to remove a column from a table
  return knex.schema.table("users", (table) => {
    table.dropColumn("avatarUrl");
  });
};
