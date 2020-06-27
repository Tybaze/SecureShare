class SecureShare {

    _promiseRessources = Array();

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
            <div class="py-5 text-center">
            <h1><a href="/" class="text-dark">Secure Share</a></h1>
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
            this.actionReadShare();
        } else {
            // Home Page
            this.actionCreateShare();
        }

    }

    actionReadShare() {
        var html = `
            <div id="read_share">
                <div class="row form-container">
                    <div class="col-xl-12 text-center">
                    
                        <button type="submit" class="btn btn-primary read-share">Read Share and destroy it</button>
                    
                    </div>
                </div>
            </div>
        `
        $('#content').html(html);


        $('#read_share button.read-share').on('click',function() {
            alert('SORRY WORK IN PROGRESS - having a social life ... !');
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
                        <textarea class="form-control" id="secure-content" placeholder="Type here ..." required ></textarea>
                        <small class="form-text text-muted">This content will be encrypted.</small>
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

            var backupActionContent = actionItem.html();

            actionItem.html(htmlSpinner);

            // clean possible previous form
            $('#output-private-key').val('');
            $('#output-link').val('');

            // Freeze the action so add a delay to display the spinner
            setTimeout(() => {
                this.createShare_computeForm(backupActionContent);
            }, 100);

        });
    }

    createShare_computeForm(backupActionContent) {
        (async () => {

            const key = await openpgp.generateKey({
                userIds: [{name: 'Jon Doe', email: 'jon@example.com'}],
                rsaBits: 2048,
            });

            var content = $('#secure-content').val();

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

                    $('#input-share button[type="submit"]').html(backupActionContent);

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
                        <input type="text" class="form-control" readonly id="output-link"/>
                    </div>
                    <div class="form-group">
                        <label for="secure">Password</label>
                        <textarea class="form-control" id="output-private-key" readonly ></textarea>
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
                    You can paste it anywhere
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
            }, 1000);
        });

        $('#output-private-key').val(privateKeyArmored).css('height', '500px').on('click', function (event) {

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