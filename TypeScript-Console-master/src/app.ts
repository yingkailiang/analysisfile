/// <reference path="lib/ace.d.ts" />
/// <reference path="compliationService.ts" />
/// <reference path="historyProvider.ts" />

declare var chrome: any;
declare var js_beautify: any;

var historyProvider = new HistoryProvider();
var historyDebug = document.getElementById("historyIndex");

var output = ace.edit("js-output");
output.setTheme("ace/theme/chrome");
output.getSession().setUseWorker(false);
output.getSession().setMode("ace/mode/javascript");
output.setReadOnly(true);

var editor = ace.edit("ts-editor");
editor.setTheme("ace/theme/chrome");
editor.getSession().setUseWorker(false);
editor.getSession().setMode("ace/mode/typescript");
editor.getSession().setUseSoftTabs(true);



var executeConsole = () => {
    historyProvider.push(editor.getValue());
    var js = compliatiionService.compile(editor.getValue());
    chrome.devtools.inspectedWindow.eval(js, function (result, isException) { });
    editor.setValue("");
    output.setValue("");
}

var nextHistory = () => {
    var data = historyProvider.next();
    editor.setValue(data);
        
};
var prevHistory = () => {
    var data = historyProvider.previous();
    if (data != null) {
        editor.setValue(data);
    }
    
};

var compileOptions = {
    name: "compileIt",
    exec: executeConsole,
    bindKey: "Ctrl-Return|Command-Return|Shift-Return"
};

var historyBack = {
    name: "next",
    exec: prevHistory,
    bindKey: "Ctrl-Up|Command-Up|Shift-Up"
};

var historyForward = {
    name: "prev",
    exec: nextHistory,
    bindKey: "Ctrl-Down|Command-Down|Shift-Down"
};


editor.commands.addCommand(compileOptions);
editor.commands.addCommand(historyBack);
editor.commands.addCommand(historyForward);

var compliatiionService = new CompliationService();

editor.getSession().on("change", e => {
    var js = compliatiionService.compile(editor.getValue());
    output.setValue(js_beautify(js, null));
    output.selection.clearSelection();
});







