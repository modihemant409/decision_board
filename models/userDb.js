const pool = require("../db/db");
const logger = require("../log");

exports.findUserByMail = (mailId) => {
  const query = "Select * from users where email=?";
  return pool.query(query, [mailId]);
};

exports.findAllUsers = () => {
  logger.info({ dsafgh: "sdfghj" }, "[asdfghj]");
  return new Promise((resolve, reject) => {
    const query =
      " SELECT u.id as `id`, u.name as name, u.email as email,u.image as image, u.type as type, u.createdAt as createdAt, \n" +
      "up.id as `up.id` , up.valid_till as `up.valid_till`, up.createdAt as `up.createdAt`, up.is_active as `up.is_active`\n " +
      " FROM users u  LEFT OUTER JOIN `UserPlans` up ON u.id = up.userId;";
    pool
      .query(query, [])
      .then(([results]) => {
        let newResult = {};
        results.map((row) => {
          if (newResult[row.id]) {
            newResult[row.id].UserPlans.push({
              id: row["up.id"],
              valid_till: row["up.valid_till"],
              is_active: row["up.is_active"],
              planId: row["up.planId"],
              createdAt: row["up.createdAt"],
            });
          } else {
            newResult[row.id] = {
              id: row.id,
              name: row.name,
              email: row.email,
              type: row.type,
              createdAt: row.createdAt,
              UserPlans: [
                {
                  id: row["up.id"],
                  valid_till: row["up.valid_till"],
                  is_active: row["up.is_active"],
                  planId: row["up.planId"],
                  createdAt: row["up.createdAt"],
                },
              ],
            };
          }
        });

        const finalResult = Object.keys(newResult).map((key) => {
          return newResult[key];
        });
        resolve(finalResult);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
