export function getArmName(path) {
  const directories = path.split("/");
  const base = directories[0] === "types" ? directories[1] : directories[0];
  const baseWithoutExtension = base.split(".")[0];

  return (
    baseWithoutExtension.charAt(0).toUpperCase() + baseWithoutExtension.slice(1)
  );
}
