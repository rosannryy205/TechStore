const USER_PUBLIC_FIELDS = Object.freeze(["id", "name", "avatar", "role"]);
const USER_PRIVATE_FIELDS = Object.freeze([
  "id",
  "name",
  "email",
  "phone",
  "address",
  "avatar",
  "role",
  "created_at",
]);

const projectUser = (user, fields) => {
  if (user == null) return null;

  let attributes = user;
  if (typeof user.get === "function") {
    attributes = user.get({ plain: true });
  } else if (typeof user.toJSON === "function") {
    attributes = user.toJSON();
  }

  return Object.fromEntries(fields.map((field) => [field, attributes[field] ?? null]));
};

const toPrivateUser = (user) => projectUser(user, USER_PRIVATE_FIELDS);
const toPublicUser = (user) => projectUser(user, USER_PUBLIC_FIELDS);

module.exports = { toPrivateUser, toPublicUser, USER_PRIVATE_FIELDS, USER_PUBLIC_FIELDS };
