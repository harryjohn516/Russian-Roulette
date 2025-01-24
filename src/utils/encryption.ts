import { Buffer } from 'buffer';

// Convert string to bytes
function str2ab(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert bytes to string
function ab2str(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}

// Convert hex string to bytes
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

// Convert bytes to hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function encryptPrivateKey(privateKey: string, key: string): Promise<string> {
  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const keyBytes = hexToBytes(key);
    const data = str2ab(privateKey);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      cryptoKey,
      data
    );

    const encryptedArray = new Uint8Array(encryptedData);
    const result = new Uint8Array(iv.length + encryptedArray.length);
    result.set(iv);
    result.set(encryptedArray, iv.length);

    return Buffer.from(result).toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt private key');
  }
}

export async function decryptPrivateKey(encryptedData: string, key: string): Promise<string> {
  try {
    const data = Buffer.from(encryptedData, 'base64');
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);
    const keyBytes = hexToBytes(key);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      cryptoKey,
      encrypted
    );

    return ab2str(decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt private key');
  }
}