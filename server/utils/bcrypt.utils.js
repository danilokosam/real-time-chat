import bcrypt from "bcrypt";

export const hash = async (data, saltRounds = 10) => {
  return await bcrypt.hash(data, saltRounds);
};

export const compare = async (data, hashed) => {
  return await bcrypt.compare(data, hashed);
};
