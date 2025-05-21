// link-users.js
// Usage: node link-users.js

const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const MANAGEMENT_API_DOMAIN = process.env.AUTH0_DOMAIN;
const CLIENT_ID = process.env.MGMT_CLIENT_ID;
const CLIENT_SECRET = process.env.MGMT_CLIENT_SECRET;
const USERS_TO_LINK = [
    {
        email: 'rbcumminscpa@att.net'
    },
    {
        email: 'ernleaf@gmail.com'
    },
    {
        email: 'cadedavidcummins@gmail.com'
    }
];
const DRY_RUN = false; // Set to false to actually perform linking

async function getManagementToken() {
    const response = await axios.post(`https://${MANAGEMENT_API_DOMAIN}/oauth/token`, {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        audience: `https://${MANAGEMENT_API_DOMAIN}/api/v2/`,
        grant_type: 'client_credentials'
    });
    return response.data.access_token;
}

async function getUsersByEmail(email, token) {
    const res = await axios.get(`https://${MANAGEMENT_API_DOMAIN}/api/v2/users-by-email`, {
        params: { email },
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

async function linkUsers(primaryId, secondaryProvider, secondaryId, token) {
    if (DRY_RUN) {
        console.log(`[DRY RUN] Would link ${secondaryProvider}|${secondaryId} → ${primaryId}`);
        return;
    }

    await axios.post(`https://${MANAGEMENT_API_DOMAIN}/api/v2/users/${encodeURIComponent(primaryId)}/identities`, {
        provider: secondaryProvider,
        user_id: secondaryId
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Linked ${secondaryProvider}|${secondaryId} → ${primaryId}`);
}

(async () => {
    const token = await getManagementToken();

    for (const { email } of USERS_TO_LINK) {
        const users = await getUsersByEmail(email, token);

        const googleUser = users.find(u => u.identities.some(id => id.provider === 'google-oauth2'));
        const dbUser = users.find(u => u.identities.some(id => id.provider === 'auth0'));

        if (!googleUser || !dbUser) {
            console.warn(`⚠️  Skipping ${email}: missing one of the identities.`);
            continue;
        }

        const googleCreated = new Date(googleUser.created_at);
        const dbCreated = new Date(dbUser.created_at);

        const primary = googleCreated < dbCreated ? googleUser : dbUser;
        const secondary = primary === googleUser ? dbUser : googleUser;

        const secondaryProvider = secondary.identities[0].provider;
        const secondaryIdStripped = secondary.user_id.split('|')[1];

        try {
            await linkUsers(primary.user_id, secondaryProvider, secondaryIdStripped, token);
        } catch (err) {
            console.error(`❌ Failed to link ${email}:`, err.response?.data || err.message);
        }
    }
})();
