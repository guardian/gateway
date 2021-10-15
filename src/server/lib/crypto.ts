import crypto from 'crypto';
import { getConfiguration } from '@/server/lib/getConfiguration';

// based on a cleaned up version of https://stackoverflow.com/a/53573115

export const encrypt = (message: string) => {
  // we get the encryptionSecretKey from configuration by
  // reconstructing the object to prevent the key from lingering in memory
  // key size for aes-256 is 256-bit (32 bytes)
  const secretKey = Buffer.from(getConfiguration().encryptionSecretKey, 'hex');

  // NIST recommends 96 bits or 12 bytes IV for GCM to promote interoperability,
  // efficiency, and simplicity of design
  const iv = crypto.randomBytes(12);

  // GCM is an authenticated encryption mode that not only provides
  // confidentiality but also provides integrity in a secured way
  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey, iv);

  // encrypt the message
  const encrypted = Buffer.concat([
    cipher.update(message, 'utf-8'),
    cipher.final(),
  ]);

  // get the auth tag
  // the authentication tag is a cryptographic checksum on data that
  // is designed to reveal both accidental errors and the intentional
  // modification of the data
  const authTag = cipher.getAuthTag();

  // the authTag and iv do not need to be secret, and can be attached
  // to the encrypted message
  // we join these as base64 strings (for space-saving) joined by '.'
  // for easy separation during decryption
  return [
    authTag.toString('base64'),
    iv.toString('base64'),
    encrypted.toString('base64'),
  ].join('.');
};

export const decrypt = (encryptedMessage: string) => {
  const [authTag, iv, cipherText] = encryptedMessage.split('.');

  const secretKey = Buffer.from(getConfiguration().encryptionSecretKey, 'hex');

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    secretKey,
    Buffer.from(iv, 'base64'),
  );

  decipher.setAuthTag(Buffer.from(authTag, 'base64'));

  return Buffer.concat([
    decipher.update(cipherText, 'base64'),
    decipher.final(),
  ]).toString('utf-8');
};
