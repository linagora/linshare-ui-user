//download.js v4.2, by dandavis; 2008-2016. [CCBY2] see http://danml.com/download.html for tests/usage
// v1 landed a FF+Chrome compat way of downloading strings to local un-named files, upgraded to use a hidden frame and optional mime
// v2 added named files via a[download], msSaveBlob, IE (10+) support, and window.URL support for larger+faster saves than dataURLs
// v3 added dataURL and Blob Input, bind-toggle arity, and legacy dataURL fallback was improved with force-download mime and base64 support. 3.1 improved safari handling.
// v4 adds AMD/UMD, commonJS, and plain browser support
// v4.1 adds url download capability via solo URL argument (same domain/CORS only)
// v4.2 adds semantic variable names, long (over 2MB) dataURL support, and hidden by default temp anchors
// https://github.com/rndme/download

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.downloadIE = factory();
  }
}(this, function () {

    return function downloadIE(data, strFileName, strMimeType) {

        var self = window, // this script is only for browsers anyway...
            defaultMime = "application/octet-stream", // this default mime also triggers iframe downloads
            mimeType = strMimeType || defaultMime,
            payload = data,
            url = !strFileName && !strMimeType && payload,
            anchor = document.createElement("a"),
            toString = function(a){return String(a);},
            myBlob = (self.Blob || self.MozBlob || self.WebKitBlob || toString),
            fileName = strFileName || "download",
            blob,
            reader;
            myBlob= myBlob.call ? myBlob.bind(self) : Blob ;
      
        if(String(this)==="true"){ //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
            payload=[payload, mimeType];
            mimeType=payload[0];
            payload=payload[1];
        }


        if(url && url.length< 2048){ // if no filename and no mime, assume a url was passed as the only argument
            fileName = url.split("/").pop().split("?")[0];
            anchor.href = url; // assign href prop to temp anchor
            if(anchor.href.indexOf(url) !== -1){ // if the browser determines that it's a potentially valid url path:
                var ajax=new XMLHttpRequest();
                ajax.open( "GET", url, true);
                ajax.responseType = 'blob';
                ajax.onload= function(e){ 
                  downloadIE(e.target.response, fileName, defaultMime);
                };
                setTimeout(function(){ ajax.send();}, 0); // allows setting custom ajax headers using the return:
                return ajax;
            } // end if valid url?
        } // end if url?


        //go ahead and download dataURLs right away
        if(/^data\:[\w+\-]+\/[\w+\-]+[,;]/.test(payload)){
        
            if(payload.length > (1024*1024*1.999) && myBlob !== toString ){
                payload=dataUrlToBlob(payload);
                mimeType=payload.type || defaultMime;
            }else{          
                return navigator.msSaveBlob ?  // IE10 can't do a[download], only Blobs:
                    navigator.msSaveBlob(dataUrlToBlob(payload), fileName) :
                    saver(payload) ; // everyone else can save dataURLs un-processed
            }
            
        }//end if dataURL passed?

        blob = payload instanceof myBlob ?
            payload :
            new myBlob([payload], {type: mimeType}) ;


        function dataUrlToBlob(strUrl) {
            var parts= strUrl.split(/[:;,]/),
            type= parts[1],
            decoder= parts[2] == "base64" ? atob : decodeURIComponent,
            binData= decoder( parts.pop() ),
            mx= binData.length,
            i= 0,
            uiArr= new Uint8Array(mx);

            for(i;i<mx;++i) uiArr[i]= binData.charCodeAt(i);

            return new myBlob([uiArr], {type: type});
         }

        function saver(url, winMode){

            if ('download' in anchor) { //html5 A[download]
                anchor.href = url;
                anchor.setAttribute("download", fileName);
                anchor.className = "download-js-link";
                anchor.innerHTML = "downloading...";
                anchor.style.display = "none";
                document.body.appendChild(anchor);
                setTimeout(function() {
                    anchor.click();
                    document.body.removeChild(anchor);
                    if(winMode===true){setTimeout(function(){ self.URL.revokeObjectURL(anchor.href);}, 250 );}
                }, 66);
                return true;
            }

            // handle non-a[download] safari as best we can:
            if(/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//.test(navigator.userAgent)) {
                url=url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
                if(!window.open(url)){ // popup blocked, offer direct download:
                    if(confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")){ location.href=url; }
                }
                return true;
            }

            //do iframe dataURL download (old ch+FF):
            var f = document.createElement("iframe");
            document.body.appendChild(f);

            if(!winMode){ // force a mime that will download:
                url="data:"+url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
            }
            f.src=url;
            setTimeout(function(){ document.body.removeChild(f); }, 333);

        }//end saver




        if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)
            return navigator.msSaveBlob(blob, fileName);
        }

        if(self.URL){ // simple fast and modern way using Blob and URL:
            saver(self.URL.createObjectURL(blob), true);
        }else{
            // handle non-Blob()+non-URL browsers:
            if(typeof blob === "string" || blob.constructor===toString ){
                try{
                    return saver( "data:" +  mimeType   + ";base64,"  +  self.btoa(blob)  );
                }catch(y){
                    return saver( "data:" +  mimeType   + "," + encodeURIComponent(blob)  );
                }
            }

            // Blob but not URL support:
            reader=new FileReader();
            reader.onload=function(e){
                saver(this.result);
            };
            reader.readAsDataURL(blob);
        }
        return true;
    }; /* end downloadIE() */
}));

