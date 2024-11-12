import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import * as forge from "node-forge";
import { join } from "path";

const keys = get();

function get() {
  if (!existsSync(join(process.cwd(), "secrets"))) generate(false);
  if (!existsSync(join(process.cwd(), "secrets", "public.pem")))
    generate(false);
  if (!existsSync(join(process.cwd(), "secrets", "private.pem")))
    generate(false);

  return {
    public: readFileSync(join(process.cwd(), "secrets", "public.pem"), "utf-8"),
    private: readFileSync(
      join(process.cwd(), "secrets", "private.pem"),
      "utf-8",
    ),
  };
}

function encrypter(data: string, key?: string) {
  if (!key) key = keys.public;

  const max_length = 86;

  if (typeof data === "string" && data.length > max_length) {
    const datas: string[] = [];

    for (let i = 0; i < data.length; i += max_length) {
      const dt = data.slice(i, i + max_length);
      const enc = encrypter(dt, key);
      datas.push(enc as string);
    }

    return datas;
  }

  const publicKeyObj = forge.pki.publicKeyFromPem(key);
  const encrypted = publicKeyObj.encrypt(data);
  return forge.util.encode64(encrypted);
}

function decrypter(data: string | string[], key?: string): string {
  if (!key) key = keys.private;

  if (Array.isArray(data)) {
    let datas = "";
    for (const dt of data) datas += decrypter(dt, key);
    return datas;
  }

  const privateKeyObj = forge.pki.privateKeyFromPem(key);
  const decrypted = privateKeyObj.decrypt(forge.util.decode64(data));

  return decrypted;
}

function generate(ifNotExist = true) {
  if (
    ifNotExist &&
    existsSync(join(process.cwd(), "secrets", "public.pem")) &&
    existsSync(join(process.cwd(), "secrets", "private.pem"))
  ) {
    return get();
  }

  const rsaKeyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
  const publicKey = forge.pki.publicKeyToPem(rsaKeyPair.publicKey);
  const privateKey = forge.pki.privateKeyToPem(rsaKeyPair.privateKey);

  if (!existsSync(join(process.cwd(), "secrets"))) {
    mkdirSync(join(process.cwd(), "secrets"));
  }

  writeFileSync(join(process.cwd(), "secrets", "public.pem"), publicKey);
  writeFileSync(join(process.cwd(), "secrets", "private.pem"), privateKey);

  return { public: publicKey, private: privateKey };
}

const session = {
  decrypter(obj?: { [key: string]: any }) {
    function _decrypter(datas: any) {
      if (!datas) {
        // ne rien faire
      } else if (Array.isArray(datas)) {
        for (let i = 0; i < datas.length; i++) {
          datas[i] = _decrypter(datas[i]);
        }
      } else if (Object.prototype.toString.call(datas) === "[object Object]") {
        if ("_RSA_ENCODED_" in datas) {
          datas = decrypter(datas._RSA_ENCODED_);
        } else {
          for (const key in datas) {
            datas[key] = _decrypter(datas[key]);
          }
        }
      }

      return datas;
    }

    return _decrypter(obj);
  },

  encrypter(obj?: { [key: string]: any }, encriptKey?: string) {
    const _encrypter = (datas: any) => {
      if (!datas) {
        // ne rien faire
      } else if (Array.isArray(datas)) {
        for (let i = 0; i < datas.length; i++) {
          datas[i] = _encrypter(datas[i]);
        }
      } else if (Object.prototype.toString.call(datas) === "[object Object]") {
        if ("_RSA_ENCODED_" in datas) {
          if (encriptKey) {
            datas._RSA_ENCODED_ = encrypter(datas._RSA_ENCODED_, encriptKey);
          } else {
            datas._RSA_ENCODED_ = null;
          }
        } else {
          for (const key in datas) {
            datas[key] = _encrypter(datas[key]);
          }
        }
      }

      return datas;
    };

    return _encrypter(obj);
  },
};

export default { encrypter, decrypter, generate, get, session, keys };
