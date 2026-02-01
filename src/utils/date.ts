export const nowDate = () => {
  return new Date().toISOString();
};

export const nowUnix = () => {
  return Math.floor(Date.now() / 1000);
};
