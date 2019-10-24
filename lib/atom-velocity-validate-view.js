'use babel'
import { CompositeDisposable, Directory } from 'atom'


var Atom = require('atom');
var BufferedProcess = Atom.BufferedProcess;

export default class AtomVelocityValidateView {


  wordwrap( str, width, brk, cut ) {

       brk = brk || 'n';
       width = width || 75;
       cut = cut || false;

       if (!str) { return str; }

       var regex = '.{1,' +width+ '}(\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\S+?(\s|$)');

       return str.match( RegExp(regex, 'g') ).join( brk );

   }

   getVelocityJarPathFromConfig(){
     var vjar = atom.config.get('atom-velocity-valida te.VelocityJar');
     console.log('getVelocityJarPathFromConfig, vjar=' + vjar);

     var repo = this.getRepoPathFromConfig();
     if(!repo) {
       console.log('getVelocityJarPathFromConfig, repo was null');
       return "";
     }

     vjar = vjar ? vjar : this.CONST_VELOCITY_JAR_DEFAULT;
     var vpath = repo + '/' + vjar;
     console.log('getVelocityJarPathFromConfig, vpath=' + vpath)
     return vpath;
   }

   getRepoPathFromConfig(){
     var v = atom.config.get('atom-velocity-validate.RepoPath');
     console.log('getRepoPathFromConfig:' + v)
     return v;
   }

   getExternalJarListFromConfig(){
     var v = atom.config.get('atom-velocity-validate.ExternalJarList');
     // v = '/workspace/dev/velocity/sli-common-0.3.3.jar:/workspace/dev/velocity/sal-core-api-1.8.2.jar:/workspace/dev/velocity/sal-common-api-1.8.2.jar:/workspace/dev/velocity/mdsal-dom-api-2.5.2.jar';
     console.log('getExternalJarListFromConfig:' + v)
     return v;
   }
   getFormattedExternalJarListFromConfig(){
     var v = this.getExternalJarListFromConfig();
     var repo = this.getRepoPathFromConfig();
     //console.log("before split v="+v);

     if(!v || !repo) return;

     var list = v.split(':');
     var rtn = "";
     var delim = "";
     for(var i=0;i<list.length;i++){
       rtn += delim + repo + '/' + list[i];
       delim = ":";
     }
     return rtn;
   }

   getObjectVarsFromConfig(){
     var v = atom.config.get('atom-velocity-validate.ObjectVars');
     console.log('getObjectVarsFromConfig : ' + v)
     return v;
   }


  constructor(serializedState) {

    var TESTING_LOCAL_DEV = false;

    this.CONST_VELOCITY_JAR_DEFAULT = 'velocity-validator-1.0.jar';

    this.velocityFileExportTbWasSet = false;

    // Jar config stuff

    this.subscriptions = new CompositeDisposable()

    // this.setVelocityJarFromConfig(); // get config setting
    // this.velocityValidatorJarPath = "";

    //if(TESTING_LOCAL_DEV)
    //  this.velocityValidatorJarPath = '';//'/workspace/dev/velocity/velocity-validator/target/dist/velocity-validator-1.0.jar';

    this.fontSize = 20;

    //this.subscriptions.add(atom.config.onDidChange('atom-velocity-validate.velocityValidatorJarPath', () => {
    //  this.setVelocityJarFromConfig()
    //}))


    var jarLabel = document.createElement('label');
    jarLabel.innerHTML = '<bold>velocity-validator Jar file or Repo Path are not configured.</bold>';
    var jarLabel2 = document.createElement('label');
    jarLabel2.innerHTML = '<bold>To use this plugin please select velocity-validator Jar file:</bold>';

    this.jarInput = document.createElement('input');
    this.jarInput.id = 'jarInput';
    this.jarInput.type = 'file';
    // preloadInput.style.display = 'none';

    var jarAutoAssignLabel = document.createElement('label');
    jarAutoAssignLabel.innerHTML = 'Auto assign settings';
    jarAutoAssignLabel.for = 'jarAutoAssignCb';

    this.jarAutoAssignCb = document.createElement('input');
    this.jarAutoAssignCb.id = 'jarAutoAssignCb';
    this.jarAutoAssignCb.classList.add('atom-velocity-validate');
    this.jarAutoAssignCb.classList.add('pull-left');
    this.jarAutoAssignCb.value = "";
    this.jarAutoAssignCb.type = "checkbox";
    this.jarAutoAssignCb.checked = true;
    this.jarAutoAssignCb.style.marginLeft = '10px';
    this.jarAutoAssignCb.style.marginRight = '10px';

    setVelocityJarConfigValue = (t) => {
      this.setVelocityJarConfigValue(t);
    }

    this.jarInput.onchange = e => {
         var file = e.target.files[0];
         console.log("Jar Dialog select file=>");
         console.log(file);
         setVelocityJarConfigValue(file.name); //file.path);
         if(this.jarAutoAssignCb.checked){
           var p = file.path.substring(0, Math.max(file.path.lastIndexOf("/"), file.path.lastIndexOf("\\")));
           console.log('jarInput, onchange, Repo path:'+p);
           atom.config.set('atom-velocity-validate.RepoPath',p);
           var d = new Directory(p,false);
           d.getEntries(repoEntriesCb);
           this.toggleJarConfigView();
         }
    }

    repoEntriesCb = (error,entries) =>{
      console.log("repoEntriesCb, error, entries =>")
      console.log(error);
      console.log(entries);
      if(entries!=null && entries.length>0){
        var extjars = "";
        var delim="";
        for(var i=0;i<entries.length;i++){
          //var p = this.velocityFile.substring(0, Math.max(this.velocityFile.lastIndexOf("/"), this.velocityFile.lastIndexOf("\\")));
          var b = entries[i].getBaseName();
          if(b.endsWith(".jar")){
            if(b.indexOf("velocity-validator")>-1) continue; // skip the velocity-validator jar
            console.log("repoEntriesCb, entries baseName =>" + b);
            extjars += delim + b;
            delim = ":";
          }
        }
        console.log("repoEntriesCb, entries ext jars =>" + extjars);
        if(this.jarAutoAssignCb.checked)
          atom.config.set('atom-velocity-validate.ExternalJarList',extjars);
      }
    }

    this.jarDiv = document.createElement('div');
    this.jarDiv.style.marginLeft = '40px';
    this.jarDiv.style.fontSize = "20px";

    this.jarDiv.appendChild(document.createElement('br'));
    this.jarDiv.appendChild(document.createElement('br'));
    this.jarDiv.appendChild(jarLabel);
    this.jarDiv.appendChild(document.createElement('br'));
    this.jarDiv.appendChild(jarLabel2);
    this.jarDiv.appendChild(document.createElement('br'));
    this.jarDiv.appendChild(document.createElement('br'));

    this.jarDiv.appendChild(this.jarInput);

    this.jarDiv.appendChild(document.createElement('br'));

    jarAutoAssignLabel.appendChild(this.jarAutoAssignCb);
    this.jarDiv.appendChild(jarAutoAssignLabel);

    const wordwrap = ( str, width, brk, cut ) => {

         brk = brk || 'n';
         width = width || 75;
         cut = cut || false;

         if (!str) { return str; }

         var regex = '.{1,' +width+ '}(\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\S+?(\s|$)');

         return str.match( RegExp(regex, 'g') ).join( brk );

     }

     refreshFile = () =>{
       this.refreshFile();
     }
     atom.workspace.onDidChangeActiveTextEditor(refreshFile);



    showOutput = (t) => {
      this.showOutput(t);
         //this.outputDiv.innerHTML = this.output;
       }

   runValidate = () => {
     this.runValidate();
        //this.outputDiv.innerHTML = this.output;
      }

      runCompile = () => {
        this.runCompile();
      }

    hide = () => {
      this.hide();
    }

    decreaseFont = () => {
      this.decreaseFont();
    }

    increaseFont = () => {
      this.increaseFont();
    }

    clear = () => {
      this.clear();
    }

    clearPreload = () => {
      this.clearPreload();
    }


    this.output = "...";
    // Create root element
    this.parentElement = document.createElement('div');
    this.parentElement.classList.add('atom-velocity-validate');

    //const item = atom.workspace.getActivePaneItem();
    //console.log("ActivePane=>")
    //console.log(item);
    //console.log("ActivePane, buffer.file.path =>")
    //console.log(item.buffer.file.path);


    //var t = item.buffer.getText();
    //console.log("ActivePane, buffer.getText =>")
    //console.log(t);

    //this.tmpFilename = item.buffer.file.path;// + ".tmp.validate.vm";
    //console.log("ActivePane, tmpFilename =>")
    //console.log(this.tmpFilename);

    // Create titleDiv element
    const titleDiv = document.createElement('div');
    titleDiv.style.marginLeft = '40px';

    // titleDiv.textContent = 'The AtomVelocityValidate package is Alive! It\'s ALIVE! <br> But what happens with a miuch longer thingy';
    //var text = 'The AtomVelocityValidate package is Alive! It\'s ALIVE! <br> ';
    //text += 'But what happens with a miuch longer thingy <br>';
    //text += t;

    console.log("hereA");
    //var text = wordwrap(t,70,'<br>')
    var text = wordwrap("<br><br> #######################################",70,'<br>')
    text += wordwrap("<br>|_________________Velocity Evaluator__________________|",70,'<br>')
    text += "<br><br>"
    // text += wordwrap("<br>|-------------------------------------------------|<br>",70,'<br>')
    titleDiv.innerHTML = text;
    titleDiv.style.fontSize = "16px";
    console.log("hereB");
    console.log("titleDiv =>")
    console.log(titleDiv);

    //this.headerDiv.appendChild(titleDiv);
    this.parentElement.appendChild(titleDiv);

    this.parentElement.appendChild(this.jarDiv);


    // titleDiv.innerHTML += "<br>Velocity file: <br>";
    // titleDiv.innerHTML += item.buffer.file.path;
    //titleDiv.innerHTML += "<br><br>Errors:<br>";

    //const end = document.createElement('div');
    //end.innerHTML = "<br>end</br>";

    this.headerDiv = document.createElement('div');
    this.headerDiv.padding = '20px';
    //this.headerDiv.margin = '20px';
    this.headerDiv.style.marginLeft = '40px';
    this.headerDiv.style.marginRight = '40px';
    this.parentElement.appendChild(this.headerDiv);


    this.toolbarSpan = document.createElement('span');
    //this.toolbarSpan.padding = '20px';
    //this.toolbarSpan.margin = '20px';
    this.headerDiv.appendChild(this.toolbarSpan);

    this.validateButton = document.createElement('input');
    this.validateButton.padding = '10px';
    this.validateButton.margin = '10px';
    this.validateButton.classList.add('atom-velocity-validate');
    this.validateButton.value = "VALIDATE";
    this.validateButton.type = "button";
    this.toolbarSpan.appendChild(this.validateButton);
    console.log("this.button=>");
    console.log(this.validateButton);
    this.validateButton.onclick = runValidate;

    this.compileButton = document.createElement('input');
    this.compileButton.classList.add('atom-velocity-validate');
    this.compileButton.value = "EVALUATE";
    this.compileButton.type = "button";
    this.toolbarSpan.appendChild(this.compileButton);
    console.log("this.button=>");
    console.log(this.compileButton);
    this.compileButton.onclick = runCompile;

    //this.brDiv = document.createElement('div');
    //this.brDiv.classList.add('atom-velocity-validate');
    //this.brDiv.innerHTML = "<br>";
    //this.headerDiv.appendChild(this.brDiv);

    this.plusButton = document.createElement('input');
    this.plusButton.classList.add('atom-velocity-validate');
    this.plusButton.value = "+";
    this.plusButton.type = "button";
    this.plusButton.onclick = increaseFont;
    this.toolbarSpan.appendChild(this.plusButton);

    this.minusButton = document.createElement('input');
    this.minusButton.classList.add('atom-velocity-validate');
    this.minusButton.value = "-";
    this.minusButton.type = "button";
    this.minusButton.onclick = decreaseFont;
    this.toolbarSpan.appendChild(this.minusButton);

    this.clearButton = document.createElement('input');
    this.clearButton.classList.add('atom-velocity-validate');
    this.clearButton.value = "Clear";
    this.clearButton.type = "button";
    this.clearButton.onclick = clear;
    this.toolbarSpan.appendChild(this.clearButton);

    this.toggleButton = document.createElement('input');
    this.toggleButton.classList.add('atom-velocity-validate');
    this.toggleButton.value = "HIDE";
    this.toggleButton.type = "button";
    this.toggleButton.onclick = hide;
    this.toolbarSpan.appendChild(this.toggleButton);
    console.log("this.button=>");
    console.log(this.toggleButton);


    //this.outputHeaderDiv = document.createElement('div');
    //this.outputHeaderDiv.classList.add('atom-velocity-validate');
    //this.outputHeaderDiv.innerHTML = "<br><br>Output=>";
    //this.parentElement.appendChild(this.outputHeaderDiv);

    this.headerDiv.append(document.createElement('br'));
    this.headerDiv.append(document.createElement('br'));

    /*
    this.preloadTb = document.createElement('input');
    this.preloadTb.classList.add('atom-velocity-validate');
    this.preloadTb.value = "";
    this.preloadTb.type = "text";
    this.preloadTb.style.width = '50%';
    this.preloadTb.style.marginLeft = '10px';
    //this.velocityFileExportTb.onclick = clear;
    */

    var preloadLabel = document.createElement('label');
    preloadLabel.innerHTML = '<bold>Use Preload file:</bold>';

    this.preloadCb = document.createElement('input');
    this.preloadCb.classList.add('atom-velocity-validate');
    this.preloadCb.value = "";
    this.preloadCb.type = "checkbox";
    //this.preloadCb.style.width = '50%';
    this.preloadCb.style.marginLeft = '10px';


    var clearpreloadTable = document.createElement('table');
    // Create an empty <tr> element and add it to the 1st position of the table:
    var row = clearpreloadTable.insertRow(0);
    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    clearpreloadTable.style.display = 'none'; // start hidden
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);

    this.preloadFile = "";

    this.preloadInput = document.createElement('input');
    this.preloadInput.id = 'preloadInput';
    this.preloadInput.type = 'file';
    // preloadInput.style.display = 'none';

    setPreloadTbValue = (t) => {
      this.setPreloadTbValue(t);
    }

    this.preloadInput.onchange = e => {
         var file = e.target.files[0];
         console.log("Preload Dialog select file=>");
         console.log(file);
         setPreloadTbValue(file.path);
    }

    /*this.clearpreloadButton = document.createElement('input');
    this.clearpreloadButton.classList.add('atom-velocity-validate');
    this.clearpreloadButton.value = "Clear";
    this.clearpreloadButton.type = "button";
    this.clearpreloadButton.onclick = clearPreload;
    */

  /*  this.selpreloadButton = document.createElement('input');
    this.selpreloadButton.classList.add('atom-velocity-validate');
    this.selpreloadButton.value = "browse";
    this.selpreloadButton.type = "button";
    this.selpreloadButton.onclick = e = () =>{
      selpreloadButton.click();
    };
    this.footerDiv.appendChild(this.selfileButton);
*/

    this.preloadCb.onclick = () =>{
        clearpreloadTable.style.display = this.preloadCb.checked ? 'inline' : 'none';
    }


    //this.headerDiv.appendChild(this.preloadTb);
    this.headerDiv.appendChild(preloadLabel);
    this.headerDiv.appendChild(this.preloadCb);

    //this.headerDiv.appendChild(this.preloadInput);
    //this.headerDiv.appendChild(this.clearpreloadButton);
    this.headerDiv.append(clearpreloadTable);
    cell1.appendChild(this.preloadInput);
    //cell2.appendChild(this.clearpreloadButton);
    cell2.style.textAlign= 'right';

    this.exportCb = document.createElement('input');
    this.exportCb.classList.add('atom-velocity-validate');
    this.exportCb.value = "";
    this.exportCb.type = "checkbox";
    this.exportCb.style.width = '50%';
    this.exportCb.style.marginLeft = '10px';

    this.headerDiv.append(document.createElement('br'));
    this.headerDiv.append(document.createElement('br'));

    var outputLabel = document.createElement('label');
    outputLabel.innerHTML = '<bold>Write Eval to file:</bold>';

    this.headerDiv.append(outputLabel);
    this.headerDiv.append(this.exportCb);

    this.exportDiv = document.createElement('div');
    this.exportDiv.style.display = 'none';
    //this.exportDiv.padding = '20px';
    //this.exportDiv.margin = '20px';
    //this.exportDiv.style.marginLeft = '40px';
    //this.exportDiv.style.marginRight = '40px';
    this.headerDiv.appendChild(this.exportDiv);

    this.exportDiv.append(document.createElement('br'));
    //this.exportDiv.append(document.createElement('br'));

    const doExportToFile = () => {
      this.doExportToFile();
    }

    //this.exportButton = document.createElement('input');
    //this.exportButton.classList.add('atom-velocity-validate');
    //this.exportButton.value = "Export";
    //this.exportButton.type = "button";
    //this.exportButton.onclick = doExportToFile;
    //this.exportDiv.appendChild(this.exportButton);

    this.selfileButton = document.createElement('input');
    this.selfileButton.classList.add('atom-velocity-validate');
    this.selfileButton.value = "browse";
    this.selfileButton.type = "button";
    this.selfileButton.style.marginLeft = '10px';
    this.selfileButton.onclick = e = () =>{
      exportInput.click();
    };
    this.exportDiv.appendChild(this.selfileButton);



    this.velocityFileExportTb = document.createElement('input');
    this.velocityFileExportTb.classList.add('atom-velocity-validate');
    //this.velocityFileExportTb.value = "";
    this.velocityFileExportTb.type = "text";
    this.velocityFileExportTb.style.width = '50%';
    this.velocityFileExportTb.style.marginLeft = '10px';
    //this.velocityFileExportTb.onclick = clear;
    this.velocityFileExportTb.onchange = e => {
        this.velocityFileExportTbWasSet = true;
        console.log("exportTb, onChange invoked:" + this.velocityFileExportTb.value);
        this.velocityFileExport = this.velocityFileExportTb.value;
        console.log("exportTb onchange, velocityFileExportTb vs velocityFileExport:" + this.velocityFileExportTb.value + " <=> " + this.velocityFileExport);
    }


    var exportInput = document.createElement('input');
    exportInput.type = 'file';
    exportInput.name = 'fileinput';
    exportInput.id = 'fileinput';
    //input.classList.add('hide');
    exportInput.style.display = 'none';

    exportInput.onchange = e => {
         var file = e.target.files[0];
         this.setExportTbValue(file.path);
         console.log("Dialog select file=>");
         console.log(file);
    }

    this.exportCb.onclick = () =>{
        // this.setExportTbValue(this.velocityFileExport);
        this.velocityFileExportTbWasSet = false;
        this.refreshFile();
        this.exportDiv.style.display = this.exportCb.checked ? 'inline' : 'none';
    }

    this.exportDiv.appendChild(this.velocityFileExportTb);
    this.exportDiv.appendChild(exportInput);
    this.exportDiv.append(document.createElement('br'));
    var output2Label = document.createElement('label');
    output2Label.innerHTML = '.export is automatically appended to the file name';
    this.exportDiv.append(output2Label);

    this.headerDiv.append(document.createElement('br'));
    this.headerDiv.append(document.createElement('br'));


    this.velocityFileDiv = document.createElement('div');
    console.log("new velocityFileDiv was created");
    refreshFile();
    this.velocityFileDiv.classList.add('atom-velocity-validate');
    this.velocityFileDiv.innerHTML = "<br>VelocityFile:<br>" + this.velocityFile;
    this.headerDiv.appendChild(this.velocityFileDiv);

    this.outputDiv = document.createElement('div');
    //this.outputDiv.classList.add('output-text');
    this.outputDiv.innerHTML = "...";
    this.outputDiv.style.fontSize = this.fontSize + "px";
    this.outputDiv.style.height ='50%'; //'100px';
    this.outputDiv.style.overflow ='scroll';
    this.outputDiv.style.backgroundColor ='#401919';//'darkGray'; //'#4F4F4F'; //'#1c1c1c';
    this.outputDiv.style.margin ='10px';
    this.outputDiv.style.padding ='10px';

    this.parentElement.appendChild(this.outputDiv);
