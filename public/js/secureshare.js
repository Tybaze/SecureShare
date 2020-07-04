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

    // dec2hex :: Integer -> String
    // i.e. 0-255 -> '00'-'ff'
    dec2hex(dec) {
        return ('0' + dec.toString(16)).substr(-2)
    }

    // generateId :: Integer -> String
    generateShareId(len) {
        var arr = new Uint8Array((len || 40) / 2)
        window.crypto.getRandomValues(arr)
        return Array.from(arr, this.dec2hex).join('')
    }

    generateRandomString(len) {

        // 64 chars
        const chars = [..."abcdefhijklmnopqrstuvwxyz*-_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"];

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

        /*$('.form-result')
            console.log(ciphertext);
            const privateKey = (await openpgp.key.readArmored([key.privateKeyArmored])).keys[0];

            const decrypted = await openpgp.decrypt({
                message: await openpgp.message.readArmored(ciphertext),             // parse armored message
                privateKeys: [privateKey]                                           // for decryption
            });


            const plaintext = await openpgp.stream.readToEnd(decrypted.data); // 'Hello, World!'
            alert(plaintext);

             */

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
                        <label for="secure">Security Level</label>
                        <select class="form-control" name="secure-level">
                            <option value="` + this.LEVEL_SIMPLE + `" >Simple - (For Password & Access - can be revoked)</option>
                            <option value="` + this.LEVEL_DUAL + `" disabled >Dual - (For Confidential information)</option>
                            <option value="` + this.LEVEL_DEEPER + `">Deeper - (If a gouv. agency is watching you)</option>
                            <option value="` + this.LEVEL_PARANOID + `" disabled >Paranoid - (Expert Use only)</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Submit</button>
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
            $('#output-private-key').val('');
            $('#output-link').val('');

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

            var passPhrase;
            if (level === this.LEVEL_DEEPER) {
                passPhrase = null;
            } else {
                passPhrase = this.generateRandomString(60);
            }

            console.log(passPhrase);

            const key = await openpgp.generateKey({
                userIds: [{name: 'Jon Doe', email: 'jon@example.com'}],
                rsaBits: 2048,
                passphrase: passPhrase
            });


            const encrypted = await openpgp.encrypt({
                message: openpgp.message.fromText(content),                  // input as Message object
                publicKeys: (await openpgp.key.readArmored(key.publicKeyArmored)).keys, //
            });

            // ReadableStream containing '-----BEGIN PGP MESSAGE
            const ciphertext = encrypted.data;

            var shareId = this.generateShareId();

            console.log('AJAX cipherText + ShareId');

            var postData = {};
            postData.share_id = shareId;
            postData.ciphertext = ciphertext;

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
                        // revert loader
                        myself.createShare_showPrivateKey(key.privateKeyArmored, shareId);
                    }

                    let actionItem = $('#input-share button[type="submit"]');

                    actionItem.html(actionItem.html('previous-html'));

                }
            });


        })();

    }

    createShare_showPrivateKey(privateKeyArmored, shareId) {

        let html = `
            <div class="col-xl-12">
                <form id="readonly-output-share">
                    <div class="form-group">
                        <label for="secure">Open Share Link</label>
                        <input type="text" class="form-control text-monospace" readonly id="output-link"/>
                    </div>
                    <div class="form-group">
                        <label for="secure">Password</label>
                        <textarea class="form-control text-monospace" id="output-private-key" readonly ></textarea>
                    </div>
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

        var shareUrl = window.location.protocol + '//' + window.location.hostname + '/?id=' + shareId;

        $('#output-link').val(shareUrl).on('click', function (event) {

            $(this).select();
            document.execCommand("copy");

            $('#text-copied').modal('show');
            setTimeout(function () {
                $('#text-copied').modal('hide');
            }, 900);
        });

        $('#output-private-key').val(privateKeyArmored).css('height', '500px').on('click', function (event) {

            $(this).select();
            document.execCommand("copy");

            $('#text-copied').modal('show');
            setTimeout(function () {
                $('#text-copied').modal('hide');
            }, 900);

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