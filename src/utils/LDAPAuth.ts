import ldap from "ldapjs";

type User = {
  name: string;
  vertical: string;
  roll: string;
  email: string;
  degree: string;
  department: string;
  yearOfStudy: number;
};

const programs: Record<string, string> = {
  btech: "B. Tech",
  phd: "Ph. D",
};

const client = ldap.createClient({
  url: "ldap://10.24.1.50:389",
});

const ECELL_USERNAME = "ecellbind";
const ECELL_PASSWORD = "kj95KV4H9PsS";

const maindn = "dc=ldap,dc=iitm,dc=ac,dc=in";
const rootdn = `cn=${ECELL_USERNAME},ou=bind,${maindn}`;

export const getLDAPUser = (roll: string, password: string): Promise<User> => {
  console.log("in getldapUser, with roll ",roll);
  const currentCalendarYear = new Date().getFullYear();
  const isFirstHalfOfTheYear = new Date().getMonth() <= 6;

  return new Promise((resolve, reject) => {
    client.bind(rootdn, ECELL_PASSWORD, function (err: Error | null) {
      if (err) return reject(err);

      client.search(
        maindn,
        {
          filter: `(&(uid=${roll}))`,
          attributes: ["displayName"],
          scope: "sub",
        },
        (err: Error | null, search: ldap.SearchCallbackResponse) => {
          if (err) return reject(err);

          let found = false;
          search.once("searchEntry", (res: ldap.SearchEntry) => {
            const distinguishedName = res.dn.toString();
            found = true;

            client.bind(distinguishedName, password, (err: Error | null) => {
              if (err) {
                console.error("Bind error for DN:", res.dn, "Error:", err.message);
                return reject(err);
              }

              const name =
                res.attributes?.find(attr => attr.type === "displayName")?.values?.[0];

              if (!name) {
                return reject({
                  name: "RollParseError",
                  message: "There was an error finding this account.",
                });
              }

              const degreeMatch = distinguishedName.match(/ou=(?<degree>[a-z]+)/);
              const degree = degreeMatch?.groups?.degree || "unknown";
              const vertical = 'cr';
              const user: User = {
                name,
                vertical,
                roll,
                email: `${roll}@smail.iitm.ac.in`,
                degree,
                department: roll.slice(0, 2),
                yearOfStudy: isFirstHalfOfTheYear
                  ? currentCalendarYear - Number(`20${roll.slice(2, 4)}`)
                  : currentCalendarYear - Number(`20${roll.slice(2, 4)}`) + 1,
              };

              console.log("Got Ldap User; user is ",user);

              return resolve(user);
            });
          });

          search.once("end", () => {
            if (!found) {
              return reject({
                name: "DoesNotExistError",
                message: "The roll number doesn't exist",
              });
            }
          });
        }
      );
    });
  });
};