/**
 * AnonymousUrlController Controller
 * @namespace LinShare.anonymousUrl
 */
(function() {
  'use strict';

  angular
    .module('linshare.anonymousUrl')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('filesList');
      $translatePartialLoaderProvider.addPart('anonymousUrl');
    }])
    .controller('AnonymousUrlController', AnonymousUrlController);

  AnonymousUrlController.$inject = ['_', '$filter', '$log', '$state', '$uibModal',
    'anonymousUrlService', 'anonymousUrlData', 'NgTableParams'
  ];

  /**
   *  @namespace AnonymousUrlController
   *  @desc Anonymous url mamnagement system controller
   *  @memberOf LinShare.anonymousUrl
   */
  function AnonymousUrlController(_, $filter, $log, $state, $uibModal, anonymousUrlService,
    anonymousUrlData, NgTableParams) {

    /* jshint validthis:true */
    var anonymousUrlVm = this;

    anonymousUrlVm.activate = activate;
    anonymousUrlVm.anonymousUrlData = {};
    anonymousUrlVm.anonymousUrlShareEntries = [];
    anonymousUrlVm.download = download;
    anonymousUrlVm.loadTable = loadTable;
    anonymousUrlVm.modalPasswordShow = modalPasswordShow;
    anonymousUrlVm.paramFilter = {
      name: ''
    };
    anonymousUrlVm.urlData = anonymousUrlData;
    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf LinShare.Guests.LinshareGuestsController
     */
    function activate() {
      if (anonymousUrlVm.urlData.protectedByPassword) {
        anonymousUrlVm.modalPasswordShow();
      } else {
        anonymousUrlVm.tableParams = anonymousUrlVm.loadTable();
      }
    }

    /**
     *  @name download
     *  @desc Retrieve the file from the server
     *  @param {Object} documentFile - A Document object
     *  @memberOf LinShare.anonymousUrl.AnonymousUrlController
     */
    function download(documentFile) {
      var url = anonymousUrlService.downloadUrl(anonymousUrlVm.urlData.uuid, anonymousUrlVm.password,
                                                documentFile.uuid);

      if (navigator.msSaveBlob) {
         var x=new XMLHttpRequest();
         x.open("GET", url, true);
         x.responseType = 'blob';
         x.onload=function(e){downloadIE(x.response, documentFile.name); }
         x.send();
      } else {
         var downloadLink = document.createElement('a');

         downloadLink.setAttribute('href', url);
         downloadLink.setAttribute('download', documentFile.name);

         if (document.createEvent) {
           var event = document.createEvent('MouseEvents');
           event.initEvent('click', true, true);
           downloadLink.dispatchEvent(event);
         } else {
           downloadLink.click();
         }

         downloadLink.remove();
      }
    }

    /**
     *  @name loadTable
     *  @desc Load the table
     *  @memberOf LinShare.anonymousUrl.AnonymousUrlController
     */
    function loadTable() {
      return new NgTableParams({
        page: 1,
        sorting: {
          modificationDate: 'desc'
        },
        filter: anonymousUrlVm.paramFilter,
        count: 10
      }, {
        total: anonymousUrlVm.anonymousUrlShareEntries.length,
        getData: function(params) {
          return anonymousUrlService.getAnonymousUrl(anonymousUrlVm.urlData.uuid, anonymousUrlVm.password)
            .then(function(anonymousUrl) {
              anonymousUrlVm.anonymousUrlData = anonymousUrl.data;
              anonymousUrlVm.anonymousUrlShareEntries = anonymousUrlVm.anonymousUrlData.documents;
              var filteredData = params.filter() ?
                $filter('filter')(anonymousUrlVm.anonymousUrlShareEntries, params.filter()) :
                anonymousUrlVm.anonymousUrlShareEntries;
              var files = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
              params.total(files.length);
              return (files.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            });
        }
      });
    }

    /**
     *  @name modalPasswordShow
     *  @desc Open a modal dialog for the user to input the password
     *  @memberOf LinShare.anonymousUrl.AnonymousUrlController
     */
    function modalPasswordShow() {
      anonymousUrlVm.modalPassword = $uibModal.open({
        backdrop: 'static',
        backdropClass: 'modal-backdrop',
        size: 'swal',
        controller: function modalPasswordController($state, $uibModalInstance) {
          /* jshint validthis: true*/
          var modalPasswordVm = this;
          modalPasswordVm.hasError = hasError;
          modalPasswordVm.hide = hide;
          modalPasswordVm.invalid = false;
          modalPasswordVm.submit = submit;

          /**
           *  @name hasError
           *  @desc Determine if the field is in an error state
           *  @param {DOM Object} form - A form dom object
           *  @param {DOM Object} field - A field fom object
           *  @returns {Boolean} Error state of the field
           *  @memberOf LinShare.anonymousUrl.AnonymousUrlController.modalPasswordController
           */
          function hasError(form, field) {
            return ((field.$touched || form.$submitted) && field.$invalid);
          }

          /**
           *  @name hide
           *  @desc Hide the modal dialog
           *  @memberOf LinShare.anonymousUrl.AnonymousUrlController.modalPasswordController
           */
          function hide() {
            $state.go('anonymousUrl.home');
            $uibModalInstance.close();
          }

          /**
           *  @name submit
           *  @desc Submit the form of the modal dialog
           *  @memberOf LinShare.anonymousUrl.AnonymousUrlController.modalPasswordController
           */
          function submit() {
            anonymousUrlVm.password = modalPasswordVm.password;
            anonymousUrlService.getAnonymousUrl(anonymousUrlVm.urlData.uuid, anonymousUrlVm.password)
              .then(function(data) {
                 if (data.status === 403) {
                   if (!_.isUndefined(modalPasswordVm.password) && modalPasswordVm.password !== '') {
                     modalPasswordVm.invalid = true;
                   }
                   $log.debug('Bad input for anonymous url password', data);
                 } else if (data.status === 404) {
                   $state.go('anonymousUrl.home', {
                     'error': data.status
                   });
                   $log.debug('Anonymous url password doesn\'t exist', data);
                 } else {
                   modalPasswordVm.invalid = false;
                   anonymousUrlVm.tableParams = anonymousUrlVm.loadTable();
                   $uibModalInstance.close();
                 }
              }).catch(function(data) {
                $log.debug('Error on password submit', data);
              });
          }
        },
        controllerAs: 'modalPasswordVm',
        templateUrl: 'modules/linshare.anonymousUrl/views/passwordModal.html'
      });
    }
  }
})();
