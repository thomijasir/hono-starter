import usersData from "./mocks/users.json";
import type { User } from "./model";
import type { AppState } from "~/model";

export const getUsers = async (state: AppState) => {
  await state.dbClient.query("SELECT * from user");
  return usersData;
};

export const getUserById = (id: number): User | undefined => {
  return usersData.find((user) => user.id === id);
};
