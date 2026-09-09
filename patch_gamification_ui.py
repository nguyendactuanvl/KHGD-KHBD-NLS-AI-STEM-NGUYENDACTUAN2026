import re

with open("src/pages/Gamification.tsx", "r") as f:
    code = f.read()

# Add dialog UI
dialog_ui = """
      {/* Custom Dialog */}
      {dialog?.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{dialog.title}</h3>
              <p className="text-slate-600 text-sm mb-4">{dialog.message}</p>
              {dialog.type === 'prompt' && (
                <input
                  type="text"
                  autoFocus
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  defaultValue={dialog.defaultValue}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      dialog.onConfirm?.((e.target as HTMLInputElement).value);
                      setDialog(null);
                    }
                  }}
                  id="dialog-prompt-input"
                />
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              {(dialog.type === 'confirm' || dialog.type === 'prompt' || dialog.type === 'confirm_upload') && (
                <button
                  onClick={() => {
                    dialog.onCancel?.();
                    setDialog(null);
                  }}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {dialog.type === 'confirm_upload' ? 'Thêm nối tiếp' : 'Hủy bỏ'}
                </button>
              )}
              <button
                onClick={() => {
                  if (dialog.type === 'prompt') {
                    const val = (document.getElementById('dialog-prompt-input') as HTMLInputElement)?.value;
                    dialog.onConfirm?.(val);
                  } else {
                    dialog.onConfirm?.();
                  }
                  setDialog(null);
                }}
                className={`px-4 py-2 font-medium rounded-lg transition-colors ${dialog.type === 'confirm_upload' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
              >
                {dialog.type === 'confirm_upload' ? 'Ghi đè (Xóa cũ)' : 'Đồng ý'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Clear Modal */}"""
code = code.replace("      {/* Confirm Clear Modal */}", dialog_ui)

with open("src/pages/Gamification.tsx", "w") as f:
    f.write(code)

print("patched dialog ui")
