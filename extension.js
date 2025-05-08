// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

console.log('DEBUG: extension.js file is being read by the extension host.出现这行表示extension.js被读取了');
// 如果没有读取，可能是版本的问题。把插件要求的vscode版本降级。

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "selected-lines-counter" is now active!');

	// 1. 创建状态栏项目
	// vscode.StatusBarAlignment.Left 表示放在状态栏左侧，100 是一个排序优先级
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 101);
	context.subscriptions.push(statusBarItem); // 添加到 context.subscriptions 以便自动管理和释放

	// 2. 定义一个更新状态栏的函数
	function updateStatusBar() {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const selections = editor.selections; // 获取所有选择区

			// 检查是否有选择，并且至少有一个选择区不是空的
			if (selections && selections.length > 0 && selections.some(s => !s.isEmpty)) {
				const selectedLines = new Set();
				let activeSelectionsCount = 0; // 记录实际有内容的选择区数量

				for (const selection of selections) {
					if (!selection.isEmpty) {
						activeSelectionsCount++;
						for (let i = selection.start.line; i <= selection.end.line; i++) {
							selectedLines.add(i);
						}
					}
				}

				const lineCount = selectedLines.size;

				if (lineCount > 0) {
					statusBarItem.text = `已选: ${lineCount} 行`;
					if (activeSelectionsCount > 1) {
						statusBarItem.tooltip = `当前在 ${activeSelectionsCount} 个选择区中选中了 ${lineCount} 行文本`;
					} else {
						statusBarItem.tooltip = `当前选中了 ${lineCount} 行文本`;
					}
					statusBarItem.show();
				} else {
					// 有 selection 对象，但它们都是空的 (例如，只有光标没有选择范围)
					statusBarItem.hide();
				}
			} else {
				// 没有选择，或者有选择但都是空的 (例如初始状态或仅有光标)
				statusBarItem.hide();
			}
		} else {
			statusBarItem.hide(); // 如果没有活动的编辑器，则隐藏
		}
	}

	// 3. 监听文本选择变化事件
	context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(event => {
		// event 参数 (TextEditorSelectionChangeEvent) 包含更多细节，如果需要的话
		// 例如 event.textEditor 和 event.selections
		// 为简单起见，我们直接调用 updateStatusBar，它会检查活动编辑器
		updateStatusBar();
	}));

	// 4. 监听活动编辑器变化事件
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
		// 当活动编辑器变化时，更新状态栏
		// 此处的 'editor' 参数是新的活动编辑器 (或 undefined)
		updateStatusBar();
	}));

	// 5. 初始调用一次以设置初始状态
	updateStatusBar();
}

// This method is called when your extension is deactivated
function deactivate() {
	// 插件停用时的清理工作。
	// 由于我们把 statusBarItem 和事件监听器都添加到了 context.subscriptions，
	// VS Code 会自动处理它们的释放。
}

module.exports = {
	activate,
	deactivate
}
