const createLnrpc = require('lnrpc');

exports.createCustomLnRpc = async () => createLnrpc({
  /*
     By default lnrpc connects to `localhost:10001`,
     however we can point to any host.
     */
  server: 'localhost:10009',

  /*
     By default  lnrpc looks for your tls certificate at:
     `~/.lnd/tls.cert`, unless it detects you're using macOS and
     defaults to `~/Library/Application\ Support/Lnd/tls.cert`
     however you can configure your own SSL certificate path like:
     */
  tls: '/Volumes/Samsung750/Bitcoin/Testnet/lnd/tls.cert',

  /*
     Optional path to configure macaroon authentication
     from LND generated macaroon file.
     */
  macaroonPath: '/Volumes/Samsung750/Bitcoin/Testnet/lnd/data/chain/bitcoin/testnet/admin.macaroon',
});

exports.createLnrpc = async (req, res) => {
  const lnrcpCustom = await createLnrpc({
    /*
     By default lnrpc connects to `localhost:10001`,
     however we can point to any host.
     */
    server: 'localhost:10009',

    /*
     By default  lnrpc looks for your tls certificate at:
     `~/.lnd/tls.cert`, unless it detects you're using macOS and
     defaults to `~/Library/Application\ Support/Lnd/tls.cert`
     however you can configure your own SSL certificate path like:
     */
    tls: '/Volumes/Samsung750/Bitcoin/Testnet/lnd/tls.cert',

    /*
     Optional path to configure macaroon authentication
     from LND generated macaroon file.
     */
    macaroonPath: '/Volumes/Samsung750/Bitcoin/Testnet/lnd/data/chain/bitcoin/testnet/admin.macaroon',
  });

  // All requests are promisified
  const balance = await lnrcpCustom.walletBalance({});

  // ...and you're off!
  console.log(balance);

  return lnrcpCustom;
};


exports.getBalance = async (req, res) => {
  const lnrcpCustom = await this.createCustomLnRpc();

  return lnrcpCustom.walletBalance({});
};


exports.addInvoice = async (value) => {
  const lnrcpCustom = await this.createCustomLnRpc();

  return lnrcpCustom.addInvoice({ value });
};


exports.lnrpc = createLnrpc;
