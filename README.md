# SecureShare

Share content in the safest way - Even if your backend is being compromised.

Demo available here : <a href="https://www.secure-share.link/" target="_blank">https://www.secure-share.link/</a>

##  Current Hash

The Current Hash is : 
> sha384-HcAKKH6oJIIjHfH1iHCuENrOAqKGLugpqVxhnj8jm2dO7IgGfNUjjTZZyWiMB89S

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
- [ ] Make it read share
- [ ] Make the share to expired 
- [ ] Make the share to be shred
- [ ] Allow share of files
- [ ] Improve private key sharing using another device
- [ ] Find a SRI check for Smartphone

<br/>