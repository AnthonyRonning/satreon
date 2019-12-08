const Macaroon = require('macaroon');
const crypto = require('crypto');

exports.generateMacaroon = async (creatorId, invoice) => {
  const rootKey = process.env.MACAROON_ROOT_KEY;
  const location = process.env.BASE_URL;
  const currentDate = new Date();
  const expiresDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));

  const newMacaroon = Macaroon.newMacaroon({
    identifier: creatorId, location, rootKey, version: 2
  });
  const subscriberCaveat = `subscriber = ${creatorId}`;
  const expiresCaveat = `expires = ${expiresDate.toISOString()}`;

  // hash invoice
  console.log('received invoice to generate a macaroon from: ' + invoice);
  console.log('r_hash string: ' + invoice.r_hash.toString('hex'));
  const preimageHashCaveat = `preimageHash = ${invoice.r_hash.toString('hex')}`;

  newMacaroon.addFirstPartyCaveat(subscriberCaveat);
  newMacaroon.addFirstPartyCaveat(expiresCaveat);
  newMacaroon.addFirstPartyCaveat(preimageHashCaveat);

  console.log('Created new macaroon: ');
  console.log(newMacaroon.exportJSON());
  console.log(newMacaroon.exportBinary());
  console.log(Macaroon.bytesToBase64(newMacaroon.exportBinary()));

  return Macaroon.bytesToBase64(newMacaroon.exportBinary());
};


exports.verifyMacaroon = async (macaroonBase64, preimage, creatorId) => {
  let hasSubscriberAccess = false;
  let macaroonStillValid = false;
  let hasPaid = false;
  let isValid = false;
  let macaroon = '';
  try {
    macaroon = Macaroon.importMacaroon(macaroonBase64);
  } catch (e) {
    return false;
  }
  const rootKey = process.env.MACAROON_ROOT_KEY;

  const subscriberCaveat = `subscriber = ${creatorId}`;

  // function for checking macaroon cavs
  const checkMacaroon = function (cav) {
    console.log(`checking for cav: ${cav}`);
    if (cav === subscriberCaveat) {
      console.log('has correct subscriber caveat');
      hasSubscriberAccess = true;
    } else if (cav.startsWith('expires = ')) {
      console.log('checking expiration date of macaroon..');

      // get expiration date
      const expirationDateString = cav.split(' ').splice(-1)[0];
      const expirationDate = new Date(expirationDateString);

      if (Date.now() < expirationDate) {
        console.log('Macaroon not expired..');
        macaroonStillValid = true;
      } else {
        console.log(`Macaroon expired on ${expirationDate.toString()}`);
        macaroonStillValid = false;
      }
    } else if (cav.startsWith('preimageHash = ')) {
      console.log("Checking user preimage with this macaroon's preimage hash.");

      // takes last word
      const macaroonPreImageHash = cav.split(' ').splice(-1)[0];

      // hash user supplied preimage and verify it aligns with macaroon's preimage hash
      const userPreImageHash = crypto
        .createHash('sha256')
        .update(Buffer
          .from(preimage, 'hex'))
        .digest()
        .toString('hex');

      if (userPreImageHash === macaroonPreImageHash) {
        console.log('User provided a valid preimage for this macaroon.');
        hasPaid = true;
      } else {
        console.log('User did not provide a valid preimage for this macaroon.');
      }
    } else {
      console.log(`cav not recognized: ${cav}`);
    }
  };

  // run the macaroon checks
  try {
    console.log('Checking for all caveats and verifying paid access to creator');
    macaroon.verify(rootKey, checkMacaroon, []);
    isValid = true;
  } catch (e) {
    isValid = false;
    console.error(e);
  }

  console.log(`This macaroon is valid and signed by this server: ${isValid}`);
  console.log(`This macaroon has subscriber access: ${hasSubscriberAccess}`);
  console.log(`This macaroon is not expired: ${macaroonStillValid}`);
  console.log(`This macaroon has been paid for: ${hasPaid}`);

  return isValid && hasSubscriberAccess && macaroonStillValid && hasPaid;
};
