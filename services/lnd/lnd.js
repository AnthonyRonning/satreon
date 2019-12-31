const createLnrpc = require('lnrpc');

exports.createServerLnrpc = async (req, res) => {
  return await createLnrpc({
    /*
     By default lnrpc connects to `localhost:10001`,
     however we can point to any host.
     */
    server: process.env.SATREON_LND_URL,

    /*
     By default  lnrpc looks for your tls certificate at:
     `~/.lnd/tls.cert`, unless it detects you're using macOS and
     defaults to `~/Library/Application\ Support/Lnd/tls.cert`
     however you can configure your own SSL certificate path like:
     */
    tls: false,

    /*
     Optional path to configure macaroon authentication
     from LND generated macaroon file.
     */
    macaroon: process.env.SATREON_LND_ADMIN_MACAROON,
  });
};


exports.getBalance = async (req, res) => {
  const lnrcpCustom = await this.createServerLnrpc();

  return lnrcpCustom.walletBalance({});
};

exports.createServerInvoice = async (value) => {
  const lnrcpCustom = await this.createServerLnrpc();

  return lnrcpCustom.addInvoice({ value });
};

exports.serverLookupInvoice = async (r_hash_str) => {
  const lnrcpCustom = await this.createServerLnrpc();

  return lnrcpCustom.lookupInvoice({ r_hash_str });
};

exports.serverSendPayment = async (payment_request) => {
  console.log('[lnrpc] attempting to send payment');
  console.log(payment_request);
  const lnrcpCustom = await this.createServerLnrpc();

  const response = await lnrcpCustom.sendPaymentSync({ payment_request });
  console.log(response);

  if (response.payment_preimage) {
    return response.payment_preimage;
  } else {
    throw response.payment_error;
  }
};

exports.createInvoice = async (creator, amount) => {
  const lnrcpCustom = await createLnrpc({
    server: creator.lndUrl,
    macaroon: creator.invoiceMacaroon,
    tls: false
  });

  const invoice = await lnrcpCustom.addInvoice({ value: amount });
  return invoice;
};

exports.getInfo = async (creator) => {
  const lnrcpCustom = await createLnrpc({
    server: creator.lndUrl,
    macaroon: creator.invoiceMacaroon,
    tls: false
  });

  console.log('trying to get creator node info');
  const info = await lnrcpCustom.getInfo({});
  console.log(info);
  return '';
};

exports.decodePayReq = async (creator, payReq) => {
  const lnrcpCustom = await createLnrpc({
    server: creator.lndUrl,
    cert: creator.tlsCert,
    macaroon: creator.invoiceMacaroon,
    tls: false
  });

  console.log('trying to decode pay req');
  const decodedPayReq = await lnrcpCustom.decodePayReq({ pay_req: payReq });
  console.log(decodedPayReq);
  return decodedPayReq;
}


exports.lnrpc = createLnrpc;
