
# Litreon

## Patreon for lightning payments & anonymous supporters


### Description 
Litreon allows content creators to earn satoshi's from their followers via the lightning network. Litreon is unique in that it allows supports to stay anonymous and not have an identity or account tied to those they wish to support. Anonymous users are given signed LSATs (Lightning Service Authentication Tokens) for viewing access and as long as they resupply a valid LSAT with necessary permissions + a preimage to the invoice r_hash in the LSAT, then they are allowed to view/download whatever it is they paid to access. 

Litreon allows supporters to pay for months of access to a specific creator, or pay for individual posts. As long as they provide a signed LSAT with the identifier of whatever it is they're paying for, plus the preimage, they they are allowed to view. Paying for a month at a time allows them to view all posts for a given creator.

Litreon does not need to keep a database of invoices / LSATs / macaroons in order to allow anonymous access. As long as an LSAT was signed by my server's root key, and has 'caveats' that show what permission I assigned to that LSAT, I can then allow them appropriate access to things.

An example signed LSAT with assigned permissions only to a specific post: 

```
{
  v: 2,
  s64: 'pLRN-8BODYp0ampFBfdlf8pjs0fcjALVZPh8E-v8_tU',
  i: '5ded5cb24864e24df4d58739',
  l: 'https://edd0ecc1.ngrok.io',
  c: [
    { i: 'post = 5ded5cb24864e24df4d58739' },
    { i: 'expires = 2020-01-08T21:34:54.546Z' },
    {
      i: 'preimageHash = 665d451abf24342b953f3a6272b1294e8587bd01b896fae0e5a1bc00976ade90'
    }
  ]
}
``` 

### Next Steps

- Adding balance tracking for creators
- Allowing multiple month subscriptions
- 402 Payment Required support
- Additional 'content' types such as video, download, etc. 
- API support




Video submission:
https://youtu.be/c6X789EmCFU

-------