/*
    this.footerDiv = document.createElement('div');
    this.footerDiv.padding = '20px';
    this.footerDiv.margin = '20px';
    this.footerDiv.style.marginLeft = '40px';
    this.footerDiv.style.marginRight = '40px';
    this.parentElement.appendChild(this.footerDiv);
*/

    //this.footerDiv.appendChild(this.velocityFileExportTb);
    //this.footerDiv.appendChild(input);

    this.toggleJarConfigView();

  } // end constructor

  toggleJarConfigView(){
    console.log("toggleJarConfigView invoked");
    //var repo = atom.config.get('velocity-validate.RepoPath');
   //var vjar = atom.config.get('velocity-validate.VelocityJar');
    //console.log("toggleJarConfigView, repo:" + repo);
    //console.log("toggleJarConfigView, vjar:" + vjar);

    var vjar = this.getVelocityJarPathFromConfig();
    var repo = this.getRepoPathFromConfig();

    var jarPathOk = (repo != "");

    var v = jarPathOk ?  'inline' : 'none';
    var jarV = v == 'inline' ? 'none' : 'inline';
    this.headerDiv.style.display = v;
    //this.outputDiv.style.display = v;
    this.jarDiv.style.display = jarV;
  }

  doExportToFile(){
    console.log("Trying to write to file:" + this.velocityFileExportTb.value);
    var f = new File([this.velocityFileExportTb.value],false);
    console.log("doExportToFile, f=>")
    console.log(f);
    if(f.existsSync && confirm("File exists, Are you sure you want to overwrite this file?") ) {
      console.log("file exists");
    }else{
      console.log("file does not exist");
      var p = f.create;
      f.write("testing");
      f.close();

    }
  }

  setExportTbValue(t){
    console.log("setExportTbValue invoked")
    if(this.velocityFileExportTb){
      var v = t;
      if(!v.endsWith(".export")){
        v += ".export";
      }

      this.velocityFileExportTb.value = v
      this.velocityFileExport = v;
      console.log("setExportTbValue, velocityFileExportTb vs velocityFileExport:" + this.velocityFileExportTb.value + " <=> " + this.velocityFileExport);
    }
  }

  setPreloadTbValue(t){
    console.log('setPreloadTbValue invoked');
    //if(this.preloadTb){
    //  this.preloadTb.value = t;
      this.preloadFile = t;
      //this.getPreloadFileContent(); // this is temp, to test it
  //  }
  }

  getPreloadFileContent(){
    //var openFile = function(event) {
    //var input = event.target;

    var reader = new FileReader();
    reader.onload = function(){
      var text = reader.result;
      this.preloadFileContent = text;
      //console.log(reader.result.substring(0, 200));
      console.log('getPreloadFileContent, onload, result=>');
      console.log(text);
    };
    var f = new File([this.preloadFile],false)
    reader.readAsText(f);
  //};

  }

  getPreloadFileContent_no(){
    if(this.preloadFile=='')
      return "";

    var f = new File([this.preloadFile],false);
    var s = f.readSync;
    console.log("getPreloadFileContent=>")
    console.log(s);
  }

   refreshFile(){
     console.log("refreshFile invoked");
     if(!this.velocityFileDiv) return;

     const item = atom.workspace.getActivePaneItem();

     if(item==null || item.buffer == null || item.buffer.file == null) return;

     this.velocityFile = item.buffer.file.path!=null ? item.buffer.file.path : "";



     if(!this.velocityFileExportTbWasSet){// don't overwrite what the user just changed

       this.velocityFileExport = this.velocityFile + ".export.vm";

       if(this.velocityFileExportTb){
         this.velocityFileExportTb.value = this.velocityFileExport;
       }
       //console.log("atom buffer=>");
       //console.log(atom.buffer);
       //console.log("refreshFile velocityFile:" + this.velocityFile);

       var useText = this.wordwrap(this.velocityFile,50,'<br>');

       // this.velocityFileDiv.innerHTML = "<br>Velocity file: <br>" + this.velocityFile;
       this.velocityFileDiv.innerHTML = "<br>Velocity file: <br>" + useText;
       //this.setExportTbValue(this.velocityFileExport);

       if(this.velocityFileExportTb){
         console.log("refreshFile, velocityFileExportTb vs velocityFileExport:" + this.velocityFileExportTb.value + " <=> " + this.velocityFileExport);
       }
     }else{
       console.log("refreshFile, velocityFileExportTb & velocityFileExport not updated since velocityFileExportTbWasSet was true");
     }
   }

   showOutput(text){

    const testWhite = (x) => {
        var white = new RegExp(/^\s$/);
        return white.test(x.charAt(0));
    };

   const wordwrap = (str, maxWidth) => {
          //var newLineStr = '</pre><br><pre lang="xml">'; done = false; res = '<pre lang="xml">';
          //var newLineStr = "<br>"; done = false; res = '';
          var newLineStr = "\n"; done = false; res = '';

          while (str.length > maxWidth) {
              found = false;
              // Inserts new line at first whitespace of the line
              for (i = maxWidth - 1; i >= 0; i--) {
                  if (testWhite(str.charAt(i))) {
                      res = res + [str.slice(0, i), newLineStr].join('');
                      str = str.slice(i + 1);
                      found = true;
                      break;
                  }
              }
              // Inserts new line at maxWidth position, the word is too long to wrap
              if (!found) {
                  res += [str.slice(0, maxWidth), newLineStr].join('');
                  str = str.slice(maxWidth);
              }

          }

          return res + str;// + "</pre>";
      }



     console.log("showOutput="+text);
     var useText = text;
     if(useText == ""){
       useText = this.output;
     }

     this.output = this.output.replace("\n","<br>");

     //this.fontSize = 5;
     //this.output = useText; // wordwrap3(useText,70,"<br>");
     this.output = wordwrap(useText,70);
     //this.output = "<xmp>"+this.output.replace("\n","</xmp><br><xmp>");
     //this.output = "<xmp>"+this.output.replace("\n","</xmp><br><xmp>");
     //this.output = this.output.replace("\n","<br>");

     // this.outputDiv.innerHTML = "<font size=" + this.fontSize + "><xmp>" + this.output + "</xmp></font>";
     //this.outputDiv.innerText = "<font size=" + this.fontSize +  ">" + this.output + "</font>";
     this.outputDiv.innerText = this.output;
     this.outputDiv.style.fontSize = this.fontSize + "px";
   }

   increaseFont(){
     this.fontSize += 3;
     //this.outputDiv.innerText = "<font size=" + this.fontSize + ">" + this.output + "</font>";
     this.outputDiv.style.fontSize = this.fontSize + "px";
   }

   decreaseFont(){
     this.fontSize -= 3;
     //this.outputDiv.innerText = "<font size=" + this.fontSize + ">" + this.output + "</font>";
     this.outputDiv.style.fontSize = this.fontSize + "px";
   }

   clear(){
     this.output = " ";
     this.outputDiv.innerText = " ";
   }

   clearPreload(){
     this.preloadInput.value = '';
   }

   hide(){
     // this.hide();
     this.parentPanel.hide();
   }



  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.subscriptions.dispose()
    this.parentElement.remove();
  }

  getElement() {
    return this.parentElement;
  }

  writeTmpFile(s){

  }

  setHide(f){
    console.log("setHide invoked");
    this.hide = () => {
      console.log("Request hide");
      f();
    }
  }

  setParentPanel(p){
    console.log("setParentPanel invoked=>");
    console.log(p);
    this.parentPanel = p
    console.log(this.parentPanel);
  }

  runCmdCallback(result){
    this.newE = document.createElement('div');
    this.newE.classList.add('atom-velocity-validate');
    this.newE.innerHTML = result;
    this.parentElement.appendChild(this.newE);
    console.log("this.newE=>");
    console.log(this.newE);
  }

  runValidate(){
    refreshFile();
    //var command = '/bin/ls';
    var command = '/usr/bin/java';

    console.log("runValidate, thie.velocityFile=>");
    console.log(this.velocityFile);
    var p = this.velocityFile.substring(0, Math.max(this.velocityFile.lastIndexOf("/"), this.velocityFile.lastIndexOf("\\")));

    console.log("Path=>");
    console.log(p);

    //args = ['-jar /workspace/dev/velocity/velocity-validator/target/dist/velocity-validator-1.0-SNAPSHOT.jar -file=' + this.tmpFilename];
    // args = ['-jar' , '/workspace/dev/velocity/velocity-validator/target/dist/velocity-validator-1.0-SNAPSHOT.jar', '-file='+ this.tmpFilename];
    //args = ['-jar' , '/workspace/dev/velocity/velocity-validator/target/dist/velocity-validator-1.0.jar', '-file='+ this.velocityFile];


    // args = ['-jar' , this.velocityValidatorJarPath, '-file='+ this.velocityFile];
    var useVelocityValidatorJarPath = this.getVelocityJarPathFromConfig();
    args = ['-jar' , useVelocityValidatorJarPath, '-file='+ this.velocityFile];

    //options = ['-file=' + this.tmpFilename];
    options = {
      //cwd: this.getCommandDirectory(),
      //cwd: '/workspace/dev/velocity/velocity-validator/target/dist'
      cwd: p
    };

    this.runCommand(command, args, options, "validate-velocity", showOutput);
  }

  runCompile(){
    console.log('runCompile invoked');
    refreshFile();
    //var command = '/bin/ls';
    var command = '/usr/bin/java';
    //args = ['-jar /workspace/dev/velocity/velocity-validator/target/dist/velocity-validator-1.0-SNAPSHOT.jar -file=' + this.tmpFilename];
    // args = ['-jar' , '/workspace/dev/velocity/velocity-validator/target/dist/velocity-validator-1.0-SNAPSHOT.jar', '-file='+ this.tmpFilename];
    // args = ['-jar' , '/workspace/dev/velocity/velocity-validator/target/dist/velocity-validator-1.0.jar', '-file='+ this.velocityFile, '-compile'];

    var useVelocityValidatorJarPath = this.getVelocityJarPathFromConfig();
    var useExternalJars = this.getFormattedExternalJarListFromConfig();
    useExternalJars = this.getFormattedExternalJarListFromConfig();
    var useExternalVars = this.getObjectVarsFromConfig();
    var usePreloadTemplate = this.getPreloadTemplate();
    var useRepo = this.getRepoPathFromConfig();
    console.log("runCompile, usePreloadTemplate:" + usePreloadTemplate);

//    args = ['-jar' , this.velocityValidatorJarPath,
    args = ['-jar' , useVelocityValidatorJarPath,
            '-file='+ this.velocityFile, '-eval',
            //'-preloadJars="/workspace/dev/velocity/sli-common-0.3.3.jar:/workspace/dev/velocity/sal-core-api-1.8.2.jar:/workspace/dev/velocity/sal-common-api-1.8.2.jar:/workspace/dev/velocity/mdsal-dom-api-2.5.2.jar"',
            //'-preloadVars="ctx:org.onap.ccsdk.sli.core.sli.SvcLogicContext"'
          ];

    if(useExternalJars){
      args.push('-preloadJars=' + useExternalJars);
    }
    if(useExternalVars){
      args.push('-preloadVars=' + useExternalVars);
    }
    if(usePreloadTemplate){
      args.push('-preloadTemplate=' + usePreloadTemplate);
    }


    if(this.exportCb.checked && this.velocityFileExport != ""){
      args.push('-outputFile=' + this.velocityFileExport);
    }

    console.log("runCompile, args=>");
    console.log(args);

    //options = ['-file=' + this.tmpFilename];
    options = {
      //cwd: this.getCommandDirectory(),
      //cwd: '/workspace/dev/velocity/velocity-validator/target/dist'
      cwd: useRepo
    };

    this.runCommand(command, args, options, "validate-velocity", showOutput);
  }

