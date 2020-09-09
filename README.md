# SecureShare

Share content in the safest way - Even if your backend is being compromised.

Demo available here : <a href="https://www.secure-share.link/" target="_blank">https://www.secure-share.link/</a>

##  Current Hash

The Current Hash is : 
> sha384-WNQztH5L3L5eTc333pQ+mZgTpIEHNQ95ILNuK/T40F1y7LO2fZAK3yLU5b0TJUVC

## The 4 Security Levels 

Please note that security is not only a question of technology, but mainly a human behavior.

- When you open a Share if you get the message "This Share does not exist or already opened".<br>
<b>PLEASE ALERT THE SENDER OF THE SHARE - Maybe someone open the Share before you</b>

- If your data are really sensible and you do not rely on the server, please check the Hash<br>
(view source in your browser compare with the hash just over)  

### Simple 

Secure the data with AES-256 - Easy and enough for sharing Passwords.

If a hacker intercept the "Share" access before the destination, you can define the Password again.
Once openned the Share is destroyed, this method garantee you at least, for Sender and Receveir :
- If your mailbox or chat is Hacked later, the hacker can't access passwords 
- If your mailbox or chat is currently hacked, if the hacker open if AFTER you he can't access data, if the Hacker open it BEFORE you, you will know it.<br>


### Dual

Same security as <i>Simple</i>, but splitted into 2 communication methods - Recommanded for exchanging Sensible data

- Same advantage as Simple
- The Hacker need to hack both communication channels, So it really reduced the probability of beeing able to open the share before the receiver.
  

### Deeper

Replace Symetric AES-256 with Asymetric PGP, it's useful if you do not rely on the server security, and think that AES-256 is not enough.

Please note :
- Same Advantage as Dual
- Like the "Dual", please use 2 communication channels. 
- Only Gov Agency should be able to break the AES-256 of Dual and Simple Methods
- This method is harder to use, because the "Password" (also know as Private Key) format do not make it easy to share. 

### Paranoid 

Use Both Symetric AES-256 and Asymetric PGP.

Please note : 
- Same Advantage as Deeper
- Generation of the share could be long and hang your browser, because it use 4096 rsa key
- Use really 3 distinct communication channels, and share the "Password" (PrivateKey) on the safest way.
- You should really <b>BOTH</b> use several "Connections", because if you Sender or Receiver are under a man in the middle proxy, you shouldn't rely on only one connection.  

## How does it works

Two user try to securely exchange data<br>
UserS (Sender) UserR (Receiver)
 
1. UserS want to share data (a text for the moment)
1. UserS's Browser Load Interface
1. UserS can inspect the executed source code with :<br> <a href="https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity">**SubResource Integrity (SRI)**</a> : View Source (CTRL+U) + check the Hash.
1. SecureShare is now executed
    1. Prompt the sensible text to send
    1. Use PGP JS to build a PGP Private Key
    1. Use PGP JS to encrypt the input
    1. Generate a random share id
    1. Upload the encrypted content to the server and the random ID. 
    1. Output to the UserS : 
        - Link to open the share
        - PGP Private Key: called "Password"
1. UserS send to UserR Link+Password by Email, Whatsapp, Messenger, Whatever...
1. UserR Open the link and Load SecureShare Interface
1. UserR should inspect the executed source code, like UserS
1. UserR confirm "I wan't to read the share and destroy it"
1. UserR will be prompt to Enter the Password
1. UserR can now read the secret text.

<br>
<br>

## WHY this project ?

### SecureShare

Simplicity is beautiful, so please K.I.S.S it. 

Security is the affair of everyone - we need an OpenSource way to safely exchange data. 

Reviewing must be easy, even for the production environment.

In theory even HTTPS is not required for this system to be safe, because we do not rely on server side. But the Key 

### Technologies Choices

Less dependencies as possible:
- PgpJS
- Bootstrap 
- Jquery 

PHP backend can easily be rewriten in NodeJs/Java or anything compatible, this part is the less secure so not the most important.

No Bootstrap for the moment, increase dependencies is the hardest way to ensure integrity.

### Limitations

**1 - Why Backend Server Security still mater**

If the data is intercepted between users, the server security part become critical.<br>
By using the shrodinger cat security : If a share is read it is destroyed,<br>
If a Hacker get the data exchanged between Users he could decrypt the share. 

The Server side is protecting you for the future (leak of your exchange, mailbox, conversation... ) 

**Hard Case : UserR or UserS is under SSL-ManInTheMiddle**

All connection of UserS or UserR computer are readable by a hacker, so even sending email, using messenging could leak the data.

UserS must send to UserR the "Password (Private Key)" from another way than using the same connection.

- The listened user should use another Connection<br>
    - Read email with your fixed ISP, then connect your computer to your smartphone connection to read the share
    - Read the email from your smartphone, store private key in a "Note" (not synced on cloud), then use USB to load it on your Desktop and read the share on your desktop

- USB Key (by postal way ? :D )

**2 - UserR or/and UserS computer is compromised**

Sorry Dude, it's dead ...

**3 - I can't inspect Source on my Smartphone**

We should build an app ^^


<br/>

## How to

Build the hash ? 

>cat secureshare.js | openssl dgst -sha384 -binary | openssl base64 -A

or

>shasum -b -a 384 secureshare.js | awk '{ print $1 }' | xxd -r -p | base64
 
<br/>

## Todo

- [X] Make it create share
- [X] Make it read share
- [X] Make the share to expired 
- [X] Make the share to be shred
- [X] Implements Security Levels
- [ ] Allow share of files
- [ ] Find an easy SRI check for Smartphone
- [ ] Make expire in parameter
- [ ] Allow local result caching
<br/>