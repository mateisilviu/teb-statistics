const { Storage } = require('@google-cloud/storage');
const fetch = require('node-fetch');

// Creates a client
const storage = new Storage();
/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.helloPubSub = async (event, context) => {
    const response = await fetch('https://www.cmteb.ro/functionare_sistem_termoficare.php');
    const body = await response.text();
    await storage.bucket('backup-scraping').file(Date.now()).save(body);
};
