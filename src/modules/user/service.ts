import usersData from "./mocks/users.json";
import type { User } from "./model";

export const getUsers = (): User[] => {
  return usersData;
};

export const getUserById = (id: number): User | undefined => {
  return usersData.find((user) => user.id === id);
};