class SecretShare {

    _promiseRessources = Array();

    constructor() {

        this.loadRessources();

    }

    /**
     *
     */
    loadLayout() {

        var template = `
        <style>
            .container {
                max-width: 700px;
                width: 100%;
            }
        </style>
        <div class="container">
            <div class="py-5 text-center">
            <h1>Secure Share</h1>
            </div>
            
            <div class="row">
                <div class="col-xl-12">
                    <form id="input-share">
                        <div class="form-group">
                            <label for="secure">Secure Content</label>
                            <textarea class="form-control" id="secure" placeholder="Type here ..."></textarea>
                            <small class="form-text text-muted">This content will be encrypted.</small>
                        </div>
                        <button type="submit" class="btn btn-primary">Submit</button>
                    </form>
                </div>
            </div>
        </div>
        `;

        $('body').addClass('bg-light').html(template);

        $('#input-share').on('submit', (event) => {
            event.preventDefault();
            alert('work in progress');
        });
    }
    /**
     *
     */
    loadRessources() {


        this.loadRessourceJavascript('/js/jquery-3.5.1.js','sha256-QWo7LDvxbWT2tbbQ97B53yJnYU3WhH/C8ycbRAkjPDc=', (resolveMethod) => {

            this.loadRessourceJavascript('/js/bootstrap-4.5.0.min.js', 'sha384-OgVRvuATP1z7JjHLkuOU7Xw704+h835Lr+6QL9UvYjZE3Ipu6Tp75j7Bh/kR0JKI').then(() => {
                resolveMethod();
            });

        });

        this.loadRessourceJavascript('/js/openpgp-4.10.4.min.js','sha384-/N1ZJTH7aZFvzCM9Jy9dQmQzroYQpB5L2qrNPgYpg1/tbwVDvaqWwGHfHeFhSpcn');

        this.loadRessourceCss('/css/bootstrap-4.5.0.min.css','sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk');

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

        let promise = new Promise((resolve,reject) => {

            let tag = document.createElement('script');
            tag.integrity = sha;
            tag.onerror = () => {
                console.log('reject');
                reject();
            }
            tag.onload = () => {
                console.log('resolve '  +url);
                if(typeof cascading !== 'undefined') {
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
        let promise = new Promise((resolve,reject) => {

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

let share = new SecretShare();