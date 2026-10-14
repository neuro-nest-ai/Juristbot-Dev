require('dotenv').config();
const vault = require('node-vault');

const mountPoint = process.env.MOUNT_POINT;
const endpoint = process.env.VAULT_ENDPOINT;
const roleId = process.env.ROLE_ID;
const secretId = process.env.SECRET_ID;

const unauthVault = vault({
  apiVersion: 'v1',
  endpoint,
});

let cachedClient = null;

async function getVaultClient() {
  if (cachedClient) {
    return cachedClient; // reuse the same authenticated client
  }

  try {
    const { auth } = await unauthVault.approleLogin({
      role_id: roleId,
      secret_id: secretId,
    });
    console.log("✅ Vault authentication successful");
    cachedClient = vault({
      apiVersion: 'v1',
      endpoint,
      token: auth.client_token,
    });
    return cachedClient;
  } catch (err) {
    console.error("❌ Vault authentication failed:", err.message);
    throw err;
  }
}

async function getSecret(path) {
  try {
    const client = await getVaultClient();
    const secret = await client.read(`${mountPoint}/data/${path}`);
    return secret.data.data;
  } catch (err) {
    console.error(`❌ Failed to get secret from path: ${path}`, err.message);
    throw err;
  }
}

module.exports = { getSecret };
