import { decrypt, encrypt, NONCE_BYTES } from "./ScryptEncryption";

test("encrypts and decrypts a key", async () => {
  const privateKey = "ARCHANGEL";

  const password = "This is a really cool password and is good";
  const salt = "Also this salt is really key, and good";
  const nonce = new Uint8Array(NONCE_BYTES).fill(42);

  const { encryptedPhrase } = await encrypt({
    phrase: privateKey,
    password,
    salt,
    nonce,
  });

  expect(encryptedPhrase).toBeTruthy();
  expect(encryptedPhrase).not.toEqual(privateKey);
  expect(encryptedPhrase).toEqual(
    "ASoqKioqKioqKioqKioqKioqKioqKioqKghXdTQ4aKmd0WIKwT5YjOCtN95jMeXe1UI=",
  );

  const decryptedPhrase = await decrypt({
    phrase: encryptedPhrase,
    password,
    salt,
  });

  expect(decryptedPhrase).not.toEqual(encryptedPhrase);
  expect(decryptedPhrase).toEqual(privateKey);
});

test("encrypts and decrypts a StellarX seed", async () => {
  const seed = "SCHKKYK3B3MPQKDTUVS37WSVHJ7EY6YRAGKOMOZJUOOMKVXTHTHBPZVL";
  const password = "hello";
  const salt = "salty";
  const nonce = new Uint8Array(NONCE_BYTES).fill(42);

  const { encryptedPhrase } = await encrypt({
    phrase: seed,
    password,
    salt,
    nonce,
  });

  expect(encryptedPhrase).not.toEqual(seed);
  expect(encryptedPhrase).toEqual(
    "ASoqKioqKioqKioqKioqKioqKioqKioqKgjCVz5H3mKHykeuO6GA8KKJSQrTu9D9Gt8nhO" +
      "R7u3iccJc+jV768SEGOtWnwU6x4o46LxhKI8nQGMahV4JpqruESNW8vwt0OQ==",
  );

  const decryptedPhrase = await decrypt({
    phrase: encryptedPhrase,
    password,
    salt,
  });

  expect(decryptedPhrase).not.toEqual(encryptedPhrase);
  expect(decryptedPhrase).toEqual(seed);
});