setVelocityJarConfigValue(t){
  console.log('setVelocityJarConfigValue: '+ t);
  if(t==""){
      return;
    }
    //this.velocityValidatorJarPath = t;
    atom.config.set('atom-velocity-validate.VelocityJar',t);
    this.toggleJarConfigView();
  }

  //setVelocityJarFromConfig_delete(){
    //this.velocityValidatorJarPath = this.getVelocityJarPathFromConfig(); //atom.config.get('atom-velocity-validate.velocityValidatorJarPath')
  //}

  hide(){
    // this.hide();
    this.parentPanel.hide();
  }

  getPreloadTemplate(){
    return this.preloadFile;
  }

  runCommand(command, args, options, text, callback) {
  //info.metadata.command;
  console.log("runCommand got args=>");
  console.log(args);

  //var args ={}; //info.metadata.args;
  var output = [];
  var bp = new BufferedProcess({
    command: command,
    args: args,
    options: options //{
      //cwd: this.getCommandDirectory(),
      //cwd: '/workspace/dev/velocity/velocity-validator/target/dist'
    //}
    ,
    stdout: function (data) { output.push(data); },
    stderr: function (data) { output.push(data); },
    exit: function (code) {
      //console.log("runCommand output=>");
      //console.log(output.join(""));
      if (0 < code) {
        console.log("runCommand error, code:" + code);
        //output.push("Error?: cmd:" + command + " " + args); //.join(" "));
      }
      callback(output.join(""));
    },
  });
  bp.process.stdin.end(text, 'utf8');
}




}
