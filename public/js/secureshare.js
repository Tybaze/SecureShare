class SecureShare {

    _promiseRessources = Array();
    _loadedShare = null;
    LEVEL_SIMPLE = 'simple';
    LEVEL_DUAL = 'dual';
    LEVEL_DEEPER = 'deeper';
    LEVEL_PARANOID = 'paranoid';

    constructor() {

        this.loadRessources();

    }

    generateShareId(len) {
        return this.generateRandomString(40);
    }

    generatePassPhrase(len) {
        return this.generateRandomString(60);
    }

    generateRandomString(len) {

        // 64 chars
        const chars = [..."abcdefhijklmnopqrstuvwxyz.-_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"];

        len = (len || 40);

        // 256 vals
        var arr = new Uint8Array(len);

        window.crypto.getRandomValues(arr);

        // 256 / 4 => 64 ;)
        var generated = [...Array(len)].map(function (empty, index) {
            return chars[Math.floor(arr[index] / 4)];
        });

        return generated.join('');
    }


    /**
     *
     */
    loadLayout() {


        var template = `
        <style>
            .container {
                max-width: 800px;
                width: 100%;
            }
        </style>
        
        <div class="container">
            <div class="pt-5 pb-3 text-center">
                <h1>
                    <a href="/" class="text-dark">Secure Share</a>
                </h1>
            </div>
            <div class="text-center pb-5">
                <i>To ensure server side integrity you can check the <a href="https://github.com/Tybaze/SecureShare" target="_blank">Hash here</a> and compare with RightClick and "View Source"</i>
            </div>
            
            <div id="content"></div>
            
        </div>
        
        <footer class="footer mt-auto py-3 bg-secondary">
            <div class="container">
                <span class="text-muted">
                    <a href="https://github.com/Tybaze/SecureShare" class="text-light" target="_blank">GitHub SecureShare - Check Your Hash Here</a>        
                </span>
            </div>
        </footer>
        `;

        $('html').addClass('h-100');
        $('body').addClass('bg-light d-flex flex-column h-100').html(template);

        this.controller();
    }

    controller() {

        let params = (new URL(document.location)).searchParams;

        if (params.get('id')) {
            // Read Share
            this.actionReadShare(params.get('id'));
        } else {
            // Home Page
            this.actionCreateShare();
        }

    }

    actionReadShare(share_id) {
        var html = `
            <div id="read-share">
                <div class="row form-container">
                    <div class="col-xl-12 text-center">
                    
                        <button type="submit" class="btn btn-primary action-read-share" data-share-id="` + share_id + `">Read this Share and destroy it.</button>
                    
                    </div>
                </div>
            </div>
        `
        $('#content').html(html);


        $('#read-share button.action-read-share').on('click', function () {

            $(this).prop('disabled', 1);

            var postData = {}
            postData.share_id = $(this).data('share-id');

            var myself = this;
            $.ajax({
                url: '/php/read-share.php',
                type: "POST",
                data: postData,
                dataType: 'json',
                success: function (data) {

                    myself._loadedShare = data;
                    if (!data.success) {
                        alert(data.error);
                        return;
                    }

                    var html = `
                        <div id="decrypt-share" class="pb-5">
                            <div class="row form-container">
                                <div class="col-xl-12 text-center">
                                
                                    <div class="alert-container">
                                        <div class="alert alert-primary" role="alert">
                                            Share Destroyed - it cannot be opened again.
                                        </div>
                                    </div>

                                    <form>
                                        <div class="form-group">
                                            <label for="password">Please enter password</label>
                                            <textarea class="form-control text-monospace" type="password" id="decrypt-password" required placeholder="-----BEGIN PGP PRIVATE KEY BLOCK----- ..."></textarea>
                                        </div>
                                        
                                        <button type="submit" class="btn btn-primary action-decrypt-share">Decrypt the Share</button>
                                    </form>
                                    
                                </div>
                            </div>
                        </div>
                    `
                    $('#content').html(html);

                    $('#decrypt-share #decrypt-password').css('height', '400px');

                    $('#decrypt-share button.action-decrypt-share').on('click', function (event) {

                        event.preventDefault();

                        var privateKeyArmored = $('#decrypt-password').val();

                        var ciphertext = myself._loadedShare.ciphertext;

                        $('#decrypt-alert-error').hide();

                        (async () => {

                            var privateKey = (await openpgp.key.readArmored([privateKeyArmored])).keys[0];

                            try {

                                var decrypted = await openpgp.decrypt({
                                    message: await openpgp.message.readArmored(ciphertext),
                                    privateKeys: [privateKey]
                                });

                            } catch (e) {

                                if (!$('#decrypt-alert-error').length) {
                                    var html = `
                                        <div class="alert alert-danger" role="alert" id="decrypt-alert-error">
                                            Invalid Password
                                        </div>
                                    `;

                                    $('#decrypt-share .alert-container').append($(html));
                                }

                                $('#decrypt-alert-error').fadeIn();

                                return;
                            }


                            const plainText = await openpgp.stream.readToEnd(decrypted.data);

                            var html = `
                                <div id="decrypted-share">
                                    <div class="row form-container">
                                        <div class="col-xl-12 text-center">
                                        
                                            <div class="alert alert-primary" role="alert">
                                                Share Decrypted Successfully
                                            </div>
        
                                            <form>
                                                <div class="form-group">
                                                    <textarea class="form-control text-monospace" type="password" id="share-output-content"  readonly ></textarea>
                                                </div>
                                            </form>
                                            
                                        </div>
                                    </div>
                                </div>
                            `

                            $('#content').html(html);

                            $('#share-output-content').css('height', '400px').text(plainText);

                        })();

                    });


                }
            });
        });


    }

    actionCreateShare() {

        var html = `
            <div class="row form-container">
                <div class="col-xl-12">
                <form id="input-share">
                    <div class="form-group">
                        <label for="secure">Secure Content</label>
                        <textarea class="form-control text-monospace" id="secure-content" placeholder="Type here ..." required ></textarea>
                        <small class="form-text text-muted">This content will be encrypted.</small>
                    </div>
                    <div class="form-group">
                        <label for="secure-level">Security Level</label>
                        <select class="form-control" id="secure-level">
                            <option value="` + this.LEVEL_SIMPLE + `">Simple => for password & access - should be revoked</option>
                            <option value="` + this.LEVEL_DUAL + `">Dual => for confidential information</option>
                            <option value="` + this.LEVEL_DEEPER + `">Deeper => if a gouv. agency is watching you</option>
                            <option value="` + this.LEVEL_PARANOID + `">Paranoid => expert use only</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Build Secure Share</button>
                </form>
                </div>
            </div>

            <div class="row form-result py-5">

            </div>`

        $('#content').html(html);

        var myself = this;

        $('#input-share').on('submit', (event) => {

            event.preventDefault();

            let actionItem = $('#input-share button[type="submit"]');

            let htmlSpinner = `<div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div>`;

            actionItem.data('previous-html', actionItem.html());

            actionItem.html(htmlSpinner);

            // clean possible previous form
            $('.form-result').html('');

            // Freeze the action so add a delay to display the spinner
            setTimeout(() => {
                this.createShare_computeForm();
            }, 100);

        });
    }

    createShare_computeForm() {
        (async () => {

            var content = $('#secure-content').val();
            var level = $('#secure-level').val();

            var passphrase = '';

            let generateKeyArgs = {
                userIds: [{name: 'Jon Doe', email: 'jon@example.com'}],
                rsaBits: 2048,
            }

            if (level !== this.LEVEL_DEEPER) {
                passphrase = this.generateRandomString(60);
                generateKeyArgs.passPhrase = passphrase;
            }

            if(level === this.LEVEL_PARANOID) {
                generateKeyArgs.rsaBits = 4096;
            }

            // Passphrase is aes256
            // Source here :
            // https://github.com/openpgpjs/openpgpjs/blob/master/src/packet/secret_key.js
            // Method : SecretKey.prototype.encrypt
            const key = await openpgp.generateKey(generateKeyArgs);

            // encrypt
            const encrypted = await openpgp.encrypt({
                message: openpgp.message.fromText(content),                  // input as Message object
                publicKeys: (await openpgp.key.readArmored(key.publicKeyArmored)).keys, //
            });

            // ReadableStream containing '-----BEGIN PGP MESSAGE foo ...-----'
            const ciphertext = encrypted.data;

            var shareId = this.generateShareId();

            var postData = {};
            postData.share_id = shareId;
            postData.share_level = level;
            postData.ciphertext = ciphertext;
            // Crypography of SIMPLE and DUAL only rely on AES 256 of the key (should directly use it ... )
            if (level === this.LEVEL_SIMPLE || level === this.LEVEL_DUAL) {
                postData.privateKey = key.privateKeyArmored
            }

            var myself = this;

            $.ajax({
                url: '/php/save-share.php',
                type: "POST",
                data: postData,
                dataType: 'json',
                success: function (data) {

                    if (!data.success) {
                        alert(data.error);
                    } else {
                        myself.createShare_showPrivateShare(level, shareId, key.privateKeyArmored, passphrase);
                    }

                    // revert loader
                    let actionItem = $('#input-share button[type="submit"]');
                    actionItem.html(actionItem.data('previous-html'));

                }
            });


        })();

    }

    createShare_showPrivateShare(level, shareId, privateKeyArmored, passPhrase) {


        var shareUrl = window.location.protocol + '//' + window.location.hostname + '/?id=' + shareId;

        let htmlSimple = `
            <style>
                #output-share {
                    line-height: 34px;
                }
            </style>
            <div class="form-group">
                <textarea class="form-control text-monospace share-content" id="output-share" readonly >` + shareUrl + "\nPassword: " + passPhrase + `</textarea>
            </div>
        `

        let htmlLink = `
            <div class="form-group">
                <label for="output-link">Share Link</label>
                <input type="text" class="form-control text-monospace share-content " id="output-link" readonly value="` + shareUrl + `"/>
            </div>`;

        let htmlPassphrase = `
            <div class="form-group">
                <label for="output-passphrase">PassPhrase</label>
                <input type="text" class="form-control text-monospace share-content " id="output-passphrase" readonly value="` + passPhrase + `"/>
            </div>`;

        let htmlPassword =  `
            <div class="form-group">
                <label for="output-private-key">Password</label>
                <textarea class="form-control text-monospace share-content" id="output-private-key" readonly >` + privateKeyArmored + `</textarea>
            </div>
            `;

        let htmlForm = '';
        let htmlText = '';

        if(level === this.LEVEL_SIMPLE) {

            htmlText = 'Copy/Paste this content to your contact';
            htmlForm = htmlSimple;

        } else if(level === this.LEVEL_DUAL) {

            htmlText = 'Send to your contact using <b>2 communication channels</b>.<br>For example: <ul><li>Link by Whatsapp</li><li>Passphrase by Email</li></ul>';
            htmlForm = htmlLink + htmlPassphrase;

        } else if(level === this.LEVEL_DEEPER) {

            htmlText = 'Send to your contact using <b>2 communication channels</b>.<br>For example: <ul><li>Link by Whatsapp</li><li>Password by Email</li></ul>';
            htmlForm = htmlLink + htmlPassword;

        } else if(level === this.LEVEL_PARANOID) {

            htmlText = 'Your contact need to be aware of the procedure.<br/>Both of you need to use several chanel</br:><br>For example: <ul><li>Send Link by Whatsapp using your mobile ISP, and readed by your contact on mobile ISP</li><li>Send Passphrase by Email (protonmail?) using Fix ISP, and readed by your contact on Fix ISP too</li><li>And the Passphrase by physical Mail</li></ul>';
            htmlForm = htmlLink + htmlPassphrase + htmlPassword;

        } else {

            alert('An error occurs, not managed security level');

        }

        let html = `
            <div class="col-xl-12">
                <form id="readonly-output-share">
                    <h2>How to ?</h2>
                    <div>` + htmlText + `</div>
                    ` + htmlForm + `
                </form>
            </div>
            
            <div class="modal" id="text-copied" tabindex="-1" role="dialog">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header text-center">
                    <h5 class="modal-title">Text Copied !</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-footer">
                  
                  </div>
                </div>
              </div>
            </div>
        `
        $('.form-result').html(html);


        $('#output-private-key').css('height', '500px');

        $('#readonly-output-share .share-content').on('click', function (event) {

            $(this).select();
            document.execCommand("copy");

            $('#text-copied').modal('show');
            setTimeout(function () {
                $('#text-copied').modal('hide');
            }, 1000);

        });
    }

    /**
     *
     */
    loadRessources() {


        this.loadRessourceJavascript('/js/jquery-3.5.1.js', 'sha256-QWo7LDvxbWT2tbbQ97B53yJnYU3WhH/C8ycbRAkjPDc=', (resolveMethod) => {

            this.loadRessourceJavascript('/js/bootstrap-4.5.0.min.js', 'sha384-OgVRvuATP1z7JjHLkuOU7Xw704+h835Lr+6QL9UvYjZE3Ipu6Tp75j7Bh/kR0JKI').then(() => {
                resolveMethod();
            });

        });

        this.loadRessourceJavascript('/js/openpgp-4.10.4.min.js', 'sha384-/N1ZJTH7aZFvzCM9Jy9dQmQzroYQpB5L2qrNPgYpg1/tbwVDvaqWwGHfHeFhSpcn');

        this.loadRessourceCss('/css/bootstrap-4.5.0.min.css', 'sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk');

        Promise.all(this._promiseRessources).then((values) => {
            this.loadLayout();
        });
    }

    /**
     *
     * @param url
     * @param sha
     */
    loadRessourceJavascript(url, sha, cascading) {

        let promise = new Promise((resolve, reject) => {

            let tag = document.createElement('script');
            tag.integrity = sha;
            tag.onerror = () => {
                console.log('reject');
                reject();
            }
            tag.onload = () => {
                console.log('resolve ' + url);
                if (typeof cascading !== 'undefined') {
                    cascading(resolve);
                } else {
                    resolve();
                }

            };
            tag.src = url;

            let firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        });

        this._promiseRessources.push(promise);
        return promise;
    }

    /**
     *
     * @param url
     * @param sha
     */
    loadRessourceCss(url, sha) {
        let promise = new Promise((resolve, reject) => {

            let tag = document.createElement('Link');
            tag.integrity = sha;
            tag.rel = 'StyleSheet';
            tag.type = 'text/css';
            tag.onerror = () => {
                console.log('reject');
                reject();
            }
            tag.onload = () => {
                console.log('resolve ' + url);
                resolve();
            };
            tag.href = url;

            let firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        });
        this._promiseRessources.push(promise);

        return promise;
    }

}

let share = new SecureShare();