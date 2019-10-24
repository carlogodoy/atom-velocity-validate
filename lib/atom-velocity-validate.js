'use babel';

import AtomVelocityValidateView from './atom-velocity-validate-view';
import { CompositeDisposable } from 'atom';

export default {
  packagename: 'atom-velocity-validate',
  atomVelocityValidateView: null,
  modalPanel: null,
  subscriptions: null,
  menuItem: null,
  contextMenu: null,

  config: {
  RepoPath: {
    type: 'string',
    title: 'Repo Path',
    description: 'All Jars, preload files must be found in this directory.',
    default: '',
    order: 1
  },
  VelocityJar: {
    type: 'string',
    title: 'Velocity Jar file name.',
    description: 'Velocity Jar, assumes file can be found under RepoPath.',
    default: 'velocity-validator-1.0.jar',
    order: 2
  },
  ExternalJarList: {
    type: 'string',
    title: 'External Jars filenames list, colon delimited',
    description: 'Semi-colon delimited list of Jars, assumes files can be found under RepoPath.',
    default: '',
    order: 3,
  },
  ObjectVars: {
    type: 'string',
    title: 'Preload Object Vars',
    description: 'Format var_name: fully_qualified_class_name> ; ...  Example var1:org.domain.name.TheClassName;var1:org.ee.AnotherClass',
    default: '',
    order: 4,
  },
},
  activate(state) {
    if(this.atomVelocityValidateView)
      this.atomVelocityValidateView.refreshFile();

    this.menuItem = new CompositeDisposable();

    var hide = () => {
        this.modalPanel.hide();
    }

    this.atomVelocityValidateView = new AtomVelocityValidateView(state.atomVelocityValidateViewState);

    //this.modalPanel = atom.workspace.addModalPanel({
    this.modalPanel = atom.workspace.addRightPanel({
      item: this.atomVelocityValidateView.getElement(),
      visible: false
    });

    this.atomVelocityValidateView.setParentPanel(this.modalPanel);

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-velocity-validate:toggle': () => this.toggle()
    }));

    //var commandBindings = {};
    //this.createContextMenu([{commandName:"validate", commandLabel: "validate"},{commandName: "compile", commandLabel: "compile"}]);
  },

  deactivate() {
    this.menuItem.dispose();
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomVelocityValidateView.destroy();
  },

  serialize() {
    return {
      atomVelocityValidateViewState: this.atomVelocityValidateView.serialize()
    };
  },

  toggle() {
    console.log('AtomVelocityValidate was toggled!');
    this.atomVelocityValidateView.refreshFile();
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  },

  createContextMenu_delete(commandArray) {
  if (this.contextMenu) {
    while (this.contextMenu.length > 0) {
      this.contextMenu.pop();
    }
  }
  var availableCommands = [];
  this.contextMenu = availableCommands;
  for (var i = 0; i < commandArray.length; i++) {
    availableCommands.push({
        label: commandArray[i].commandLabel,
        command: commandArray[i].commandName
    });
  }
  availableCommands.push({
      type: 'separator'
  });
  availableCommands.push({
      label: 'Reload command',
      command: this.packagename + ':reload-command',
  });
  availableCommands.push({
      label: 'View command directory',
      command: this.packagename + ':view-command-folder',
  });
  availableCommands.push({
      label: 'View command sample directory',
      command: this.packagename + ':view-sample-folder',
  });
  this.menuItem.add(atom.contextMenu.add({
    'atom-text-editor': [{
      label: 'Apply command',
      submenu: availableCommands,
    }],
  }));
}
}
