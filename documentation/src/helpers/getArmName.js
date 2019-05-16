export function getArmName(path) {
  const directories = path.split("/");
  const base = directories[0];
  const baseWithoutExtension = base.split(".")[0];

  return baseWithoutExtension;
}
